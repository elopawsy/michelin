"use client";

import type { ReactNode } from "react";
import { Picto } from "../ui";
import type { HudSnapshot } from "./engine/types";

interface HudProps {
  hud: HudSnapshot;
  bestDistance: number;
  onPause: () => void;
}

function Chip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-card-sm border border-bordure bg-carte/90 px-3 py-1.5 shadow-card backdrop-blur-sm">
      <p className="text-[10px] font-bold tracking-[0.16em] text-bleu uppercase">
        {label}
      </p>
      <p className="text-lg leading-none font-extrabold tabular-nums text-encre">
        {children}
      </p>
    </div>
  );
}

export function Hud({ hud, bestDistance, onPause }: HudProps) {
  const pct = Math.round(hud.energyPct * 100);
  const energyColor =
    hud.energyPct < 0.15
      ? "bg-danger"
      : hud.energyPct < 0.35
        ? "bg-warning"
        : "bg-succes";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-start gap-2">
        <Chip label="Distance">
          {hud.distance.toLocaleString("fr-FR")}&nbsp;m
        </Chip>
        <Chip label="Gains">
          <span className="inline-flex items-center gap-1.5">
            <Picto name="car-tire" className="h-4 w-4 text-jaune" />
            {hud.money.toLocaleString("fr-FR")}
          </span>
        </Chip>
        {hud.combo > 1 && (
          <div className="rounded-card-sm bg-jaune px-3 py-1.5 shadow-cta">
            <p className="text-[10px] font-bold tracking-[0.16em] text-bleu-fonce uppercase">
              Combo
            </p>
            <p className="text-lg leading-none font-extrabold tabular-nums text-bleu-fonce">
              ×{hud.combo}
            </p>
          </div>
        )}
        <Chip label="Record">
          {bestDistance.toLocaleString("fr-FR")}&nbsp;m
        </Chip>
        {hud.connected && (
          <div className="rounded-card-sm border border-bordure bg-bleu-fonce px-3 py-1.5 shadow-pneu">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-white">
              <span className="pulse-dot h-2 w-2 rounded-full bg-succes" />
              Connecté
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="rounded-card-sm border border-bordure bg-carte/90 px-3 py-2 shadow-card backdrop-blur-sm">
          <p className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold tracking-[0.16em] text-bleu uppercase">
            <span className="inline-flex items-center gap-1">
              <Picto name="battery" className="h-3.5 w-3.5 text-encre-2" />
              Énergie
            </span>
            <span className="tabular-nums text-encre-2">{pct}%</span>
          </p>
          <span className="block h-2 w-28 overflow-hidden rounded-pill bg-bordure">
            <span
              className={`block h-full rounded-pill transition-[width] duration-150 ${energyColor}`}
              style={{ width: `${pct}%` }}
            />
          </span>
        </div>
        <button
          type="button"
          onClick={onPause}
          aria-label="Pause"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-pill border border-bordure bg-carte text-bleu-fonce shadow-card transition hover:-translate-y-0.5 hover:border-bleu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
