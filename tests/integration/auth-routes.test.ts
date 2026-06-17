import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeRequest } from "../helpers/request";
import { userFixture } from "../helpers/fixtures";

const mocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: mocks.prisma,
  prisma: mocks.prisma,
}));

vi.mock("@/lib/password", () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
}));

import { createAuthToken } from "@/lib/auth";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as meGet } from "@/app/api/auth/me/route";
import { PATCH as profilePatch } from "@/app/api/auth/profile/route";
import { POST as registerPost } from "@/app/api/auth/register/route";

describe("auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.verifyPassword.mockResolvedValue(true);
  });

  it("registers a user, returns a token and sets the auth cookie", async () => {
    const user = userFixture({ email: "new@example.com", id: 1 });

    mocks.prisma.user.create.mockResolvedValue(user);

    const response = await registerPost(
      makeRequest("/api/auth/register", {
        body: {
          email: " NEW@example.com ",
          firstName: " Ada ",
          lastName: " Lovelace ",
          password: "password123",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      user: {
        email: "new@example.com",
        firstName: "Ada",
        id: 1,
        lastName: "Lovelace",
      },
    });
    expect(body).not.toHaveProperty("user.passwordHash");
    expect(typeof body.token).toBe("string");
    expect(response.headers.get("set-cookie")).toContain("auth_token=");
    expect(mocks.prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "new@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        passwordHash: "hashed-password",
      },
    });
  });

  it("rejects invalid registration input", async () => {
    const response = await registerPost(
      makeRequest("/api/auth/register", {
        body: {
          email: "not-an-email",
          firstName: "Ada",
          lastName: "Lovelace",
          password: "password123",
        },
      }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "A valid email is required",
    });
    expect(mocks.prisma.user.create).not.toHaveBeenCalled();
  });

  it("logs in with valid credentials", async () => {
    const user = userFixture({ email: "rider@example.com", id: 2 });

    mocks.prisma.user.findUnique.mockResolvedValue(user);

    const response = await loginPost(
      makeRequest("/api/auth/login", {
        body: {
          email: " RIDER@example.com ",
          password: "password123",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      email: "rider@example.com",
      id: 2,
    });
    expect(typeof body.token).toBe("string");
    expect(response.headers.get("set-cookie")).toContain("auth_token=");
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "rider@example.com" },
    });
    expect(mocks.verifyPassword).toHaveBeenCalledWith(
      "password123",
      "hidden",
    );
  });

  it("rejects invalid login credentials", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(userFixture());
    mocks.verifyPassword.mockResolvedValue(false);

    const response = await loginPost(
      makeRequest("/api/auth/login", {
        body: {
          email: "rider@example.com",
          password: "wrong-password",
        },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid credentials",
    });
  });

  it("returns the current user for a valid auth token", async () => {
    const user = userFixture({ id: 9 });
    const token = createAuthToken({ email: user.email as string, userId: 9 });

    mocks.prisma.user.findUnique.mockResolvedValue(user);

    const response = await meGet(
      makeRequest("/api/auth/me", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      user: {
        email: "rider@example.com",
        id: 9,
      },
    });
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 9 },
    });
  });

  it("updates the current user profile and refreshes the auth cookie", async () => {
    const user = userFixture({
      email: "updated@example.com",
      firstName: "Grace",
      id: 9,
      lastName: "Hopper",
    });
    const token = createAuthToken({ email: "rider@example.com", userId: 9 });

    mocks.prisma.user.update.mockResolvedValue(user);

    const response = await profilePatch(
      makeRequest("/api/auth/profile", {
        body: {
          email: " UPDATED@example.com ",
          firstName: " Grace ",
          lastName: " Hopper ",
        },
        headers: { authorization: `Bearer ${token}` },
        method: "PATCH",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      user: {
        email: "updated@example.com",
        firstName: "Grace",
        id: 9,
        lastName: "Hopper",
      },
    });
    expect(response.headers.get("set-cookie")).toContain("auth_token=");
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      data: {
        email: "updated@example.com",
        firstName: "Grace",
        lastName: "Hopper",
      },
      where: { id: 9 },
    });
  });

  it("rejects profile updates without auth", async () => {
    const response = await profilePatch(
      makeRequest("/api/auth/profile", {
        body: {
          email: "updated@example.com",
          firstName: "Grace",
          lastName: "Hopper",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects invalid profile update input", async () => {
    const token = createAuthToken({ email: "rider@example.com", userId: 9 });

    const response = await profilePatch(
      makeRequest("/api/auth/profile", {
        body: {
          email: "not-an-email",
          firstName: "Grace",
          lastName: "Hopper",
        },
        headers: { authorization: `Bearer ${token}` },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "A valid email is required",
    });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects current-user requests without auth", async () => {
    const response = await meGet(makeRequest("/api/auth/me"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("clears the auth cookie on logout", async () => {
    const response = await logoutPost();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain("auth_token=;");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
