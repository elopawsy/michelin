import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ prisma: {} }));

vi.mock("@/lib/prisma", () => ({
  default: mocks.prisma,
  prisma: mocks.prisma,
}));

import { sanitizeScoreInput } from "@/lib/game-scores";

describe("sanitizeScoreInput", () => {
  it("accepts and normalises a valid payload", () => {
    expect(
      sanitizeScoreInput({ score: 1200.7, distance: 640.2, tireId: "gravel" }),
    ).toEqual({ score: 1200, distance: 640, tireId: "gravel" });
  });

  it("coerces numeric strings", () => {
    expect(
      sanitizeScoreInput({ score: "300", distance: "120", tireId: "ride700" }),
    ).toEqual({ score: 300, distance: 120, tireId: "ride700" });
  });

  it("rejects unknown tire ids", () => {
    expect(
      sanitizeScoreInput({ score: 10, distance: 10, tireId: "rocket" }),
    ).toBeNull();
  });

  it("rejects negative or non-finite values", () => {
    expect(
      sanitizeScoreInput({ score: -1, distance: 10, tireId: "city" }),
    ).toBeNull();
    expect(
      sanitizeScoreInput({ score: 10, distance: Infinity, tireId: "city" }),
    ).toBeNull();
  });

  it("rejects values beyond the anti-cheat ceiling", () => {
    expect(
      sanitizeScoreInput({ score: 1e9, distance: 10, tireId: "city" }),
    ).toBeNull();
  });

  it("rejects missing fields", () => {
    expect(sanitizeScoreInput({ score: 10, tireId: "city" })).toBeNull();
  });
});
