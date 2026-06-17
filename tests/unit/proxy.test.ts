import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE, createAuthToken } from "@/lib/auth";
import { proxy } from "@/proxy";
import { makeRequest } from "../helpers/request";

describe("proxy temporary public-access mode", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "proxy-test-secret");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("allows the public home page without a session", () => {
    const response = proxy(makeRequest("/"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("allows private pages without a session", () => {
    const response = proxy(makeRequest("/pneu?tab=capteur"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows private pages with a valid auth cookie", () => {
    const token = createAuthToken({ email: "rider@example.com", userId: 1 });
    const response = proxy(
      makeRequest("/faq", {
        cookies: { [AUTH_COOKIE]: token },
      }),
    );

    expect(response.headers.get("location")).toBeNull();
  });

  it("allows auth pages for authenticated users", () => {
    const token = createAuthToken({ email: "rider@example.com", userId: 1 });
    const response = proxy(
      makeRequest("/login", {
        cookies: { [AUTH_COOKIE]: token },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
