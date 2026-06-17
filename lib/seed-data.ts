import { scrypt } from "node:crypto";
import { promisify } from "node:util";
import type { PrismaClient } from "../generated/prisma/client";
import {
  GENERATED_WHEELS,
  GENERATED_WHEEL_TYPES,
} from "./wheels.generated";

const scryptAsync = promisify(scrypt);
const keyLength = 64;
const demoPasswordSalt = "michelin-demo-seed";

export const demoUserCredentials = {
  email: "demo@michelin.local",
  password: "DemoPassword123!",
};

export type SeedResult = {
  bicycleBrands: number;
  bicycleModels: number;
  bicycleTypes: number;
  demoUser: {
    bicycles: number;
    email: string;
    espDevices: number;
    preferences: number;
    sensorReadings: number;
    wheelRecommendations: number;
  };
  goals: number;
  roadSurfaces: number;
  wheels: number;
  wheelTypes: number;
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
  {
    title: "E-Bike",
    description: "Electric-assist bicycles for city and mixed routes.",
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
  {
    title: "E-Bike 700c",
    wheelSize: "700c",
    description: "Reinforced 700c format for electric-assist bicycles.",
  },
  ...GENERATED_WHEEL_TYPES,
];

const bicycleBrands = [
  {
    name: "Specialized",
    description: "Performance road, gravel and commuter bicycles.",
  },
  {
    name: "Trek",
    description: "Road, city, gravel and mountain bicycles.",
  },
  {
    name: "Cannondale",
    description: "Road, gravel and active city bicycles.",
  },
  {
    name: "Canyon",
    description: "Direct-to-rider road, gravel and mountain bicycles.",
  },
  {
    name: "Giant",
    description: "Global bicycle brand with city, road and trail models.",
  },
  {
    name: "Cube",
    description: "European bicycle brand with sport and e-bike models.",
  },
  {
    name: "Orbea",
    description: "Road, mountain and electric-assist bicycles.",
  },
];

const bicycleModels = [
  {
    brandName: "Specialized",
    typeTitle: "Road",
    model: "Allez Sport",
    description: "Aluminum road bike for training and weekend rides.",
  },
  {
    brandName: "Specialized",
    typeTitle: "Gravel",
    model: "Diverge Comp",
    description: "Gravel bike for mixed surfaces and light trails.",
  },
  {
    brandName: "Specialized",
    typeTitle: "City",
    model: "Sirrus X 4.0",
    description: "Flat-bar city and fitness bike with wide 700c tires.",
  },
  {
    brandName: "Trek",
    typeTitle: "Road",
    model: "Domane AL 4",
    description: "Endurance road bike with disc brakes.",
  },
  {
    brandName: "Trek",
    typeTitle: "Gravel",
    model: "Checkpoint ALR 5",
    description: "Aluminum gravel bike for all-road riding.",
  },
  {
    brandName: "Trek",
    typeTitle: "Mountain",
    model: "Marlin 7",
    description: "29 inch hardtail mountain bike.",
  },
  {
    brandName: "Cannondale",
    typeTitle: "Gravel",
    model: "Topstone 2",
    description: "Gravel bike for endurance routes and daily exploration.",
  },
  {
    brandName: "Cannondale",
    typeTitle: "City",
    model: "Quick CX 3",
    description: "Hybrid city bike with mixed-surface capability.",
  },
  {
    brandName: "Canyon",
    typeTitle: "Road",
    model: "Endurace CF 7",
    description: "Carbon endurance road bike.",
  },
  {
    brandName: "Canyon",
    typeTitle: "Gravel",
    model: "Grizl 7",
    description: "Adventure gravel bike with clearance for wide tires.",
  },
  {
    brandName: "Giant",
    typeTitle: "City",
    model: "Escape 1 Disc",
    description: "Flat-bar commuter bike with disc brakes.",
  },
  {
    brandName: "Giant",
    typeTitle: "Mountain",
    model: "Talon 1",
    description: "29 inch hardtail mountain bike for trails.",
  },
  {
    brandName: "Cube",
    typeTitle: "E-Bike",
    model: "Kathmandu Hybrid Pro",
    description: "Electric trekking bike for commuting and touring.",
  },
  {
    brandName: "Orbea",
    typeTitle: "E-Bike",
    model: "Vibe H30",
    description: "Lightweight electric urban bike.",
  },
];

const wheels = GENERATED_WHEELS;

const demoPreferences = [
  {
    goalTitle: "Speed",
    roadSurfaceTitle: "Road",
    weeklyDistanceKm: 120,
    prioritySpeed: 9,
    priorityComfort: 5,
    priorityDurability: 6,
  },
  {
    goalTitle: "Comfort",
    roadSurfaceTitle: "Gravel",
    weeklyDistanceKm: 85,
    prioritySpeed: 5,
    priorityComfort: 9,
    priorityDurability: 7,
  },
  {
    goalTitle: "Durability",
    roadSurfaceTitle: "City",
    weeklyDistanceKm: 65,
    prioritySpeed: 4,
    priorityComfort: 7,
    priorityDurability: 10,
  },
];

const demoBicycles = [
  {
    name: "Daily Commuter",
    brandName: "Specialized",
    typeTitle: "City",
    model: "Sirrus X 4.0",
    wheelSize: "700c",
    tireWidthMm: 38,
    brakeType: "disc",
    serialNumber: "MR-DEMO-CITY-001",
    firmwareVersion: "1.4.0",
    batteryPercent: 87,
    roadSurfaceTitle: "City",
    readings: [
      reading(96, 4.1, 34, 21, 23, 17, 560, 7200, 5.8, 95),
      reading(72, 4.0, 35, 19, 24, 18, 585, 7050, 5.9, 94),
      reading(48, 3.9, 37, 24, 26, 19, 620, 6800, 6.1, 91),
      reading(18, 3.8, 39, 18, 25, 17, 660, 6550, 6.3, 88),
    ],
  },
  {
    name: "Weekend Road",
    brandName: "Canyon",
    typeTitle: "Road",
    model: "Endurace CF 7",
    wheelSize: "700c",
    tireWidthMm: 28,
    brakeType: "disc",
    serialNumber: "MR-DEMO-ROAD-001",
    firmwareVersion: "1.4.0",
    batteryPercent: 92,
    roadSurfaceTitle: "Road",
    readings: [
      reading(120, 6.3, 22, 31, 30, 20, 1120, 3500, 4.2, 98),
      reading(84, 6.2, 24, 33, 31, 21, 1180, 3300, 4.3, 96),
      reading(54, 6.1, 26, 36, 33, 22, 1240, 3000, 4.4, 94),
      reading(20, 6.0, 28, 34, 32, 19, 1310, 2750, 4.5, 92),
    ],
  },
  {
    name: "Gravel Explorer",
    brandName: "Trek",
    typeTitle: "Gravel",
    model: "Checkpoint ALR 5",
    wheelSize: "700c",
    tireWidthMm: 42,
    brakeType: "disc",
    serialNumber: "MR-DEMO-GRAVEL-001",
    firmwareVersion: "1.4.0",
    batteryPercent: 81,
    roadSurfaceTitle: "Gravel",
    readings: [
      reading(144, 3.2, 48, 24, 22, 14, 920, 2800, 6.8, 91),
      reading(96, 3.1, 51, 27, 25, 15, 980, 2600, 7.1, 89),
      reading(58, 3.0, 55, 26, 26, 17, 1040, 2250, 7.4, 85),
      reading(16, 2.9, 59, 25, 27, 18, 1110, 1900, 7.6, 82),
    ],
  },
  {
    name: "Trail Bike",
    brandName: "Trek",
    typeTitle: "Mountain",
    model: "Marlin 7",
    wheelSize: "29",
    tireWidthMm: 60,
    brakeType: "disc",
    serialNumber: "MR-DEMO-TRAIL-001",
    firmwareVersion: "1.3.8",
    batteryPercent: 76,
    roadSurfaceTitle: "Rough",
    readings: [
      reading(168, 2.0, 62, 16, 21, 13, 710, 1650, 8.5, 86),
      reading(110, 1.9, 66, 19, 23, 14, 760, 1420, 8.8, 83),
      reading(64, 1.9, 71, 20, 25, 16, 825, 980, 9.1, 80),
      reading(12, 1.8, 78, 18, 24, 15, 880, 620, 9.5, 77),
    ],
  },
];

const demoRecommendations = [
  {
    bikeName: "Daily Commuter",
    wheelModel: "Michelin City Protek Max",
    score: 93.4,
    reason:
      "Best mock match for daily city use: puncture protection, comfort and long service life.",
  },
  {
    bikeName: "Daily Commuter",
    wheelModel: "Michelin E-City Shield",
    score: 89.8,
    reason:
      "Strong alternative for rough city pavement and heavier commuter loads.",
  },
  {
    bikeName: "Weekend Road",
    wheelModel: "Michelin Road Performance",
    score: 94.1,
    reason:
      "Fast 700c road setup with low rolling resistance for paved training rides.",
  },
  {
    bikeName: "Weekend Road",
    wheelModel: "Michelin Endurance Comfort",
    score: 88.6,
    reason:
      "More comfort and durability for longer paved rides while keeping a quick feel.",
  },
  {
    bikeName: "Gravel Explorer",
    wheelModel: "Michelin Gravel Adventure",
    score: 92.7,
    reason:
      "High-volume gravel option for rough routes, comfort and casing durability.",
  },
  {
    bikeName: "Gravel Explorer",
    wheelModel: "Michelin Gravel Mixed",
    score: 87.9,
    reason:
      "Balanced mixed-surface tire for road transfers and compacted gravel.",
  },
  {
    bikeName: "Trail Bike",
    wheelModel: "Michelin Wild Trail Grip",
    score: 91.5,
    reason:
      "Aggressive trail tread for rough surfaces and high-wear sensor readings.",
  },
  {
    bikeName: "Trail Bike",
    wheelModel: "Michelin Trail Control",
    score: 86.3,
    reason:
      "Reliable 29 inch trail option with balanced durability and comfort.",
  },
];

export async function seedMockData(prisma: PrismaClient): Promise<SeedResult> {
  await seedReferenceData(prisma);

  const indexes = await loadSeedIndexes(prisma);
  await seedBicycleModels(prisma, indexes);

  const refreshedIndexes = await loadSeedIndexes(prisma);
  const demoUser = await seedDemoUser(prisma, refreshedIndexes);
  const counts = await loadCounts(prisma);

  return {
    ...counts,
    demoUser,
  };
}

async function seedReferenceData(prisma: PrismaClient) {
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

  for (const brand of bicycleBrands) {
    await prisma.bicycleBrand.upsert({
      create: brand,
      update: { description: brand.description },
      where: { name: brand.name },
    });
  }

  await seedWheels(prisma, await loadSeedIndexes(prisma));
}

async function seedBicycleModels(
  prisma: PrismaClient,
  indexes: SeedIndexes,
) {
  for (const modelData of bicycleModels) {
    const brand = requireFromMap(
      indexes.bicycleBrands,
      modelData.brandName,
      "bicycle brand",
    );
    const bicycleType = requireFromMap(
      indexes.bicycleTypes,
      modelData.typeTitle,
      "bicycle type",
    );

    await prisma.bicycleModel.upsert({
      create: {
        brandId: brand.id,
        bicycleTypeId: bicycleType.id,
        model: modelData.model,
        description: modelData.description,
      },
      update: { description: modelData.description },
      where: {
        brandId_bicycleTypeId_model: {
          brandId: brand.id,
          bicycleTypeId: bicycleType.id,
          model: modelData.model,
        },
      },
    });
  }
}

async function seedWheels(prisma: PrismaClient, indexes: SeedIndexes) {
  for (const wheelData of wheels) {
    const wheelType = requireFromMap(
      indexes.wheelTypes,
      wheelData.wheelTypeTitle,
      "wheel type",
    );

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

    await Promise.all([
      prisma.wheelBicycleType.deleteMany({ where: { wheelId: wheel.id } }),
      prisma.wheelRoadSurface.deleteMany({ where: { wheelId: wheel.id } }),
      prisma.wheelGoal.deleteMany({ where: { wheelId: wheel.id } }),
    ]);

    const bicycleTypeLinks = wheelData.bicycleTypes.map((title) => ({
      wheelId: wheel.id,
      bicycleTypeId: requireFromMap(indexes.bicycleTypes, title, "bicycle type")
        .id,
    }));
    const surfaceLinks = wheelData.surfaces.map((title) => ({
      wheelId: wheel.id,
      roadSurfaceId: requireFromMap(indexes.roadSurfaces, title, "road surface")
        .id,
    }));
    const goalLinks = Object.entries(wheelData.goalScores).map(
      ([title, score]) => ({
        wheelId: wheel.id,
        goalId: requireFromMap(indexes.goals, title, "goal").id,
        score,
      }),
    );

    await Promise.all([
      prisma.wheelBicycleType.createMany({ data: bicycleTypeLinks }),
      prisma.wheelRoadSurface.createMany({ data: surfaceLinks }),
      prisma.wheelGoal.createMany({ data: goalLinks }),
    ]);
  }
}

async function seedDemoUser(prisma: PrismaClient, indexes: SeedIndexes) {
  await prisma.user.deleteMany({
    where: { email: demoUserCredentials.email },
  });

  const user = await prisma.user.create({
    data: {
      email: demoUserCredentials.email,
      passwordHash: await hashSeedPassword(demoUserCredentials.password),
      firstName: "Demo",
      lastName: "Rider",
    },
  });

  await prisma.userPreference.createMany({
    data: demoPreferences.map((preference) => ({
      userId: user.id,
      goalId: requireFromMap(indexes.goals, preference.goalTitle, "goal").id,
      roadSurfaceId: requireFromMap(
        indexes.roadSurfaces,
        preference.roadSurfaceTitle,
        "road surface",
      ).id,
      weeklyDistanceKm: preference.weeklyDistanceKm,
      prioritySpeed: preference.prioritySpeed,
      priorityComfort: preference.priorityComfort,
      priorityDurability: preference.priorityDurability,
    })),
  });

  const createdBicycles: Array<{ id: number; name: string }> = [];

  for (const bicycleData of demoBicycles) {
    const bicycleModel = requireFromMap(
      indexes.bicycleModels,
      modelKey(bicycleData.brandName, bicycleData.typeTitle, bicycleData.model),
      "bicycle model",
    );
    const roadSurface = requireFromMap(
      indexes.roadSurfaces,
      bicycleData.roadSurfaceTitle,
      "road surface",
    );

    const userBicycle = await prisma.userBicycle.create({
      data: {
        userId: user.id,
        bicycleModelId: bicycleModel.id,
        name: bicycleData.name,
        wheelSize: bicycleData.wheelSize,
        tireWidthMm: bicycleData.tireWidthMm,
        brakeType: bicycleData.brakeType,
      },
    });
    const espDevice = await prisma.espDevice.create({
      data: {
        userId: user.id,
        userBicycleId: userBicycle.id,
        serialNumber: bicycleData.serialNumber,
        firmwareVersion: bicycleData.firmwareVersion,
        batteryPercent: bicycleData.batteryPercent,
        lastSeenAt: hoursAgo(1),
      },
    });

    await prisma.wheelSensorReading.createMany({
      data: bicycleData.readings.map((sensorReading) => ({
        espDeviceId: espDevice.id,
        userBicycleId: userBicycle.id,
        recordedAt: hoursAgo(sensorReading.hoursAgo),
        pressureBar: sensorReading.pressureBar,
        wearPercent: sensorReading.wearPercent,
        speedKmh: sensorReading.speedKmh,
        tireTempC: sensorReading.tireTempC,
        ambientTempC: sensorReading.ambientTempC,
        distanceKm: sensorReading.distanceKm,
        remainingKm: sensorReading.remainingKm,
        rollingResistance: sensorReading.rollingResistance,
        roadSurfaceId: roadSurface.id,
        batteryPercent: sensorReading.batteryPercent,
      })),
    });

    createdBicycles.push(userBicycle);
  }

  // Le catalogue réel ayant remplacé les roues fictives, on ne crée que les
  // recommandations de démo dont la roue référencée existe encore.
  const bicycleByName = indexBy(createdBicycles, (item) => item.name);
  const demoRecData = demoRecommendations
    .map((recommendation) => {
      const bicycle = bicycleByName.get(recommendation.bikeName);
      const wheel = indexes.wheels.get(recommendation.wheelModel);
      if (!bicycle || !wheel) return null;
      return {
        userId: user.id,
        userBicycleId: bicycle.id,
        wheelId: wheel.id,
        score: recommendation.score,
        reason: recommendation.reason,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  await prisma.wheelRecommendation.createMany({ data: demoRecData });

  const [
    bicycleCount,
    preferenceCount,
    espDeviceCount,
    sensorReadingCount,
    recommendationCount,
  ] = await Promise.all([
    prisma.userBicycle.count({ where: { userId: user.id } }),
    prisma.userPreference.count({ where: { userId: user.id } }),
    prisma.espDevice.count({ where: { userId: user.id } }),
    prisma.wheelSensorReading.count({
      where: { userBicycle: { userId: user.id } },
    }),
    prisma.wheelRecommendation.count({ where: { userId: user.id } }),
  ]);

  return {
    bicycles: bicycleCount,
    email: user.email,
    espDevices: espDeviceCount,
    preferences: preferenceCount,
    sensorReadings: sensorReadingCount,
    wheelRecommendations: recommendationCount,
  };
}

async function loadSeedIndexes(prisma: PrismaClient) {
  const [
    bicycleBrands,
    bicycleTypes,
    bicycleModels,
    goalsList,
    roadSurfacesList,
    wheelTypesList,
    wheelsList,
  ] = await Promise.all([
    prisma.bicycleBrand.findMany(),
    prisma.bicycleType.findMany(),
    prisma.bicycleModel.findMany({
      include: {
        brand: true,
        bicycleType: true,
      },
    }),
    prisma.goal.findMany(),
    prisma.roadSurface.findMany(),
    prisma.wheelType.findMany(),
    prisma.wheel.findMany(),
  ]);

  return {
    bicycleBrands: indexBy(bicycleBrands, (item) => item.name),
    bicycleTypes: indexBy(bicycleTypes, (item) => item.title),
    bicycleModels: indexBy(bicycleModels, (item) =>
      modelKey(item.brand.name, item.bicycleType.title, item.model),
    ),
    goals: indexBy(goalsList, (item) => item.title),
    roadSurfaces: indexBy(roadSurfacesList, (item) => item.title),
    wheelTypes: indexBy(wheelTypesList, (item) => item.title),
    wheels: indexBy(wheelsList, (item) => item.model),
  };
}

type SeedIndexes = Awaited<ReturnType<typeof loadSeedIndexes>>;

async function loadCounts(prisma: PrismaClient) {
  const [
    bicycleBrandCount,
    bicycleModelCount,
    bicycleTypeCount,
    goalCount,
    surfaceCount,
    wheelTypeCount,
    wheelCount,
  ] = await Promise.all([
    prisma.bicycleBrand.count(),
    prisma.bicycleModel.count(),
    prisma.bicycleType.count(),
    prisma.goal.count(),
    prisma.roadSurface.count(),
    prisma.wheelType.count(),
    prisma.wheel.count(),
  ]);

  return {
    bicycleBrands: bicycleBrandCount,
    bicycleModels: bicycleModelCount,
    bicycleTypes: bicycleTypeCount,
    goals: goalCount,
    roadSurfaces: surfaceCount,
    wheelTypes: wheelTypeCount,
    wheels: wheelCount,
  };
}

async function hashSeedPassword(password: string) {
  const key = (await scryptAsync(
    password,
    demoPasswordSalt,
    keyLength,
  )) as Buffer;

  return `scrypt:${demoPasswordSalt}:${key.toString("hex")}`;
}

function reading(
  hoursAgoValue: number,
  pressureBar: number,
  wearPercent: number,
  speedKmh: number,
  tireTempC: number,
  ambientTempC: number,
  distanceKm: number,
  remainingKm: number,
  rollingResistance: number,
  batteryPercent: number,
) {
  return {
    ambientTempC,
    batteryPercent,
    distanceKm,
    hoursAgo: hoursAgoValue,
    pressureBar,
    remainingKm,
    rollingResistance,
    speedKmh,
    tireTempC,
    wearPercent,
  };
}

function hoursAgo(value: number) {
  return new Date(Date.now() - value * 60 * 60 * 1000);
}

function modelKey(brandName: string, typeTitle: string, model: string) {
  return `${brandName}::${typeTitle}::${model}`;
}

function indexBy<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(getKey(item), item);
  }

  return map;
}

function requireFromMap<T>(map: Map<string, T>, key: string, label: string) {
  const item = map.get(key);

  if (!item) {
    throw new Error(`Missing ${label}: ${key}`);
  }

  return item;
}
