import type { NextRequest } from "next/server";
import { jsonError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/user-response";

export async function GET(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return jsonError("User not found", 404);
    }

    return Response.json({ user: serializeUser(user) });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
