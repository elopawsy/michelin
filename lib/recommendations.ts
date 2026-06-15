import "server-only";

import { prisma } from "@/lib/prisma";
import type { AuthSession } from "@/lib/auth";

type GenerateRecommendationInput = {
  userBicycleId: number;
  limit?: number;
  preferenceId?: number;
};

type CandidateWheel = Awaited<ReturnType<typeof loadCompatibleWheels>>[number];
type UserBicycle = NonNullable<
  Awaited<ReturnType<typeof loadUserBicycleForRecommendations>>
>;
type UserPreference = NonNullable<
  Awaited<ReturnType<typeof loadPreferenceForRecommendations>>
>;
type SensorReading = Awaited<ReturnType<typeof loadLatestReading>>;

export async function generateWheelRecommendations(
  session: AuthSession,
  input: GenerateRecommendationInput,
) {
  const limit = clamp(input.limit ?? 3, 1, 10);
  const userBicycle = await loadUserBicycleForRecommendations(
    input.userBicycleId,
    session,
  );

  if (!userBicycle) {
    throw new Error("User bicycle not found");
  }

  const preference = await loadPreferenceForRecommendations(
    session,
    input.preferenceId,
  );

  if (!preference) {
    throw new Error("User preference not found");
  }

  const latestReading = await loadLatestReading(userBicycle.id);
  const wheels = await loadCompatibleWheels(userBicycle, preference, latestReading);
  const scored = wheels
    .map((wheel) => scoreWheel(wheel, userBicycle, preference, latestReading))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  if (scored.length === 0) {
    return [];
  }

  return Promise.all(
    scored.map((item) =>
      prisma.wheelRecommendation.create({
        data: {
          userId: session.userId,
          userBicycleId: userBicycle.id,
          wheelId: item.wheel.id,
          score: item.score,
          reason: item.reason,
        },
        include: {
          wheel: {
            include: {
              wheelType: true,
            },
          },
        },
      }),
    ),
  );
}

