import type { NextRequest } from "next/server";
import {
  handleCollectionGet,
  handleCollectionPost,
} from "@/lib/crud-handlers";
import {
  handleDashboardGet,
  handleRecommendationsGet,
} from "@/lib/special-api-handlers";

type Context = {
  params: Promise<{ resource: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const { resource } = await context.params;

  if (resource === "dashboard") {
    return handleDashboardGet(request);
  }

  if (resource === "recommendations") {
    return handleRecommendationsGet(request);
  }

  return handleCollectionGet(request, context);
}

export function POST(request: NextRequest, context: Context) {
  return handleCollectionPost(request, context);
}
