import type { NextRequest } from "next/server";
import {
  handleCollectionGet,
  handleCollectionPost,
} from "@/lib/crud-handlers";

type Context = {
  params: Promise<{ resource: string }>;
};

export function GET(request: NextRequest, context: Context) {
  return handleCollectionGet(request, context);
}

export function POST(request: NextRequest, context: Context) {
  return handleCollectionPost(request, context);
}
