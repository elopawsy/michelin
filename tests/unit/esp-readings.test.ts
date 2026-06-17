import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    espDevice: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    roadSurface: {
      findMany: vi.fn(),
    },
    wheelSensorReading: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mocks.prisma,
  prisma: mocks.prisma,
}));

import { createEspReading } from "@/lib/esp-readings";

describe("createEspReading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation((operations) =>
      Promise.all(operations),
    );
  });

  it("maps ESP payload aliases, resolves surface names and updates the device", async () => {
    const reading = { id: 55, pressureBar: 2.3 };

    mocks.prisma.espDevice.findFirst.mockResolvedValue({
      id: 8,
      userBicycleId: 21,
    });
    mocks.prisma.roadSurface.findMany.mockResolvedValue([
      { id: 3, title: "Gravel Road" },
    ]);
    mocks.prisma.wheelSensorReading.create.mockReturnValue(
      Promise.resolve(reading),
    );
    mocks.prisma.espDevice.update.mockReturnValue(Promise.resolve({ id: 8 }));

    const result = await createEspReading(
      { email: "rider@example.com", userId: 7 },
      8,
      {
        bat: "86",
        d: "13.4",
        p: "2.3",
        recorded_at: "2026-02-03T04:05:06.000Z",
        rem: "900",
        rr: "0.23",
        surf: "gravel_road",
        ta: "18",
        tt: "25",
        v: "31.5",
        w: "42",
      },
    );

    expect(result).toBe(reading);
    expect(mocks.prisma.espDevice.findFirst).toHaveBeenCalledWith({
      where: { id: 8, userId: 7 },
    });
    expect(mocks.prisma.wheelSensorReading.create).toHaveBeenCalledWith({
      data: {
        ambientTempC: 18,
        batteryPercent: 86,
        distanceKm: 13.4,
        espDeviceId: 8,
        pressureBar: 2.3,
        recordedAt: new Date("2026-02-03T04:05:06.000Z"),
        remainingKm: 900,
        roadSurfaceId: 3,
        rollingResistance: 0.23,
        speedKmh: 31.5,
        tireTempC: 25,
        userBicycleId: 21,
        wearPercent: 42,
      },
    });
    expect(mocks.prisma.espDevice.update).toHaveBeenCalledWith({
      data: {
        batteryPercent: 86,
        lastSeenAt: new Date("2026-02-03T04:05:06.000Z"),
      },
      where: { id: 8 },
    });
  });

  it("stores BLE front and rear tire values with compatible aggregate fields", async () => {
    const reading = { id: 56, pressureBar: 2.45 };

    mocks.prisma.espDevice.findFirst.mockResolvedValue({
      id: 8,
      userBicycleId: 21,
    });
    mocks.prisma.roadSurface.findMany.mockResolvedValue([]);
    mocks.prisma.wheelSensorReading.create.mockReturnValue(
      Promise.resolve(reading),
    );
    mocks.prisma.espDevice.update.mockReturnValue(Promise.resolve({ id: 8 }));

    const result = await createEspReading(
      { email: "rider@example.com", userId: 7 },
      8,
      {
        bat: 86.4,
        d: 1280,
        pf: 2.5,
        pr: 2.4,
        recordedAt: "2026-02-03T04:05:06.000Z",
        v: 31.5,
        wf: 12,
        wr: 18,
      },
    );

    expect(result).toBe(reading);
    expect(mocks.prisma.wheelSensorReading.create).toHaveBeenCalledWith({
      data: {
        ambientTempC: 0,
        batteryPercent: 86,
        distanceKm: 1280,
        espDeviceId: 8,
        frontPressureBar: 2.5,
        frontWearPercent: 12,
        pressureBar: 2.45,
        rearPressureBar: 2.4,
        rearWearPercent: 18,
        recordedAt: new Date("2026-02-03T04:05:06.000Z"),
        remainingKm: 0,
        roadSurfaceId: null,
        rollingResistance: 0,
        speedKmh: 31.5,
        tireTempC: 0,
        userBicycleId: 21,
        wearPercent: 18,
      },
    });
  });

  it("throws when the device does not belong to the session user", async () => {
    mocks.prisma.espDevice.findFirst.mockResolvedValue(null);

    await expect(
      createEspReading({ email: "rider@example.com", userId: 7 }, 8, {}),
    ).rejects.toThrow("ESP device not found");
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("throws when a required reading field is missing", async () => {
    mocks.prisma.espDevice.findFirst.mockResolvedValue({
      id: 8,
      userBicycleId: 21,
    });

    await expect(
      createEspReading(
        { email: "rider@example.com", userId: 7 },
        8,
        { batteryPercent: 80 },
      ),
    ).rejects.toThrow("pressureBar is required");
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});
