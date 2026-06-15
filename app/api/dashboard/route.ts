import type { NextRequest } from "next/server";
import { handleDashboardGet } from "@/lib/special-api-handlers";

export async function GET(request: NextRequest) {
  return handleDashboardGet(request);
}
