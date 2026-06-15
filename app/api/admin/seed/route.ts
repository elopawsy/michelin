import type { NextRequest } from "next/server";
import { jsonError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { seedCatalog } from "@/lib/seed-catalog";

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);

    const data = await seedCatalog();

    return Response.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return jsonError("Unable to seed catalog", 500);
  }
}
