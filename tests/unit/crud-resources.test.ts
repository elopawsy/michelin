import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {},
}));

vi.mock("@/lib/prisma", () => ({
  default: mocks.prisma,
  prisma: mocks.prisma,
}));

import {
  buildKeyWhere,
  buildQueryWhere,
  buildUniqueWhere,
  getResourceConfig,
  listResourceNames,
  normalizeWriteData,
  serializeRecord,
} from "@/lib/crud-resources";

describe("crud resource helpers", () => {
  it("resolves canonical, dashed, snake_case and singular resource names", () => {
    const canonical = getResourceConfig("user-bicycles");

    expect(canonical?.delegate).toBe("userBicycle");
    expect(getResourceConfig("user_bicycle")).toBe(canonical);
    expect(getResourceConfig("user-bicycles")).toBe(canonical);
    expect(listResourceNames()).toContain("wheel-recommendations");
  });

  it("normalizes writable body data and ignores protected fields", () => {
    const config = getResourceConfig("user-bicycles");

    expect(config).toBeDefined();

    const data = normalizeWriteData(
      config!,
      {
        bicycle_model_id: "4",
        brake_type: "disc",
        id: 99,
        ignored: "value",
        name: "  commuter  ",
        tire_width_mm: "32",
        user_id: 1000,
        wheel_size: "700c",
      },
      "create",
    );

    expect(data).toEqual({
      bicycleModelId: 4,
      brakeType: "disc",
      name: "commuter",
      tireWidthMm: 32,
      wheelSize: "700c",
    });
  });

  it("builds query filters without pagination parameters", () => {
    const config = getResourceConfig("wheel-sensor-readings");
    const searchParams = new URLSearchParams({
      battery_percent: "91",
      pressure_bar: "2.35",
      skip: "10",
      take: "5",
      unknown: "ignored",
    });

    expect(buildQueryWhere(config!, searchParams)).toEqual({
      batteryPercent: 91,
      pressureBar: 2.35,
    });
  });

  it("builds single and compound item keys", () => {
    const single = getResourceConfig("wheels");
    const compound = getResourceConfig("wheel-goals");
    const keyWhere = buildKeyWhere(compound!, ["11", "2"]);

    expect(buildKeyWhere(single!, ["7"])).toEqual({ id: 7 });
    expect(keyWhere).toEqual({ goalId: 2, wheelId: 11 });
    expect(buildUniqueWhere(compound!, keyWhere)).toEqual({
      wheelId_goalId: { goalId: 2, wheelId: 11 },
    });
  });

  it("removes hidden fields when serializing records", () => {
    const config = getResourceConfig("users");
    const serialized = serializeRecord(config!, [
      { email: "rider@example.com", id: 1, passwordHash: "secret" },
    ]);

    expect(serialized).toEqual([{ email: "rider@example.com", id: 1 }]);
  });
});
