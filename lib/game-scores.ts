import "server-only";

import { prisma } from "@/lib/prisma";

/* Classement du mini-jeu « La Côte ».
   Une ligne par joueur (meilleur score), alimentée par les soumissions. */

const TIRE_IDS = new Set([
  "city",
  "endurance",
  "road",
  "gravel",
  "trail",
  "ride700",
]);

// Bornes de garde-fou (anti-valeurs aberrantes / triche grossière côté client).
const MAX_SCORE = 10_000_000;
const MAX_DISTANCE = 10_000_000;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export type ScoreInput = { score: number; distance: number; tireId: string };

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  name: string;
  initials: string;
  score: number;
  distance: number;
  tireId: string;
  isCurrentUser: boolean;
};

export type Leaderboard = {
  top: LeaderboardEntry[];
  /** Entrée du joueur courant (même s'il est hors du top). */
  me: LeaderboardEntry | null;
};

export type SubmitResult = {
  rank: number;
  bestScore: number;
  bestDistance: number;
  isNewBest: boolean;
};

type UserNameFields = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

const USER_SELECT = { firstName: true, lastName: true, email: true } as const;

function toBoundedInt(value: unknown, max: number): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i < 0 || i > max) return null;
  return i;
}

/** Valide/normalise une soumission client. Renvoie null si invalide (→ 422). */
export function sanitizeScoreInput(
  raw: Record<string, unknown>,
): ScoreInput | null {
  const score = toBoundedInt(raw.score, MAX_SCORE);
  const distance = toBoundedInt(raw.distance, MAX_DISTANCE);
  const tireId =
    typeof raw.tireId === "string" && TIRE_IDS.has(raw.tireId)
      ? raw.tireId
      : null;
  if (score === null || distance === null || tireId === null) return null;
  return { score, distance, tireId };
}

/** Nom public, respectueux de la vie privée : « Prénom N. ». */
function displayName(u: UserNameFields): string {
  const first = u.firstName?.trim();
  const last = u.lastName?.trim();
  if (first) return last ? `${first} ${last[0].toUpperCase()}.` : first;
  const local = u.email.split("@")[0] || "Joueur";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function initials(u: UserNameFields): string {
  const a = u.firstName?.trim()?.[0] ?? u.email[0] ?? "?";
  const b = u.lastName?.trim()?.[0] ?? "";
  return (a + b).toUpperCase();
}

function toEntry(
  row: {
    userId: number;
    bestScore: number;
    bestDistance: number;
    tireId: string;
    user: UserNameFields;
  },
  rank: number,
  currentUserId?: number,
): LeaderboardEntry {
  return {
    rank,
    userId: row.userId,
    name: displayName(row.user),
    initials: initials(row.user),
    score: row.bestScore,
    distance: row.bestDistance,
    tireId: row.tireId,
    isCurrentUser: row.userId === currentUserId,
  };
}

export async function getLeaderboard(
  opts: { limit?: number; userId?: number } = {},
): Promise<Leaderboard> {
  const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const rows = await prisma.gameScore.findMany({
    orderBy: [{ bestScore: "desc" }, { updatedAt: "asc" }],
    take: limit,
    include: { user: { select: USER_SELECT } },
  });

  const top = rows.map((row, i) => toEntry(row, i + 1, opts.userId));

  let me = top.find((e) => e.isCurrentUser) ?? null;

  // Joueur connecté hors du top : on calcule son rang réel.
  if (!me && opts.userId) {
    const own = await prisma.gameScore.findUnique({
      where: { userId: opts.userId },
      include: { user: { select: USER_SELECT } },
    });
    if (own) {
      const ahead = await prisma.gameScore.count({
        where: { bestScore: { gt: own.bestScore } },
      });
      me = toEntry(own, ahead + 1, opts.userId);
    }
  }

  return { top, me };
}

/** Enregistre un score : upsert qui ne conserve que le meilleur par joueur. */
export async function submitScore(
  userId: number,
  input: ScoreInput,
): Promise<SubmitResult> {
  const existing = await prisma.gameScore.findUnique({ where: { userId } });

  let bestScore: number;
  let bestDistance: number;
  let isNewBest: boolean;

  if (!existing) {
    const created = await prisma.gameScore.create({
      data: {
        userId,
        bestScore: input.score,
        bestDistance: input.distance,
        tireId: input.tireId,
        runs: 1,
      },
    });
    bestScore = created.bestScore;
    bestDistance = created.bestDistance;
    isNewBest = true;
  } else {
    isNewBest = input.score > existing.bestScore;
    const updated = await prisma.gameScore.update({
      where: { userId },
      data: {
        runs: { increment: 1 },
        bestScore: Math.max(existing.bestScore, input.score),
        bestDistance: Math.max(existing.bestDistance, input.distance),
        // Le pneu retenu est celui du meilleur score.
        ...(isNewBest ? { tireId: input.tireId } : {}),
      },
    });
    bestScore = updated.bestScore;
    bestDistance = updated.bestDistance;
  }

  const ahead = await prisma.gameScore.count({
    where: { bestScore: { gt: bestScore } },
  });

  return { rank: ahead + 1, bestScore, bestDistance, isNewBest };
}
