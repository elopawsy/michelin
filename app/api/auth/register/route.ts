import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import {
  createAuthToken,
  getAuthSessionFromRequest,
  setAuthCookie,
} from "@/lib/auth";
import { hashPassword } from "@/lib/password";
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
  const firstName = readString(body.firstName ?? body.first_name);
  const lastName = readString(body.lastName ?? body.last_name);

  if (!email || !email.includes("@")) {
    return jsonError("A valid email is required", 422);
  }

  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters", 422);
  }

  if (!firstName || !lastName) {
    return jsonError("firstName and lastName are required", 422);
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        firstName,
        lastName,
      },
    });

    const token = createAuthToken({ userId: user.id, email: user.email });
    const response = NextResponse.json(
      {
        user: serializeUser(user),
        token,
      },
      { status: 201 },
    );

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("Email is already registered", 409);
    }

    return jsonError("Unable to register user", 500);
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
