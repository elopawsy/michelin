import "server-only";

import { prisma } from "@/lib/prisma";

type SeedResult = {
  bicycleTypes: number;
  goals: number;
  roadSurfaces: number;
  wheelTypes: number;
  wheels: number;
};

const bicycleTypes = [
  {
    title: "City",
    description: "Urban and commuter bicycles.",
  },
  {
    title: "Road",
    description: "Fast road bicycles for paved surfaces.",
  },
  {
    title: "Gravel",
    description: "Mixed-surface bicycles for road and light off-road riding.",
  },
  {
    title: "Mountain",
    description: "Off-road bicycles for rough terrain.",
  },
];

const goals = [
  {
    title: "Speed",
    description: "Prioritize low rolling resistance and fast riding.",
  },
  {
    title: "Comfort",
    description: "Prioritize comfort on uneven surfaces.",
  },
  {
    title: "Durability",
    description: "Prioritize puncture resistance and service life.",
  },
];

const roadSurfaces = [
  {
    title: "City",
    description: "Urban pavement, curbs, bike lanes and daily commuting.",
  },
  {
    title: "Road",
    description: "Smooth tarmac and paved roads.",
  },
  {
    title: "Gravel",
    description: "Compacted gravel and mixed routes.",
  },
  {
    title: "Rough",
    description: "Damaged pavement, trails and rough mixed surfaces.",
  },
];

const wheelTypes = [
  {
    title: "Road 700c",
    wheelSize: "700c",
    description: "700c road and endurance tire format.",
  },
  {
    title: "Gravel 700c",
    wheelSize: "700c",
    description: "700c mixed-surface and gravel tire format.",
  },
  {
    title: "City 700c",
    wheelSize: "700c",
    description: "700c city and commuter tire format.",
  },
  {
    title: "Trail 29",
    wheelSize: "29",
    description: "29 inch mountain bike tire format.",
  },
];

const wheels = [
  {
    wheelTypeTitle: "Road 700c",
    model: "Michelin Road Performance",
    description: "Fast 700c road tire for paved routes.",
    durabilityKm: 4500,
    minTireWidthMm: 25,
    maxTireWidthMm: 32,
    weightG: 260,
    price: "59.90",
    tubelessReady: true,
    brakeType: "disc",
    rollingResistanceScore: 9,
    comfortScore: 6,
    speedScore: 10,
    durabilityScore: 6,
    bicycleTypes: ["Road"],
    surfaces: ["Road"],
    goalScores: { Speed: 10, Comfort: 6, Durability: 6 },
  },
  {
    wheelTypeTitle: "Road 700c",
    model: "Michelin Endurance Comfort",
    description: "Balanced 700c tire for long paved rides.",
    durabilityKm: 6000,
    minTireWidthMm: 28,
    maxTireWidthMm: 35,
    weightG: 310,
    price: "54.90",
    tubelessReady: true,
    brakeType: "disc",
    rollingResistanceScore: 8,
    comfortScore: 8,
    speedScore: 8,
    durabilityScore: 8,
    bicycleTypes: ["Road", "City"],
    surfaces: ["Road", "City"],
    goalScores: { Speed: 8, Comfort: 9, Durability: 8 },
  },
  {
    wheelTypeTitle: "Gravel 700c",
    model: "Michelin Gravel Mixed",
    description: "700c tire for mixed tarmac and gravel routes.",
    durabilityKm: 5500,
    minTireWidthMm: 35,
    maxTireWidthMm: 50,
    weightG: 440,
    price: "64.90",
    tubelessReady: true,
    brakeType: "disc",
    rollingResistanceScore: 7,
    comfortScore: 8,
    speedScore: 7,
    durabilityScore: 8,
    bicycleTypes: ["Gravel"],
    surfaces: ["Road", "Gravel", "Rough"],
    goalScores: { Speed: 7, Comfort: 8, Durability: 8 },
  },
  {
    wheelTypeTitle: "City 700c",
    model: "Michelin City Durable",
    description: "Durable city tire for commuting and daily use.",
    durabilityKm: 8000,
    minTireWidthMm: 32,
    maxTireWidthMm: 45,
    weightG: 520,
    price: "39.90",
    tubelessReady: false,
    brakeType: "any",
    rollingResistanceScore: 6,
    comfortScore: 8,
    speedScore: 6,
    durabilityScore: 10,
    bicycleTypes: ["City"],
    surfaces: ["City", "Road", "Rough"],
    goalScores: { Speed: 5, Comfort: 8, Durability: 10 },
  },
  {
    wheelTypeTitle: "Trail 29",
    model: "Michelin Trail Control",
    description: "29 inch tire for rough off-road routes.",
    durabilityKm: 4500,
    minTireWidthMm: 55,
    maxTireWidthMm: 66,
    weightG: 850,
    price: "69.90",
    tubelessReady: true,
    brakeType: "disc",
    rollingResistanceScore: 5,
    comfortScore: 9,
    speedScore: 5,
    durabilityScore: 9,
    bicycleTypes: ["Mountain"],
    surfaces: ["Gravel", "Rough"],
    goalScores: { Speed: 5, Comfort: 9, Durability: 9 },
  },
];