export async function listRecommendations(session: AuthSession, requestUrl: URL) {
  const userBicycleId = readNumber(requestUrl.searchParams.get("user_bicycle_id"));
  const take = clamp(readNumber(requestUrl.searchParams.get("take")) ?? 20, 1, 100);

  return prisma.wheelRecommendation.findMany({
    include: {
      userBicycle: true,
      wheel: {
        include: {
          wheelType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    where: {
      userId: session.userId,
      ...(userBicycleId ? { userBicycleId } : {}),
    },
  });
}

function scoreWheel(
  wheel: CandidateWheel,
  userBicycle: UserBicycle,
  preference: UserPreference,
  latestReading: SensorReading,
) {
  const priorityTotal =
    preference.prioritySpeed +
    preference.priorityComfort +
    preference.priorityDurability;
  const normalizedTotal = priorityTotal > 0 ? priorityTotal : 3;
  const preferenceScore =
    ((wheel.speedScore * preference.prioritySpeed +
      wheel.comfortScore * preference.priorityComfort +
      wheel.durabilityScore * preference.priorityDurability) /
      normalizedTotal) *
    10;
  const goalScore =
    (wheel.wheelGoals.find((item) => item.goalId === preference.goalId)?.score ??
      5) * 10;
  const surfaceScore = wheel.wheelRoadSurfaces.some(
    (item) => item.roadSurfaceId === preference.roadSurfaceId,
  )
    ? 100
    : 70;
  const fitScore = getFitScore(wheel, userBicycle);
  const sensorAdjustment = getSensorAdjustment(latestReading);
  const score = clamp(
    preferenceScore * 0.5 +
      goalScore * 0.2 +
      surfaceScore * 0.15 +
      fitScore * 0.15 +
      sensorAdjustment,
    0,
    100,
  );

  return {
    score: Number(score.toFixed(1)),
    reason: buildReason(
      wheel,
      userBicycle,
      preference,
      latestReading,
      score,
    ),
    wheel,
  };
}

function getFitScore(wheel: CandidateWheel, userBicycle: UserBicycle) {
  const tireRange =
    wheel.maxTireWidthMm > wheel.minTireWidthMm
      ? wheel.maxTireWidthMm - wheel.minTireWidthMm
      : 1;
  const tireMidpoint = (wheel.minTireWidthMm + wheel.maxTireWidthMm) / 2;
  const tireDistance = Math.abs(userBicycle.tireWidthMm - tireMidpoint);
  const tireScore = clamp(100 - (tireDistance / tireRange) * 50, 50, 100);
  const brakeScore =
    wheel.brakeType === "any" || wheel.brakeType === userBicycle.brakeType
      ? 100
      : 0;

  return tireScore * 0.7 + brakeScore * 0.3;
}

function getSensorAdjustment(reading: SensorReading) {
  if (!reading) {
    return 0;
  }

  let adjustment = 0;

  if (reading.wearPercent >= 80) {
    adjustment += 5;
  } else if (reading.wearPercent >= 60) {
    adjustment += 2;
  }

  if (reading.remainingKm <= 250) {
    adjustment += 5;
  } else if (reading.remainingKm <= 750) {
    adjustment += 2;
  }

  return adjustment;
}

function buildReason(
  wheel: CandidateWheel,
  userBicycle: UserBicycle,
  preference: UserPreference,
  latestReading: SensorReading,
  score: number,
) {
  const reasons = [
    `Compatible with ${userBicycle.wheelSize} wheels, ${userBicycle.tireWidthMm}mm tires and ${userBicycle.brakeType} brakes.`,
    `Matches ${preference.goal.title.toLowerCase()} goal on ${preference.roadSurface.title.toLowerCase()} surface.`,
    `Scores speed ${wheel.speedScore}/10, comfort ${wheel.comfortScore}/10 and durability ${wheel.durabilityScore}/10.`,
  ];

  if (latestReading) {
    reasons.push(
      `Latest sensor data shows ${latestReading.wearPercent}% wear and ${latestReading.remainingKm}km remaining.`,
    );
  }

  reasons.push(`Recommendation score: ${score.toFixed(1)}/100.`);

  return reasons.join(" ");
}

function loadUserBicycleForRecommendations(
  id: number,
  session: AuthSession,
) {
  return prisma.userBicycle.findFirst({
    include: {
      bicycleModel: {
        include: {
          bicycleType: true,
          brand: true,
        },
      },
    },
    where: {
      id,
      userId: session.userId,
    },
  });
}

function loadPreferenceForRecommendations(
  session: AuthSession,
  preferenceId?: number,
) {
  return prisma.userPreference.findFirst({
    include: {
      goal: true,
      roadSurface: true,
    },
    orderBy: { id: "desc" },
    where: {
      userId: session.userId,
      ...(preferenceId ? { id: preferenceId } : {}),
    },
  });
}

function loadLatestReading(userBicycleId: number) {
  return prisma.wheelSensorReading.findFirst({
    orderBy: { recordedAt: "desc" },
    where: { userBicycleId },
  });
}

function loadCompatibleWheels(
  userBicycle: UserBicycle,
  preference: UserPreference,
  latestReading: SensorReading,
) {
  const roadSurfaceId = latestReading?.roadSurfaceId ?? preference.roadSurfaceId;

  return prisma.wheel.findMany({
    include: {
      wheelBicycleTypes: true,
      wheelGoals: true,
      wheelRoadSurfaces: true,
      wheelType: true,
    },
    where: {
      brakeType: { in: [userBicycle.brakeType, "any"] },
      maxTireWidthMm: { gte: userBicycle.tireWidthMm },
      minTireWidthMm: { lte: userBicycle.tireWidthMm },
      wheelBicycleTypes: {
        some: {
          bicycleTypeId: userBicycle.bicycleModel.bicycleTypeId,
        },
      },
      wheelGoals: {
        some: {
          goalId: preference.goalId,
        },
      },
      wheelRoadSurfaces: {
        some: {
          roadSurfaceId,
        },
      },
      wheelType: {
        wheelSize: userBicycle.wheelSize,
      },
    },
  });
}

function readNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
