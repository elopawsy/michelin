import { NextResponse, type NextRequest } from "next/server";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import {
  createAuthToken,
  getAuthSessionFromRequest,
  setAuthCookie,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/user-response";

export async function POST(request: NextRequest) {
  if (getAuthSessionFromRequest(request)) {
    return jsonError("Already authenticated", 409);
  }

  let body: Record<string, unknown>;

  try {
    body = parseJsonObject(await request.json());
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const email = readString(body.email).toLowerCase();
  const password = readString(body.password);

  if (!email || !password) {
    return jsonError("Email and password are required", 422);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("Invalid credentials", 401);
  }

  const token = createAuthToken({ userId: user.id, email: user.email });
  const response = NextResponse.json({
    user: serializeUser(user),
    token,
  });

  setAuthCookie(response, token);

  return response;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
