import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { AuthSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

type FieldType = "boolean" | "date" | "decimal" | "float" | "int" | "string";

type FieldConfig = {
  type: FieldType;
  writable?: boolean;
  aliases?: string[];
};

export type ResourceConfig = {
  name: string;
  delegate: string;
  fields: Record<string, FieldConfig>;
  idFields: string[];
  compoundIdName?: string;
  hiddenFields?: string[];
  scopeWhere?: (session: AuthSession) => Record<string, unknown>;
  prepareCreate?: (
    data: Record<string, unknown>,
    raw: Record<string, unknown>,
    session: AuthSession,
  ) => Promise<Record<string, unknown>>;
  prepareUpdate?: (
    data: Record<string, unknown>,
    raw: Record<string, unknown>,
    session: AuthSession,
  ) => Promise<Record<string, unknown>>;
};

type PrismaDelegate = {
  findMany(args?: unknown): Promise<unknown[]>;
  findFirst(args: unknown): Promise<unknown | null>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
  update(args: {
    data: Record<string, unknown>;
    where: Record<string, unknown>;
  }): Promise<unknown>;
  delete(args: { where: Record<string, unknown> }): Promise<unknown>;
};

const commonId = field("int", false);
const createdAt = field("date", false);
const updatedAt = field("date", false);

const resources = [
  resource({
    name: "users",
    delegate: "user",
    idFields: ["id"],
    hiddenFields: ["passwordHash"],
    fields: {
      id: commonId,
      email: field("string"),
      passwordHash: field("string", false),
      firstName: field("string"),
      lastName: field("string"),
      createdAt,
      updatedAt,
    },
    scopeWhere: (session) => ({ id: session.userId }),
    prepareCreate: async (data, raw) => withUserPassword(data, raw, true),
    prepareUpdate: async (data, raw) => {
      delete data.id;
      return withUserPassword(data, raw, false);
    },
  }),
  resource({
    name: "bicycle-brands",
    delegate: "bicycleBrand",
    idFields: ["id"],
    fields: {
      id: commonId,
      name: field("string"),
      description: field("string"),
    },
  }),
  resource({
    name: "bicycle-types",
    delegate: "bicycleType",
    idFields: ["id"],
    fields: {
      id: commonId,
      title: field("string"),
      description: field("string"),
    },
  }),
  resource({
    name: "bicycle-models",
    delegate: "bicycleModel",
    idFields: ["id"],
    fields: {
      id: commonId,
      brandId: field("int"),
      bicycleTypeId: field("int"),
      model: field("string"),
      description: field("string"),
    },
  }),
  resource({
    name: "user-bicycles",
    delegate: "userBicycle",
    idFields: ["id"],
    fields: {
      id: commonId,
      userId: field("int", false),
      bicycleModelId: field("int"),
      name: field("string"),
      wheelSize: field("string"),
      tireWidthMm: field("int"),
      brakeType: field("string"),
      createdAt,
    },
    scopeWhere: (session) => ({ userId: session.userId }),
    prepareCreate: async (data, _raw, session) => ({
      ...data,
      userId: session.userId,
    }),
    prepareUpdate: async (data) => withoutKeys(data, ["userId"]),
  }),
  resource({
    name: "goals",
    delegate: "goal",
    idFields: ["id"],
    fields: {
      id: commonId,
      title: field("string"),
      description: field("string"),
    },
  }),
  resource({
    name: "road-surfaces",
    delegate: "roadSurface",
    idFields: ["id"],
    fields: {
      id: commonId,
      title: field("string"),
      description: field("string"),
    },
  }),
  resource({
    name: "user-preferences",
    delegate: "userPreference",
    idFields: ["id"],
    fields: {
      id: commonId,
      userId: field("int", false),
      goalId: field("int"),
      roadSurfaceId: field("int"),
      weeklyDistanceKm: field("float"),
      prioritySpeed: field("int"),
      priorityComfort: field("int"),
      priorityDurability: field("int"),
    },
    scopeWhere: (session) => ({ userId: session.userId }),
    prepareCreate: async (data, _raw, session) => ({
      ...data,
      userId: session.userId,
    }),
    prepareUpdate: async (data) => withoutKeys(data, ["userId"]),
  }),
  resource({
    name: "esp-devices",
    delegate: "espDevice",
    idFields: ["id"],
    fields: {
      id: commonId,
      userId: field("int", false),
      userBicycleId: field("int"),
      serialNumber: field("string"),
      firmwareVersion: field("string"),
      batteryPercent: field("int"),
      lastSeenAt: field("date"),
      createdAt,
    },
    scopeWhere: (session) => ({ userId: session.userId }),
    prepareCreate: async (data, _raw, session) => {
      await assertUserBicycleOwner(data.userBicycleId, session);
      return { ...data, userId: session.userId };
    },
    prepareUpdate: async (data, _raw, session) => {
      if (data.userBicycleId !== undefined) {
        await assertUserBicycleOwner(data.userBicycleId, session);
      }
      return withoutKeys(data, ["userId"]);
    },
  }),
  resource({
    name: "wheel-sensor-readings",
    delegate: "wheelSensorReading",
    idFields: ["id"],
    fields: {
      id: commonId,
      espDeviceId: field("int"),
      userBicycleId: field("int"),
      recordedAt: field("date"),
      pressureBar: field("float"),
      wearPercent: field("float"),
      speedKmh: field("float"),
      tireTempC: field("float"),
      ambientTempC: field("float"),
      distanceKm: field("float"),
      remainingKm: field("float"),
      rollingResistance: field("float"),
      roadSurfaceId: field("int"),
      batteryPercent: field("int"),
    },
    scopeWhere: (session) => ({ userBicycle: { userId: session.userId } }),
    prepareCreate: async (data, _raw, session) => {
      await assertUserBicycleOwner(data.userBicycleId, session);
      await assertEspDeviceOwner(data.espDeviceId, session);
      return data;
    },
    prepareUpdate: async (data, _raw, session) => {
      if (data.userBicycleId !== undefined) {
        await assertUserBicycleOwner(data.userBicycleId, session);
      }
      if (data.espDeviceId !== undefined) {
        await assertEspDeviceOwner(data.espDeviceId, session);
      }
      return data;
    },
  }),
  resource({
    name: "wheel-types",
    delegate: "wheelType",
    idFields: ["id"],
    fields: {
      id: commonId,
      title: field("string"),
      wheelSize: field("string"),
      description: field("string"),
    },
  }),
  resource({
    name: "wheels",
    delegate: "wheel",
    idFields: ["id"],
    fields: {
      id: commonId,
      wheelTypeId: field("int"),
      model: field("string"),
      description: field("string"),
      durabilityKm: field("int"),
      minTireWidthMm: field("int"),
      maxTireWidthMm: field("int"),
      weightG: field("int"),
      price: field("decimal"),
      tubelessReady: field("boolean"),
      brakeType: field("string"),
      rollingResistanceScore: field("int"),
      comfortScore: field("int"),
      speedScore: field("int"),
      durabilityScore: field("int"),
    },
  }),
  resource({
    name: "wheel-road-surfaces",
    delegate: "wheelRoadSurface",
    idFields: ["wheelId", "roadSurfaceId"],
    compoundIdName: "wheelId_roadSurfaceId",
    fields: {
      wheelId: field("int"),
      roadSurfaceId: field("int"),
    },
  }),
  resource({
    name: "wheel-goals",
    delegate: "wheelGoal",
    idFields: ["wheelId", "goalId"],
    compoundIdName: "wheelId_goalId",
    fields: {
      wheelId: field("int"),
      goalId: field("int"),
      score: field("int"),
    },
  }),
  resource({
    name: "wheel-bicycle-types",
    delegate: "wheelBicycleType",
    idFields: ["wheelId", "bicycleTypeId"],
    compoundIdName: "wheelId_bicycleTypeId",
    fields: {
      wheelId: field("int"),
      bicycleTypeId: field("int"),
    },
  }),
  resource({
    name: "wheel-recommendations",
    delegate: "wheelRecommendation",
    idFields: ["id"],
    fields: {
      id: commonId,
      userId: field("int", false),
      userBicycleId: field("int"),
      wheelId: field("int"),
      score: field("float"),
      reason: field("string"),
      createdAt,
    },
    scopeWhere: (session) => ({ userId: session.userId }),
    prepareCreate: async (data, _raw, session) => {
      await assertUserBicycleOwner(data.userBicycleId, session);
      return { ...data, userId: session.userId };
    },
    prepareUpdate: async (data, _raw, session) => {
      if (data.userBicycleId !== undefined) {
        await assertUserBicycleOwner(data.userBicycleId, session);
      }
      return withoutKeys(data, ["userId"]);
    },
  }),
];

const resourceMap = new Map<string, ResourceConfig>();

for (const config of resources) {
  resourceMap.set(config.name, config);
  resourceMap.set(config.name.replaceAll("-", "_"), config);
}

resourceMap.set("user", resourceMap.get("users")!);
resourceMap.set("bicycle_brand", resourceMap.get("bicycle-brands")!);
resourceMap.set("bicycle_type", resourceMap.get("bicycle-types")!);
resourceMap.set("bicycle_model", resourceMap.get("bicycle-models")!);
resourceMap.set("user_bicycle", resourceMap.get("user-bicycles")!);
resourceMap.set("goal", resourceMap.get("goals")!);
resourceMap.set("road_surface", resourceMap.get("road-surfaces")!);
resourceMap.set("user_preference", resourceMap.get("user-preferences")!);
resourceMap.set("esp_device", resourceMap.get("esp-devices")!);
resourceMap.set(
  "wheel_sensor_reading",
  resourceMap.get("wheel-sensor-readings")!,
);
resourceMap.set("wheel_type", resourceMap.get("wheel-types")!);
resourceMap.set("wheel", resourceMap.get("wheels")!);
resourceMap.set("wheel_road_surface", resourceMap.get("wheel-road-surfaces")!);
resourceMap.set("wheel_goal", resourceMap.get("wheel-goals")!);
resourceMap.set("wheel_bicycle_type", resourceMap.get("wheel-bicycle-types")!);
resourceMap.set(
  "wheel_recommendation",
  resourceMap.get("wheel-recommendations")!,
);

export function getResourceConfig(name: string) {
  return resourceMap.get(name);
}

export function listResourceNames() {
  return Array.from(new Set(resources.map((config) => config.name)));
}

export function getDelegate(config: ResourceConfig) {
  return (prisma as unknown as Record<string, PrismaDelegate>)[config.delegate];
}

export function normalizeWriteData(
  config: ResourceConfig,
  raw: Record<string, unknown>,
  mode: "create" | "update",
) {
  const data: Record<string, unknown> = {};
  const aliasMap = getAliasMap(config);

  for (const [key, value] of Object.entries(raw)) {
    const fieldName = aliasMap.get(key);
    const fieldConfig = fieldName ? config.fields[fieldName] : undefined;

    if (!fieldName || !fieldConfig?.writable) {
      continue;
    }

    if (mode === "update" && config.idFields.includes(fieldName)) {
      continue;
    }

    data[fieldName] = coerceValue(value, fieldConfig.type);
  }

  return data;
}

export function buildQueryWhere(
  config: ResourceConfig,
  searchParams: URLSearchParams,
) {
  const where: Record<string, unknown> = {};
  const aliasMap = getAliasMap(config);

  for (const [key, value] of searchParams.entries()) {
    if (["skip", "take"].includes(key)) {
      continue;
    }

    const fieldName = aliasMap.get(key);
    const fieldConfig = fieldName ? config.fields[fieldName] : undefined;

    if (!fieldName || !fieldConfig) {
      continue;
    }

    where[fieldName] = coerceValue(value, fieldConfig.type);
  }

  return where;
}

export function buildKeyWhere(config: ResourceConfig, key: string[]) {
  if (key.length !== config.idFields.length) {
    throw new Error(
      `Expected ${config.idFields.length} key segment(s): ${config.idFields.join(", ")}`,
    );
  }

  const idValues: Record<string, unknown> = {};

  for (const [index, fieldName] of config.idFields.entries()) {
    const fieldConfig = config.fields[fieldName];

    idValues[fieldName] = coerceValue(key[index], fieldConfig.type);
  }

  return idValues;
}

export function buildUniqueWhere(
  config: ResourceConfig,
  keyWhere: Record<string, unknown>,
) {
  if (config.compoundIdName) {
    return { [config.compoundIdName]: keyWhere };
  }

  return keyWhere;
}

export function serializeRecord(
  config: ResourceConfig,
  record: unknown,
): unknown {
  if (Array.isArray(record)) {
    return record.map((item) => serializeRecord(config, item));
  }

  if (!record || typeof record !== "object") {
    return record;
  }

  const output = { ...(record as Record<string, unknown>) };

  for (const field of config.hiddenFields ?? []) {
    delete output[field];
  }

  return output;
}

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { message: "Unique constraint failed", status: 409 };
    }
    if (error.code === "P2003") {
      return { message: "Foreign key constraint failed", status: 409 };
    }
    if (error.code === "P2025") {
      return { message: "Record not found", status: 404 };
    }
  }

  return { message: "Database request failed", status: 500 };
}

