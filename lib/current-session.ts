import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CurrentUserSummary = {
  id: number;
  email: string;
  displayName: string;
  initials: string;
};

export async function getCurrentAuthSession() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  return token ? verifyAuthToken(token) : null;
}

export async function getCurrentUserSummary(): Promise<CurrentUserSummary | null> {
  const session = await getCurrentAuthSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user
    .findUnique({
      where: { id: session.userId },
      select: {
        email: true,
        firstName: true,
        id: true,
        lastName: true,
      },
    })
    .catch(() => null);

  if (!user) {
    return {
      id: session.userId,
      email: session.email,
      displayName: session.email,
      initials: getInitials(session.email),
    };
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const displayName = fullName || user.email;

  return {
    id: user.id,
    email: user.email,
    displayName,
    initials: getInitials(displayName),
  };
}

function getInitials(value: string) {
  const parts = value
    .replace("@", " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "U";
}
