import "server-only";

import type { AuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ReadingInput = Record<string, unknown>;

export async function createEspReading(
  session: AuthSession,
  espDeviceId: number,
  input: ReadingInput,
) {
  const device = await prisma.espDevice.findFirst({
    where: {
      id: espDeviceId,
      userId: session.userId,
    },
  });

  if (!device) {
    throw new Error("ESP device not found");
  }

  const roadSurfaceId =
    readNumber(input.roadSurfaceId ?? input.road_surface_id) ??
    (await findRoadSurfaceId(input.roadSurface ?? input.road_surface ?? input.surf));
  const batteryPercent = readRequiredInteger(
    input.batteryPercent ?? input.battery_percent ?? input.bat,
    "batteryPercent",
  );
  const frontPressureBar = readNumber(
    input.frontPressureBar ?? input.front_pressure_bar ?? input.pf,
  );
  const rearPressureBar = readNumber(
    input.rearPressureBar ?? input.rear_pressure_bar ?? input.pr,
  );
  const frontWearPercent = readNumber(
    input.frontWearPercent ?? input.front_wear_percent ?? input.wf,
  );
  const rearWearPercent = readNumber(
    input.rearWearPercent ?? input.rear_wear_percent ?? input.wr,
  );
  const pressureBar =
    readNumber(input.pressureBar ?? input.pressure_bar ?? input.p) ??
    readRequiredDerivedNumber(
      averageNumbers([frontPressureBar, rearPressureBar]),
      "pressureBar",
    );
  const wearPercent =
    readNumber(input.wearPercent ?? input.wear_percent ?? input.w) ??
    readRequiredDerivedNumber(
      maxNumber([frontWearPercent, rearWearPercent]),
      "wearPercent",
    );
  const recordedAt = readDate(input.recordedAt ?? input.recorded_at) ?? new Date();
  const readingData = {
    espDeviceId: device.id,
    userBicycleId: device.userBicycleId,
    recordedAt,
    pressureBar,
    ...(frontPressureBar !== null ? { frontPressureBar } : {}),
    ...(rearPressureBar !== null ? { rearPressureBar } : {}),
    wearPercent,
    ...(frontWearPercent !== null ? { frontWearPercent } : {}),
    ...(rearWearPercent !== null ? { rearWearPercent } : {}),
    speedKmh: readRequiredNumber(
      input.speedKmh ?? input.speed_kmh ?? input.v,
      "speedKmh",
    ),
    tireTempC: readNumber(input.tireTempC ?? input.tire_temp_c ?? input.tt) ?? 0,
    ambientTempC:
      readNumber(input.ambientTempC ?? input.ambient_temp_c ?? input.ta) ?? 0,
    distanceKm: readRequiredNumber(
      input.distanceKm ?? input.distance_km ?? input.d,
      "distanceKm",
    ),
    remainingKm: readNumber(input.remainingKm ?? input.remaining_km ?? input.rem) ?? 0,
    rollingResistance:
      readNumber(input.rollingResistance ?? input.rolling_resistance ?? input.rr) ??
      0,
    roadSurfaceId,
    batteryPercent,
  };

  const [reading] = await prisma.$transaction([
    prisma.wheelSensorReading.create({ data: readingData }),
    prisma.espDevice.update({
      data: {
        batteryPercent,
        lastSeenAt: readingData.recordedAt,
      },
      where: { id: device.id },
    }),
  ]);

  return reading;
}

async function findRoadSurfaceId(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = normalizeSurface(value);
  const surfaces = await prisma.roadSurface.findMany({
    select: { id: true, title: true },
  });

  return (
    surfaces.find((surface) => normalizeSurface(surface.title) === normalized)
      ?.id ?? null
  );
}

function normalizeSurface(value: string) {
  return value.trim().toLowerCase().replaceAll("_", " ");
}

function readRequiredNumber(value: unknown, fieldName: string) {
  const number = readNumber(value);

  if (number === null) {
    throw new Error(`${fieldName} is required`);
  }

  return number;
}

function readRequiredInteger(value: unknown, fieldName: string) {
  return clamp(Math.round(readRequiredNumber(value, fieldName)), 0, 100);
}

function readRequiredDerivedNumber(value: number | null, fieldName: string) {
  if (value === null) {
    throw new Error(`${fieldName} is required`);
  }

  return value;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function averageNumbers(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => value !== null);

  if (numbers.length === 0) {
    return null;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function maxNumber(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => value !== null);

  return numbers.length > 0 ? Math.max(...numbers) : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}