function resource(config: ResourceConfig) {
  return config;
}

function field(type: FieldType, writable = true, aliases: string[] = []) {
  return { aliases, type, writable };
}

function getAliasMap(config: ResourceConfig) {
  const aliasMap = new Map<string, string>();

  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    aliasMap.set(fieldName, fieldName);
    aliasMap.set(camelToSnake(fieldName), fieldName);

    for (const alias of fieldConfig.aliases ?? []) {
      aliasMap.set(alias, fieldName);
    }
  }

  return aliasMap;
}

function camelToSnake(value: string) {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function coerceValue(value: unknown, type: FieldType) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (type === "boolean") {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return ["1", "true", "yes"].includes(value.toLowerCase());
    }
    return Boolean(value);
  }

  if (type === "date") {
    return value instanceof Date ? value : new Date(String(value));
  }

  if (type === "decimal") {
    return String(value);
  }

  if (type === "float") {
    return Number(value);
  }

  if (type === "int") {
    return Number.parseInt(String(value), 10);
  }

  return String(value).trim();
}

async function withUserPassword(
  data: Record<string, unknown>,
  raw: Record<string, unknown>,
  required: boolean,
) {
  const password = typeof raw.password === "string" ? raw.password : "";

  if (password) {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    data.passwordHash = await hashPassword(password);
  } else if (required) {
    throw new Error("Password is required");
  }

  return data;
}

function withoutKeys(data: Record<string, unknown>, keys: string[]) {
  const output = { ...data };

  for (const key of keys) {
    delete output[key];
  }

  return output;
}

async function assertUserBicycleOwner(value: unknown, session: AuthSession) {
  const id = Number(value);

  if (!Number.isInteger(id)) {
    throw new Error("Valid userBicycleId is required");
  }

  const userBicycle = await prisma.userBicycle.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });

  if (!userBicycle) {
    throw new Error("User bicycle not found");
  }
}

async function assertEspDeviceOwner(value: unknown, session: AuthSession) {
  const id = Number(value);

  if (!Number.isInteger(id)) {
    throw new Error("Valid espDeviceId is required");
  }

  const espDevice = await prisma.espDevice.findFirst({
    where: { id, userId: session.userId },
    select: { id: true },
  });

  if (!espDevice) {
    throw new Error("ESP device not found");
  }
}
