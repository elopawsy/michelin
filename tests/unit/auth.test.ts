import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAuthToken,
  getTokenFromRequest,
  requireAuth,
  verifyAuthToken,
} from "@/lib/auth";
import { makeRequest } from "../helpers/request";

describe("auth token utilities", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "unit-test-secret");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("creates and verifies a signed auth token", () => {
    const token = createAuthToken({ email: "rider@example.com", userId: 12 });

    expect(verifyAuthToken(token)).toEqual({
      email: "rider@example.com",
      userId: 12,
    });
  });

  it("rejects tampered and expired tokens", () => {
    const token = createAuthToken({ email: "rider@example.com", userId: 12 });
    const tampered = token.replace(/\.[^.]+$/, ".invalid-signature");

    expect(verifyAuthToken(tampered)).toBeNull();

    vi.setSystemTime(new Date("2026-01-09T00:00:01.000Z"));

    expect(verifyAuthToken(token)).toBeNull();
  });

  it("reads bearer tokens before auth cookies", () => {
    const bearerToken = createAuthToken({
      email: "bearer@example.com",
      userId: 1,
    });
    const cookieToken = createAuthToken({
      email: "cookie@example.com",
      userId: 2,
    });
    const request = makeRequest("/api/auth/me", {
      cookies: { auth_token: cookieToken },
      headers: { authorization: `Bearer ${bearerToken}` },
    });

    expect(getTokenFromRequest(request)).toBe(bearerToken);
    expect(requireAuth(request)).toEqual({
      email: "bearer@example.com",
      userId: 1,
    });
  });

  it("throws when no valid session is present", () => {
    const request = makeRequest("/api/auth/me");

    expect(() => requireAuth(request)).toThrow("Unauthorized");
  });
});
