// Persistance localStorage exposée comme "external store" (useSyncExternalStore).
// SSR-safe : snapshot serveur stable, snapshot client lu après hydratation,
// sans mismatch ni setState dans un effet.

import type { Progress, TireId } from "./engine/types";

const KEY = "michelin-jeu-v1";
const VERSION = 1;
const VALID_IDS = new Set<string>([
  "city",
  "endurance",
  "road",
  "gravel",
  "trail",
  "ride700",
]);

function isTireId(v: unknown): v is TireId {
  return typeof v === "string" && VALID_IDS.has(v);
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function defaultProgress(): Progress {
  return {
    version: VERSION,
    money: 0,
    owned: ["city"],
    equipped: "city",
    bestDistance: 0,
    bestScore: 0,
    totalCoins: 0,
  };
}

const SERVER_SNAPSHOT: Progress = defaultProgress();

function read(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (!parsed || parsed.version !== VERSION) return defaultProgress();
    const owned: TireId[] = Array.isArray(parsed.owned)
      ? parsed.owned.filter(isTireId)
      : ["city"];
    if (!owned.includes("city")) owned.push("city");
    const equipped =
      isTireId(parsed.equipped) && owned.includes(parsed.equipped)
        ? parsed.equipped
        : "city";
    return {
      version: VERSION,
      money: num(parsed.money),
      owned,
      equipped,
      bestDistance: num(parsed.bestDistance),
      bestScore: num(parsed.bestScore),
      totalCoins: num(parsed.totalCoins),
    };
  } catch {
    return defaultProgress();
  }
}

function write(p: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // quota dépassé / mode privé : on ignore.
  }
}

// --- external store ---
let cache: Progress | null = null;
const listeners = new Set<() => void>();

export function subscribeProgress(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getProgressSnapshot(): Progress {
  if (cache === null) cache = read();
  return cache;
}

export function getProgressServerSnapshot(): Progress {
  return SERVER_SNAPSHOT;
}

export function writeProgress(updater: (prev: Progress) => Progress): Progress {
  const next = updater(getProgressSnapshot());
  cache = next;
  write(next);
  listeners.forEach((l) => l());
  return next;
}