export async function seedCatalog(): Promise<SeedResult> {
  for (const bicycleType of bicycleTypes) {
    await prisma.bicycleType.upsert({
      create: bicycleType,
      update: { description: bicycleType.description },
      where: { title: bicycleType.title },
    });
  }

  for (const goal of goals) {
    await prisma.goal.upsert({
      create: goal,
      update: { description: goal.description },
      where: { title: goal.title },
    });
  }

  for (const surface of roadSurfaces) {
    await prisma.roadSurface.upsert({
      create: surface,
      update: { description: surface.description },
      where: { title: surface.title },
    });
  }

  for (const wheelType of wheelTypes) {
    await prisma.wheelType.upsert({
      create: wheelType,
      update: { description: wheelType.description },
      where: {
        title_wheelSize: {
          title: wheelType.title,
          wheelSize: wheelType.wheelSize,
        },
      },
    });
  }

  const [typesByTitle, goalsByTitle, surfacesByTitle, wheelTypesByTitle] =
    await Promise.all([
      prisma.bicycleType.findMany(),
      prisma.goal.findMany(),
      prisma.roadSurface.findMany(),
      prisma.wheelType.findMany(),
    ]);

  for (const wheelData of wheels) {
    const wheelType = wheelTypesByTitle.find(
      (item) => item.title === wheelData.wheelTypeTitle,
    );

    if (!wheelType) {
      continue;
    }

    const wheel = await prisma.wheel.upsert({
      create: {
        wheelTypeId: wheelType.id,
        model: wheelData.model,
        description: wheelData.description,
        durabilityKm: wheelData.durabilityKm,
        minTireWidthMm: wheelData.minTireWidthMm,
        maxTireWidthMm: wheelData.maxTireWidthMm,
        weightG: wheelData.weightG,
        price: wheelData.price,
        tubelessReady: wheelData.tubelessReady,
        brakeType: wheelData.brakeType,
        rollingResistanceScore: wheelData.rollingResistanceScore,
        comfortScore: wheelData.comfortScore,
        speedScore: wheelData.speedScore,
        durabilityScore: wheelData.durabilityScore,
      },
      update: {
        description: wheelData.description,
        durabilityKm: wheelData.durabilityKm,
        minTireWidthMm: wheelData.minTireWidthMm,
        maxTireWidthMm: wheelData.maxTireWidthMm,
        weightG: wheelData.weightG,
        price: wheelData.price,
        tubelessReady: wheelData.tubelessReady,
        brakeType: wheelData.brakeType,
        rollingResistanceScore: wheelData.rollingResistanceScore,
        comfortScore: wheelData.comfortScore,
        speedScore: wheelData.speedScore,
        durabilityScore: wheelData.durabilityScore,
      },
      where: {
        wheelTypeId_model: {
          wheelTypeId: wheelType.id,
          model: wheelData.model,
        },
      },
    });

    for (const typeTitle of wheelData.bicycleTypes) {
      const bicycleType = typesByTitle.find((item) => item.title === typeTitle);

      if (bicycleType) {
        await prisma.wheelBicycleType.upsert({
          create: { wheelId: wheel.id, bicycleTypeId: bicycleType.id },
          update: {},
          where: {
            wheelId_bicycleTypeId: {
              wheelId: wheel.id,
              bicycleTypeId: bicycleType.id,
            },
          },
        });
      }
    }

    for (const surfaceTitle of wheelData.surfaces) {
      const surface = surfacesByTitle.find((item) => item.title === surfaceTitle);

      if (surface) {
        await prisma.wheelRoadSurface.upsert({
          create: { wheelId: wheel.id, roadSurfaceId: surface.id },
          update: {},
          where: {
            wheelId_roadSurfaceId: {
              wheelId: wheel.id,
              roadSurfaceId: surface.id,
            },
          },
        });
      }
    }

    for (const [goalTitle, score] of Object.entries(wheelData.goalScores)) {
      const goal = goalsByTitle.find((item) => item.title === goalTitle);

      if (goal) {
        await prisma.wheelGoal.upsert({
          create: { wheelId: wheel.id, goalId: goal.id, score },
          update: { score },
          where: {
            wheelId_goalId: {
              wheelId: wheel.id,
              goalId: goal.id,
            },
          },
        });
      }
    }
  }

  const [bicycleTypeCount, goalCount, surfaceCount, wheelTypeCount, wheelCount] =
    await Promise.all([
      prisma.bicycleType.count(),
      prisma.goal.count(),
      prisma.roadSurface.count(),
      prisma.wheelType.count(),
      prisma.wheel.count(),
    ]);

  return {
    bicycleTypes: bicycleTypeCount,
    goals: goalCount,
    roadSurfaces: surfaceCount,
    wheelTypes: wheelTypeCount,
    wheels: wheelCount,
  };
}
