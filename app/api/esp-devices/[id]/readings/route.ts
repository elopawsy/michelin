import type { NextRequest } from "next/server";
import { handleEspDeviceReadingPost } from "@/lib/special-api-handlers";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: Context) {
  const { id } = await context.params;

  return handleEspDeviceReadingPost(request, Number(id));
}
