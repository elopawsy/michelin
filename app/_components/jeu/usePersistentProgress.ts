"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { tireById } from "./data/tires";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
  writeProgress,
} from "./store";
import type { Progress, RunResult, TireId } from "./engine/types";

export interface ProgressApi {
  progress: Progress;
  isUnlocked: (id: TireId) => boolean;
  requirementsMet: (id: TireId) => boolean;
  canBuy: (id: TireId) => boolean;
  buyTire: (id: TireId) => void;
  equipTire: (id: TireId) => void;
  bankRun: (r: RunResult) => RunResult;
}

export function usePersistentProgress(): ProgressApi {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );

  const isUnlocked = useCallback(
    (id: TireId) => progress.owned.includes(id),
    [progress.owned],
  );

  const requirementsMet = useCallback(
    (id: TireId) =>
      tireById(id).requires.every((r) => progress.owned.includes(r)),
    [progress.owned],
  );

  const canBuy = useCallback(
    (id: TireId) => {
      if (progress.owned.includes(id)) return false;
      const def = tireById(id);
      return (
        def.requires.every((r) => progress.owned.includes(r)) &&
        progress.money >= def.cost
      );
    },
    [progress.owned, progress.money],
  );

  const buyTire = useCallback((id: TireId) => {
    writeProgress((prev) => {
      if (prev.owned.includes(id)) return prev;
      const def = tireById(id);
      if (!def.requires.every((r) => prev.owned.includes(r))) return prev;
      if (prev.money < def.cost) return prev;
      return {
        ...prev,
        money: prev.money - def.cost,
        owned: [...prev.owned, id],
        equipped: id,
      };
    });
  }, []);

  const equipTire = useCallback((id: TireId) => {
    writeProgress((prev) =>
      prev.owned.includes(id) ? { ...prev, equipped: id } : prev,
    );
  }, []);

  const bankRun = useCallback((r: RunResult): RunResult => {
    const prev = getProgressSnapshot();
    const newBestDistance = r.distance > prev.bestDistance;
    const newBestScore = r.score > prev.bestScore;
    writeProgress((p) => ({
      ...p,
      money: p.money + r.payout,
      bestDistance: Math.max(p.bestDistance, r.distance),
      bestScore: Math.max(p.bestScore, r.score),
      totalCoins: p.totalCoins + r.coins,
    }));
    return { ...r, newBestDistance, newBestScore };
  }, []);

  return useMemo(
    () => ({
      progress,
      isUnlocked,
      requirementsMet,
      canBuy,
      buyTire,
      equipTire,
      bankRun,
    }),
    [progress, isUnlocked, requirementsMet, canBuy, buyTire, equipTire, bankRun],
  );
}
