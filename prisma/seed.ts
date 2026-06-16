import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { demoUserCredentials, seedMockData } from "../lib/seed-data";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://michelin:michelin@localhost:55432/michelin";

if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
  throw new Error(
    "DATABASE_URL must be a PostgreSQL connection string for Prisma seed.",
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const result = await seedMockData(prisma);

    console.log("Seed completed.");
    console.log(JSON.stringify(result, null, 2));
    console.log(
      `Demo user: ${demoUserCredentials.email} / ${demoUserCredentials.password}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
