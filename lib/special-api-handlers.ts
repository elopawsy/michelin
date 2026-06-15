import "server-only";

import type { NextRequest } from "next/server";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { loadDashboard } from "@/lib/dashboard";
import { createEspReading } from "@/lib/esp-readings";
import {
  generateWheelRecommendations,
  listRecommendations,
} from "@/lib/recommendations";

export async function handleDashboardGet(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const data = await loadDashboard(session);

    return Response.json({ data });
  } catch (error) {
    return specialErrorResponse(error, "Unable to load dashboard");
  }
}

export async function handleRecommendationsGet(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const data = await listRecommendations(session, request.nextUrl);

    return Response.json({ data });
  } catch (error) {
    return specialErrorResponse(error, "Unable to load recommendations");
  }
}

export async function handleRecommendationGeneratePost(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const body = parseJsonObject(await request.json());
    const userBicycleId = readNumber(body.userBicycleId ?? body.user_bicycle_id);

    if (!userBicycleId) {
      return jsonError("userBicycleId is required", 422);
    }

    const data = await generateWheelRecommendations(session, {
      limit: readNumber(body.limit) ?? undefined,
      preferenceId: readNumber(body.preferenceId ?? body.preference_id) ?? undefined,
      userBicycleId,
    });

    return Response.json({ data });
  } catch (error) {
    return specialErrorResponse(error, "Unable to generate recommendations");
  }
}

export async function handleEspDeviceReadingPost(
  request: NextRequest,
  espDeviceId: number,
) {
  try {
    const session = requireAuth(request);

    if (!Number.isInteger(espDeviceId)) {
      return jsonError("Valid ESP device id is required", 422);
    }

    const body = parseJsonObject(await request.json());
    const data = await createEspReading(session, espDeviceId, body);

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return specialErrorResponse(error, "Unable to create sensor reading");
  }
}

function specialErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    if (error.message.includes("not found")) {
      return jsonError(error.message, 404);
    }

    if (error.message.includes("required")) {
      return jsonError(error.message, 422);
    }
  }

  return jsonError(fallbackMessage, 500);
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
