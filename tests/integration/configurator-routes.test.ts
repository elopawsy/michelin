import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthToken } from "@/lib/auth";
import { GET as optionsGet } from "@/app/api/configurateur/options/route";
import { POST as submitPost } from "@/app/api/configurateur/submit/route";
import { makeRequest } from "../helpers/request";

const mocks = vi.hoisted(() => ({
  loadConfiguratorOptions: vi.fn(),
  submitConfiguratorDraft: vi.fn(),
}));

vi.mock("@/lib/configurator", () => ({
  loadConfiguratorOptions: mocks.loadConfiguratorOptions,
  submitConfiguratorDraft: mocks.submitConfiguratorDraft,
}));

function authHeader(userId = 42) {
  return {
    authorization: `Bearer ${createAuthToken({
      email: `user-${userId}@example.com`,
      userId,
    })}`,
  };
}

describe("configurator API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads configurator catalogue options", async () => {
    const options = {
      bicycleModels: [],
      bicycleTypes: [{ description: null, id: 1, title: "Road" }],
      goals: [{ description: null, id: 1, title: "Speed" }],
      roadSurfaces: [{ description: null, id: 1, title: "Road" }],
    };

    mocks.loadConfiguratorOptions.mockResolvedValue(options);

    const response = await optionsGet();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: options });
    expect(mocks.loadConfiguratorOptions).toHaveBeenCalledOnce();
  });

  it("submits a completed draft for the authenticated user", async () => {
    const draft = {
      bicycleModelId: 9,
      bicycleName: "Road setup",
      bicycleTypeTitle: "Road",
      brakeType: "disc",
      goalTitle: "Speed",
      priorityComfort: 5,
      priorityDurability: 6,
      prioritySpeed: 9,
      roadSurfaceTitle: "Road",
      tireWidthMm: 28,
      weeklyDistanceKm: 100,
      wheelSize: "700c",
    };
    const result = {
      preference: { id: 12 },
      recommendations: [{ id: 20, score: 94.1 }],
      userBicycle: { id: 11 },
    };

    mocks.submitConfiguratorDraft.mockResolvedValue(result);

    const response = await submitPost(
      makeRequest("/api/configurateur/submit", {
        body: draft,
        headers: authHeader(),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ data: result });
    expect(mocks.submitConfiguratorDraft).toHaveBeenCalledWith(
      { email: "user-42@example.com", userId: 42 },
      draft,
    );
  });

  it("rejects configurator submission without authentication", async () => {
    const response = await submitPost(
      makeRequest("/api/configurateur/submit", {
        body: {},
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.submitConfiguratorDraft).not.toHaveBeenCalled();
  });
});
