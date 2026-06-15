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
  const batteryPercent = readRequiredNumber(
    input.batteryPercent ?? input.battery_percent ?? input.bat,
    "batteryPercent",
  );
  const readingData = {
    espDeviceId: device.id,
    userBicycleId: device.userBicycleId,
    recordedAt: readDate(input.recordedAt ?? input.recorded_at) ?? new Date(),
    pressureBar: readRequiredNumber(
      input.pressureBar ?? input.pressure_bar ?? input.p,
      "pressureBar",
    ),
    wearPercent: readRequiredNumber(
      input.wearPercent ?? input.wear_percent ?? input.w,
      "wearPercent",
    ),
    speedKmh: readRequiredNumber(
      input.speedKmh ?? input.speed_kmh ?? input.v,
      "speedKmh",
    ),
    tireTempC: readRequiredNumber(
      input.tireTempC ?? input.tire_temp_c ?? input.tt,
      "tireTempC",
    ),
    ambientTempC: readRequiredNumber(
      input.ambientTempC ?? input.ambient_temp_c ?? input.ta,
      "ambientTempC",
    ),
    distanceKm: readRequiredNumber(
      input.distanceKm ?? input.distance_km ?? input.d,
      "distanceKm",
    ),
    remainingKm: readRequiredNumber(
      input.remainingKm ?? input.remaining_km ?? input.rem,
      "remainingKm",
    ),
    rollingResistance: readRequiredNumber(
      input.rollingResistance ?? input.rolling_resistance ?? input.rr,
      "rollingResistance",
    ),
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

function readDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}
