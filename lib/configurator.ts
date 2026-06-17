import "server-only";

import type { AuthSession } from "@/lib/auth";
import {
  BICYCLE_TYPE_ORDER,
  BRAKE_TYPES,
  GOAL_ORDER,
  ROAD_SURFACE_ORDER,
  WHEEL_SIZES,
  orderByTitle,
  type ConfiguratorDraft,
  type ConfiguratorOptions,
} from "@/lib/configurator-schema";
import { prisma } from "@/lib/prisma";
import { generateWheelRecommendations } from "@/lib/recommendations";

const MIN_TIRE_WIDTH_MM = 20;
const MAX_TIRE_WIDTH_MM = 75;
const MIN_WEEKLY_DISTANCE_KM = 1;
const MAX_WEEKLY_DISTANCE_KM = 500;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 10;

type ParsedConfiguratorDraft = Omit<
  Required<ConfiguratorDraft>,
  "bicycleName"
> & {
  bicycleName?: string;
};

export async function loadConfiguratorOptions(): Promise<ConfiguratorOptions> {
  const [bicycleTypes, bicycleModels, goals, roadSurfaces] = await Promise.all([
    prisma.bicycleType.findMany(),
    prisma.bicycleModel.findMany({
      include: {
        bicycleType: true,
        brand: true,
      },
    }),
    prisma.goal.findMany(),
    prisma.roadSurface.findMany(),
  ]);

  return {
    bicycleModels: bicycleModels
      .map((item) => ({
        brandName: item.brand.name,
        description: item.description,
        id: item.id,
        model: item.model,
        typeTitle: item.bicycleType.title,
      }))
      .sort(
        (left, right) =>
          left.typeTitle.localeCompare(right.typeTitle) ||
          left.brandName.localeCompare(right.brandName) ||
          left.model.localeCompare(right.model),
      ),
    bicycleTypes: orderByTitle(
      bicycleTypes.map((item) => ({
        description: item.description,
        id: item.id,
        title: item.title,
      })),
      BICYCLE_TYPE_ORDER,
    ),
    goals: orderByTitle(
      goals.map((item) => ({
        description: item.description,
        id: item.id,
        title: item.title,
      })),
      GOAL_ORDER,
    ),
    roadSurfaces: orderByTitle(
      roadSurfaces.map((item) => ({
        description: item.description,
        id: item.id,
        title: item.title,
      })),
      ROAD_SURFACE_ORDER,
    ),
  };
}

export async function submitConfiguratorDraft(
  session: AuthSession,
  rawDraft: Record<string, unknown>,
) {
  const draft = parseDraft(rawDraft);
  const [bicycleModel, goal, roadSurface] = await Promise.all([
    prisma.bicycleModel.findFirst({
      include: {
        bicycleType: true,
        brand: true,
      },
      where: {
        id: draft.bicycleModelId,
        bicycleType: {
          title: draft.bicycleTypeTitle,
        },
      },
    }),
    prisma.goal.findUnique({
      where: { title: draft.goalTitle },
    }),
    prisma.roadSurface.findUnique({
      where: { title: draft.roadSurfaceTitle },
    }),
  ]);

  if (!bicycleModel) {
    throw new Error("Selected bicycle model does not match the bicycle type");
  }

  if (!goal) {
    throw new Error("Selected goal is not available");
  }

  if (!roadSurface) {
    throw new Error("Selected road surface is not available");
  }

  const [userBicycle, preference] = await prisma.$transaction([
    prisma.userBicycle.create({
      data: {
        bicycleModelId: bicycleModel.id,
        brakeType: draft.brakeType,
        name:
          draft.bicycleName ||
          `${bicycleModel.brand.name} ${bicycleModel.model}`,
        tireWidthMm: draft.tireWidthMm,
        userId: session.userId,
        wheelSize: draft.wheelSize,
      },
    }),
    prisma.userPreference.create({
      data: {
        goalId: goal.id,
        priorityComfort: draft.priorityComfort,
        priorityDurability: draft.priorityDurability,
        prioritySpeed: draft.prioritySpeed,
        roadSurfaceId: roadSurface.id,
        userId: session.userId,
        weeklyDistanceKm: draft.weeklyDistanceKm,
      },
    }),
  ]);

  const recommendations = await generateWheelRecommendations(session, {
    limit: 3,
    preferenceId: preference.id,
    userBicycleId: userBicycle.id,
  });

  return {
    preference,
    recommendations,
    userBicycle,
  };
}

function parseDraft(raw: Record<string, unknown>): ParsedConfiguratorDraft {
  const draft = {
    bicycleModelId: readInteger(raw.bicycleModelId),
    bicycleName: readString(raw.bicycleName),
    bicycleTypeTitle: readString(raw.bicycleTypeTitle),
    brakeType: readString(raw.brakeType),
    goalTitle: readString(raw.goalTitle),
    priorityComfort: readInteger(raw.priorityComfort),
    priorityDurability: readInteger(raw.priorityDurability),
    prioritySpeed: readInteger(raw.prioritySpeed),
    roadSurfaceTitle: readString(raw.roadSurfaceTitle),
    tireWidthMm: readInteger(raw.tireWidthMm),
    weeklyDistanceKm: readNumber(raw.weeklyDistanceKm),
    wheelSize: readString(raw.wheelSize),
  };

  if (!draft.bicycleTypeTitle) {
    throw new Error("bicycleTypeTitle is required");
  }

  if (!draft.bicycleModelId) {
    throw new Error("bicycleModelId is required");
  }

  if (!draft.roadSurfaceTitle) {
    throw new Error("roadSurfaceTitle is required");
  }

  if (!draft.goalTitle) {
    throw new Error("goalTitle is required");
  }

  if (!isInRange(draft.prioritySpeed, MIN_PRIORITY, MAX_PRIORITY)) {
    throw new Error("prioritySpeed must be between 1 and 10");
  }

  if (!isInRange(draft.priorityComfort, MIN_PRIORITY, MAX_PRIORITY)) {
    throw new Error("priorityComfort must be between 1 and 10");
  }

  if (!isInRange(draft.priorityDurability, MIN_PRIORITY, MAX_PRIORITY)) {
    throw new Error("priorityDurability must be between 1 and 10");
  }

  if (
    !isInRange(
      draft.weeklyDistanceKm,
      MIN_WEEKLY_DISTANCE_KM,
      MAX_WEEKLY_DISTANCE_KM,
    )
  ) {
    throw new Error("weeklyDistanceKm must be between 1 and 500");
  }

  if (!WHEEL_SIZES.includes(draft.wheelSize as (typeof WHEEL_SIZES)[number])) {
    throw new Error("wheelSize is invalid");
  }

  if (!isInRange(draft.tireWidthMm, MIN_TIRE_WIDTH_MM, MAX_TIRE_WIDTH_MM)) {
    throw new Error("tireWidthMm must be between 20 and 75");
  }

  if (!BRAKE_TYPES.some((item) => item.value === draft.brakeType)) {
    throw new Error("brakeType is invalid");
  }

  return draft as ParsedConfiguratorDraft;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function readInteger(value: unknown) {
  const number = readNumber(value);

  return Number.isInteger(number) ? number : null;
}

function isInRange(value: number | null, min: number, max: number) {
  return value !== null && value >= min && value <= max;
}
