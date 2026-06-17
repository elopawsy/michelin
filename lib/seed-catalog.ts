import "server-only";

import { prisma } from "@/lib/prisma";
import { seedMockData, type SeedResult } from "@/lib/seed-data";

export type { SeedResult };

export async function seedCatalog(): Promise<SeedResult> {
  return seedMockData(prisma);
}
