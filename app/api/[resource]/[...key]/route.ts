import type { NextRequest } from "next/server";
import {
  handleItemDelete,
  handleItemGet,
  handleItemPatch,
} from "@/lib/crud-handlers";
import {
  handleEspDeviceReadingPost,
  handleRecommendationGeneratePost,
} from "@/lib/special-api-handlers";

type Context = {
  params: Promise<{ resource: string; key: string[] }>;
};

export function GET(request: NextRequest, context: Context) {
  return handleItemGet(request, context);
}

export function PATCH(request: NextRequest, context: Context) {
  return handleItemPatch(request, context);
}

export async function POST(request: NextRequest, context: Context) {
  const { key, resource } = await context.params;

  if (resource === "recommendations" && key[0] === "generate") {
    return handleRecommendationGeneratePost(request);
  }

  if (
    resource === "esp-devices" &&
    key.length === 2 &&
    key[1] === "readings"
  ) {
    return handleEspDeviceReadingPost(request, Number(key[0]));
  }

  return Response.json({ error: "Route not found" }, { status: 404 });
}

export function DELETE(request: NextRequest, context: Context) {
  return handleItemDelete(request, context);
}
