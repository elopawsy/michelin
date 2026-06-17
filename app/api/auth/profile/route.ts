import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import {
  createAuthToken,
  requireAuth,
  setAuthCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/user-response";

export async function PATCH(request: NextRequest) {
  let session: ReturnType<typeof requireAuth>;

  try {
    session = requireAuth(request);
  } catch {
    return jsonError("Unauthorized", 401);
  }

  let body: Record<string, unknown>;

  try {
    body = parseJsonObject(await request.json());
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const email = readString(body.email).toLowerCase();
  const firstName = readString(body.firstName ?? body.first_name);
  const lastName = readString(body.lastName ?? body.last_name);

  if (!email || !email.includes("@")) {
    return jsonError("A valid email is required", 422);
  }

  if (!firstName || !lastName) {
    return jsonError("firstName and lastName are required", 422);
  }

  try {
    const user = await prisma.user.update({
      data: {
        email,
        firstName,
        lastName,
      },
      where: { id: session.userId },
    });
    const response = NextResponse.json({ user: serializeUser(user) });
    const token = createAuthToken({ email: user.email, userId: user.id });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("Email is already registered", 409);
    }

    return jsonError("Unable to update user", 500);
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
