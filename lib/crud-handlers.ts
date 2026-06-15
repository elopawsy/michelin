import "server-only";

import type { NextRequest } from "next/server";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import {
  buildKeyWhere,
  buildQueryWhere,
  buildUniqueWhere,
  getDelegate,
  getResourceConfig,
  handlePrismaError,
  listResourceNames,
  normalizeWriteData,
  serializeRecord,
} from "@/lib/crud-resources";

type CollectionContext = {
  params: Promise<{ resource: string }>;
};

type ItemContext = {
  params: Promise<{ resource: string; key: string[] }>;
};

export async function handleCollectionGet(
  request: NextRequest,
  context: CollectionContext,
) {
  try {
    const session = requireAuth(request);
    const config = await getConfig(context);
    const delegate = getDelegate(config);
    const where = mergeWhere(
      buildQueryWhere(config, request.nextUrl.searchParams),
      config.scopeWhere?.(session),
    );
    const take = numberParam(request.nextUrl.searchParams.get("take"), 100);
    const skip = numberParam(request.nextUrl.searchParams.get("skip"), 0);
    const records = await delegate.findMany({
      skip,
      take,
      where,
    });

    return Response.json({
      data: serializeRecord(config, records),
      meta: { skip, take },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleCollectionPost(
  request: NextRequest,
  context: CollectionContext,
) {
  try {
    const session = requireAuth(request);
    const config = await getConfig(context);
    const delegate = getDelegate(config);
    const raw = parseJsonObject(await request.json());
    let data = normalizeWriteData(config, raw, "create");

    data = config.prepareCreate
      ? await config.prepareCreate(data, raw, session)
      : data;

    const record = await delegate.create({ data });

    return Response.json(
      { data: serializeRecord(config, record) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleItemGet(
  request: NextRequest,
  context: ItemContext,
) {
  try {
    const session = requireAuth(request);
    const { config, keyWhere } = await getItemConfig(context);
    const delegate = getDelegate(config);
    const record = await delegate.findFirst({
      where: mergeWhere(keyWhere, config.scopeWhere?.(session)),
    });

    if (!record) {
      return jsonError("Record not found", 404);
    }

    return Response.json({ data: serializeRecord(config, record) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleItemPatch(
  request: NextRequest,
  context: ItemContext,
) {
  try {
    const session = requireAuth(request);
    const { config, keyWhere } = await getItemConfig(context);
    const delegate = getDelegate(config);
    const existing = await delegate.findFirst({
      where: mergeWhere(keyWhere, config.scopeWhere?.(session)),
    });

    if (!existing) {
      return jsonError("Record not found", 404);
    }

    const raw = parseJsonObject(await request.json());
    let data = normalizeWriteData(config, raw, "update");

    data = config.prepareUpdate
      ? await config.prepareUpdate(data, raw, session)
      : data;

    const record = await delegate.update({
      data,
      where: buildUniqueWhere(config, keyWhere),
    });

    return Response.json({ data: serializeRecord(config, record) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleItemDelete(
  request: NextRequest,
  context: ItemContext,
) {
  try {
    const session = requireAuth(request);
    const { config, keyWhere } = await getItemConfig(context);
    const delegate = getDelegate(config);
    const existing = await delegate.findFirst({
      where: mergeWhere(keyWhere, config.scopeWhere?.(session)),
    });

    if (!existing) {
      return jsonError("Record not found", 404);
    }

    const record = await delegate.delete({
      where: buildUniqueWhere(config, keyWhere),
    });

    return Response.json({ data: serializeRecord(config, record) });
  } catch (error) {
    return errorResponse(error);
  }
}

async function getConfig(context: CollectionContext) {
  const { resource } = await context.params;
  const config = getResourceConfig(resource);

  if (!config) {
    throw new Error(`Unknown resource. Available: ${listResourceNames().join(", ")}`);
  }

  return config;
}

async function getItemConfig(context: ItemContext) {
  const { key } = await context.params;
  const config = await getConfig(context);

  return {
    config,
    keyWhere: buildKeyWhere(config, key),
  };
}

function numberParam(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const number = Number.parseInt(value, 10);

  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function mergeWhere(
  base: Record<string, unknown>,
  scoped?: Record<string, unknown>,
) {
  if (!scoped || Object.keys(scoped).length === 0) {
    return base;
  }

  if (Object.keys(base).length === 0) {
    return scoped;
  }

  return { AND: [base, scoped] };
}

function errorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    if (
      error.message.startsWith("Unknown resource") ||
      error.message.startsWith("Expected")
    ) {
      return jsonError(error.message, 404);
    }

    if (
      error.message.includes("required") ||
      error.message.includes("Password")
    ) {
      return jsonError(error.message, 422);
    }
  }

  const prismaError = handlePrismaError(error);

  return jsonError(prismaError.message, prismaError.status);
}
