import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthToken } from "@/lib/auth";
import { GET as dashboardGet } from "@/app/api/dashboard/route";
import { POST as espReadingPost } from "@/app/api/esp-devices/[id]/readings/route";
import { POST as generateRecommendationsPost } from "@/app/api/recommendations/generate/route";
import { makeRequest } from "../helpers/request";

const mocks = vi.hoisted(() => ({
  createEspReading: vi.fn(),
  generateWheelRecommendations: vi.fn(),
  listRecommendations: vi.fn(),
  loadDashboard: vi.fn(),
}));

vi.mock("@/lib/dashboard", () => ({
  loadDashboard: mocks.loadDashboard,
}));

vi.mock("@/lib/esp-readings", () => ({
  createEspReading: mocks.createEspReading,
}));

vi.mock("@/lib/recommendations", () => ({
  generateWheelRecommendations: mocks.generateWheelRecommendations,
  listRecommendations: mocks.listRecommendations,
}));

function authHeader(userId = 42) {
  return {
    authorization: `Bearer ${createAuthToken({
      email: `user-${userId}@example.com`,
      userId,
    })}`,
  };
}

describe("special API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the dashboard for the authenticated user", async () => {
    const dashboard = { bicycles: [], devices: [], user: { id: 42 } };

    mocks.loadDashboard.mockResolvedValue(dashboard);

    const response = await dashboardGet(
      makeRequest("/api/dashboard", { headers: authHeader() }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: dashboard });
    expect(mocks.loadDashboard).toHaveBeenCalledWith({
      email: "user-42@example.com",
      userId: 42,
    });
  });

  it("rejects dashboard reads without auth", async () => {
    const response = await dashboardGet(makeRequest("/api/dashboard"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.loadDashboard).not.toHaveBeenCalled();
  });

  it("generates recommendations from camelCase and snake_case body fields", async () => {
    const recommendations = [{ id: 1, score: 91.4 }];

    mocks.generateWheelRecommendations.mockResolvedValue(recommendations);

    const response = await generateRecommendationsPost(
      makeRequest("/api/recommendations/generate", {
        body: {
          limit: "2",
          preference_id: "5",
          user_bicycle_id: "9",
        },
        headers: authHeader(),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: recommendations,
    });
    expect(mocks.generateWheelRecommendations).toHaveBeenCalledWith(
      { email: "user-42@example.com", userId: 42 },
      {
        limit: 2,
        preferenceId: 5,
        userBicycleId: 9,
      },
    );
  });

  it("validates required recommendation input", async () => {
    const response = await generateRecommendationsPost(
      makeRequest("/api/recommendations/generate", {
        body: { limit: 2 },
        headers: authHeader(),
      }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "userBicycleId is required",
    });
    expect(mocks.generateWheelRecommendations).not.toHaveBeenCalled();
  });

  it("creates ESP readings through the nested route", async () => {
    const reading = { id: 31, pressureBar: 2.2 };
    const payload = { batteryPercent: 90, pressureBar: 2.2 };

    mocks.createEspReading.mockResolvedValue(reading);

    const response = await espReadingPost(
      makeRequest("/api/esp-devices/8/readings", {
        body: payload,
        headers: authHeader(),
      }),
      { params: Promise.resolve({ id: "8" }) },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ data: reading });
    expect(mocks.createEspReading).toHaveBeenCalledWith(
      { email: "user-42@example.com", userId: 42 },
      8,
      payload,
    );
  });

  it("validates ESP device ids before creating readings", async () => {
    const response = await espReadingPost(
      makeRequest("/api/esp-devices/not-a-number/readings", {
        body: {},
        headers: authHeader(),
      }),
      { params: Promise.resolve({ id: "not-a-number" }) },
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "Valid ESP device id is required",
    });
    expect(mocks.createEspReading).not.toHaveBeenCalled();
  });
});
