import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthToken } from "@/lib/auth";
import { GET, POST } from "@/app/api/leaderboard/route";
import { makeRequest } from "../helpers/request";

const mocks = vi.hoisted(() => ({
  getLeaderboard: vi.fn(),
  sanitizeScoreInput: vi.fn(),
  submitScore: vi.fn(),
}));

vi.mock("@/lib/game-scores", () => ({
  getLeaderboard: mocks.getLeaderboard,
  sanitizeScoreInput: mocks.sanitizeScoreInput,
  submitScore: mocks.submitScore,
}));

function authHeader(userId = 42) {
  return {
    authorization: `Bearer ${createAuthToken({
      email: `user-${userId}@example.com`,
      userId,
    })}`,
  };
}

describe("leaderboard API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the leaderboard to anonymous visitors", async () => {
    const board = { top: [{ rank: 1, userId: 7, score: 999 }], me: null };
    mocks.getLeaderboard.mockResolvedValue(board);

    const response = await GET(makeRequest("/api/leaderboard"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: board });
    expect(mocks.getLeaderboard).toHaveBeenCalledWith({
      limit: undefined,
      userId: undefined,
    });
  });

  it("passes the limit and the current user id when authenticated", async () => {
    mocks.getLeaderboard.mockResolvedValue({ top: [], me: null });

    await GET(
      makeRequest("/api/leaderboard?limit=5", { headers: authHeader(42) }),
    );

    expect(mocks.getLeaderboard).toHaveBeenCalledWith({
      limit: 5,
      userId: 42,
    });
  });

  it("rejects score submissions without authentication", async () => {
    const response = await POST(
      makeRequest("/api/leaderboard", {
        body: { score: 100, distance: 50, tireId: "gravel" },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.submitScore).not.toHaveBeenCalled();
  });

  it("stores a valid score for the authenticated user", async () => {
    const input = { score: 1200, distance: 640, tireId: "ride700" };
    const result = { rank: 2, bestScore: 1200, bestDistance: 640, isNewBest: true };
    mocks.sanitizeScoreInput.mockReturnValue(input);
    mocks.submitScore.mockResolvedValue(result);

    const response = await POST(
      makeRequest("/api/leaderboard", {
        body: input,
        headers: authHeader(42),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ data: result });
    expect(mocks.submitScore).toHaveBeenCalledWith(42, input);
  });

  it("rejects invalid score payloads with 422", async () => {
    mocks.sanitizeScoreInput.mockReturnValue(null);

    const response = await POST(
      makeRequest("/api/leaderboard", {
        body: { score: -5, distance: "nope", tireId: "fake" },
        headers: authHeader(42),
      }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid score payload",
    });
    expect(mocks.submitScore).not.toHaveBeenCalled();
  });
});
