import type { NextRequest } from "next/server";
import { handleRecommendationGeneratePost } from "@/lib/special-api-handlers";

export async function POST(request: NextRequest) {
  return handleRecommendationGeneratePost(request);
}
