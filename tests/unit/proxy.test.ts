import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE, createAuthToken } from "@/lib/auth";
import { proxy } from "@/proxy";
import { makeRequest } from "../helpers/request";

describe("proxy auth gate", () => {
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

  it("allows public blog pages without a session", () => {
    const response = proxy(makeRequest("/blog/pneu-velo-connecte"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows the game page without a session (guests can play)", () => {
    const response = proxy(makeRequest("/jeu"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects private pages to login without a session", () => {
    const response = proxy(makeRequest("/pneu?tab=capteur"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2Fpneu%3Ftab%3Dcapteur",
    );
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

  it("redirects auth pages away for authenticated users", () => {
    const token = createAuthToken({ email: "rider@example.com", userId: 1 });
    const response = proxy(
      makeRequest("/login", {
        cookies: { [AUTH_COOKIE]: token },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/pneu");
  });
});
