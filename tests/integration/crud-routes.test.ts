import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthToken } from "@/lib/auth";
import { DELETE as itemDelete } from "@/app/api/[resource]/[...key]/route";
import { GET as itemGet } from "@/app/api/[resource]/[...key]/route";
import { PATCH as itemPatch } from "@/app/api/[resource]/[...key]/route";
import { GET as collectionGet } from "@/app/api/[resource]/route";
import { POST as collectionPost } from "@/app/api/[resource]/route";
import { makeRequest } from "../helpers/request";

const mocks = vi.hoisted(() => ({
  prisma: {
    userBicycle: {
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mocks.prisma,
  prisma: mocks.prisma,
}));

function authHeader(userId = 42) {
  return {
    authorization: `Bearer ${createAuthToken({
      email: `user-${userId}@example.com`,
      userId,
    })}`,
  };
}

describe("generic CRUD API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists a scoped collection with query filters and pagination", async () => {
    const records = [{ id: 5, name: "Commuter" }];

    mocks.prisma.userBicycle.findMany.mockResolvedValue(records);

    const response = await collectionGet(
      makeRequest("/api/user-bicycles?take=2&skip=1&wheel_size=700c", {
        headers: authHeader(),
      }),
      { params: Promise.resolve({ resource: "user-bicycles" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: records,
      meta: { skip: 1, take: 2 },
    });
    expect(mocks.prisma.userBicycle.findMany).toHaveBeenCalledWith({
      skip: 1,
      take: 2,
      where: {
        AND: [{ wheelSize: "700c" }, { userId: 42 }],
      },
    });
  });

  it("rejects collection reads without auth", async () => {
    const response = await collectionGet(
      makeRequest("/api/user-bicycles"),
      { params: Promise.resolve({ resource: "user-bicycles" }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.prisma.userBicycle.findMany).not.toHaveBeenCalled();
  });

  it("creates records through resource-specific prepareCreate hooks", async () => {
    const created = {
      bicycleModelId: 4,
      brakeType: "disc",
      id: 9,
      name: "Commuter",
      tireWidthMm: 32,
      userId: 42,
      wheelSize: "700c",
    };

    mocks.prisma.userBicycle.create.mockResolvedValue(created);

    const response = await collectionPost(
      makeRequest("/api/user-bicycles", {
        body: {
          bicycle_model_id: "4",
          brake_type: "disc",
          name: "Commuter",
          tire_width_mm: "32",
          user_id: 1000,
          wheel_size: "700c",
        },
        headers: authHeader(),
      }),
      { params: Promise.resolve({ resource: "user-bicycles" }) },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ data: created });
    expect(mocks.prisma.userBicycle.create).toHaveBeenCalledWith({
      data: {
        bicycleModelId: 4,
        brakeType: "disc",
        name: "Commuter",
        tireWidthMm: 32,
        userId: 42,
        wheelSize: "700c",
      },
    });
  });

  it("returns 404 for unknown resources", async () => {
    const response = await collectionGet(
      makeRequest("/api/not-real", { headers: authHeader() }),
      { params: Promise.resolve({ resource: "not-real" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("Unknown resource"),
    });
  });

  it("reads an item with id and ownership scope", async () => {
    const record = { id: 9, name: "Commuter", userId: 42 };

    mocks.prisma.userBicycle.findFirst.mockResolvedValue(record);

    const response = await itemGet(
      makeRequest("/api/user-bicycles/9", { headers: authHeader() }),
      {
        params: Promise.resolve({
          key: ["9"],
          resource: "user-bicycles",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: record });
    expect(mocks.prisma.userBicycle.findFirst).toHaveBeenCalledWith({
      where: {
        AND: [{ id: 9 }, { userId: 42 }],
      },
    });
  });

  it("returns 404 when a scoped item cannot be found", async () => {
    mocks.prisma.userBicycle.findFirst.mockResolvedValue(null);

    const response = await itemGet(
      makeRequest("/api/user-bicycles/9", { headers: authHeader() }),
      {
        params: Promise.resolve({
          key: ["9"],
          resource: "user-bicycles",
        }),
      },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Record not found",
    });
  });

  it("updates an item after checking scoped ownership", async () => {
    const existing = { id: 9, name: "Old name", userId: 42 };
    const updated = { id: 9, name: "New name", userId: 42 };

    mocks.prisma.userBicycle.findFirst.mockResolvedValue(existing);
    mocks.prisma.userBicycle.update.mockResolvedValue(updated);

    const response = await itemPatch(
      makeRequest("/api/user-bicycles/9", {
        body: {
          id: 200,
          name: "New name",
          user_id: 1000,
        },
        headers: authHeader(),
      }),
      {
        params: Promise.resolve({
          key: ["9"],
          resource: "user-bicycles",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: updated });
    expect(mocks.prisma.userBicycle.update).toHaveBeenCalledWith({
      data: { name: "New name" },
      where: { id: 9 },
    });
  });

  it("deletes an item after checking scoped ownership", async () => {
    const existing = { id: 9, name: "Commuter", userId: 42 };

    mocks.prisma.userBicycle.findFirst.mockResolvedValue(existing);
    mocks.prisma.userBicycle.delete.mockResolvedValue(existing);

    const response = await itemDelete(
      makeRequest("/api/user-bicycles/9", { headers: authHeader() }),
      {
        params: Promise.resolve({
          key: ["9"],
          resource: "user-bicycles",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: existing });
    expect(mocks.prisma.userBicycle.delete).toHaveBeenCalledWith({
      where: { id: 9 },
    });
  });
});
