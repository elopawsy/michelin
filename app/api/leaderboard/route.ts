import type { NextRequest } from "next/server";
import { jsonError, parseJsonObject } from "@/lib/api-response";
import { getAuthSessionFromRequest, requireAuth } from "@/lib/auth";
import {
  getLeaderboard,
  sanitizeScoreInput,
  submitScore,
} from "@/lib/game-scores";

// GET /api/leaderboard?limit=10 — classement public (met en avant le joueur
// courant s'il est connecté). Le jeu étant ouvert aux invités, la lecture
// n'exige pas d'authentification.
export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam !== null ? Number(limitParam) : undefined;

    const data = await getLeaderboard({
      limit: limit !== undefined && Number.isFinite(limit) ? limit : undefined,
      userId: session?.userId,
    });

    return Response.json({ data });
  } catch {
    return jsonError("Unable to load leaderboard", 500);
  }
}

// POST /api/leaderboard — enregistre le score du joueur connecté.
export async function POST(request: NextRequest) {
  try {
    const session = requireAuth(request);
    const body = parseJsonObject(await request.json());
    const input = sanitizeScoreInput(body);

    if (!input) {
      return jsonError("Invalid score payload", 422);
    }

    const data = await submitScore(session.userId, input);

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Unable to submit score", 500);
  }
}
