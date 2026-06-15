import type { NextRequest } from "next/server";
import { handleRecommendationsGet } from "@/lib/special-api-handlers";

export async function GET(request: NextRequest) {
  return handleRecommendationsGet(request);
}
