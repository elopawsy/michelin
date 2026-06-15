import type { NextRequest } from "next/server";
import {
  handleItemDelete,
  handleItemGet,
  handleItemPatch,
} from "@/lib/crud-handlers";

type Context = {
  params: Promise<{ resource: string; key: string[] }>;
};

export function GET(request: NextRequest, context: Context) {
  return handleItemGet(request, context);
}

export function PATCH(request: NextRequest, context: Context) {
  return handleItemPatch(request, context);
}

export function DELETE(request: NextRequest, context: Context) {
  return handleItemDelete(request, context);
}
