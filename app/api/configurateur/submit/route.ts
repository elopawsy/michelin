import type { NextRequest } from "next/server";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { submitConfiguratorDraft } from "@/lib/configurator";

export async function POST(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const body = parseJsonObject(await request.json());
    const data = await submitConfiguratorDraft(session, body);

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return configuratorErrorResponse(error);
  }
}

function configuratorErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    if (
      error.message.includes("required") ||
      error.message.includes("invalid") ||
      error.message.includes("between") ||
      error.message.includes("not available") ||
      error.message.includes("does not match")
    ) {
      return jsonError(error.message, 422);
    }
  }

  return jsonError("Unable to submit configurator", 500);
}
