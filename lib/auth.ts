import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth_token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export type AuthSession = {
  userId: number;
  email: string;
};

type JwtPayload = AuthSession & {
  iat: number;
  exp: number;
};

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set");
  }

  return "development-only-jwt-secret";
}

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getJwtSecret()).update(value).digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const actual = Buffer.from(sign(value));
  const expected = Buffer.from(signature);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAuthToken(session: AuthSession) {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    ...session,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${header}.${body}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAuthToken(token: string): AuthSession | null {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    return null;
  }

  const unsignedToken = `${header}.${body}`;

  if (!verifySignature(unsignedToken, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as Partial<JwtPayload>;

    if (
      typeof payload.userId !== "number" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return request.cookies.get(AUTH_COOKIE)?.value ?? null;
}

export function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const session = token ? verifyAuthToken(token) : null;

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function createDevelopmentJwtSecret() {
  return randomBytes(32).toString("base64url");
}
