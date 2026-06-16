"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BackLink, Wordmark } from "../../_components/ui";

const STEP = 3;
const TOTAL = 6;

const TERRAINS = [
  { id: "route-lisse", label: "ROUTE LISSE", Icon: RouteLisseIcon },
  { id: "route-abimee", label: "ROUTE ABÎMÉE", Icon: RouteAbimeeIcon },
  { id: "chemins", label: "CHEMINS / SENTIERS", Icon: CheminIcon },
  { id: "ville", label: "VILLES / QUOTIDIEN", Icon: VilleIcon },
] as const;

type IconProps = { className?: string };

function RouteLisseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 8 8 56" />
      <path d="M42 8 56 56" />
      <path d="M32 12v6M32 28v6M32 44v6" />
    </svg>
  );
}

function RouteAbimeeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 8 8 56" />
      <path d="M42 8 56 56" />
      <path d="M30 10l5 7-6 6 5 8-5 7 6 8" />
    </svg>
  );
}

function CheminIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 56c0-12 10-14 10-24S16 16 22 8" />
      <path d="M40 8c4 8-4 12-4 22s10 14 10 26" />
      <circle cx="44" cy="20" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="38" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="38" cy="46" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function VilleIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 56V28l14-8v36" />
      <path d="M24 56V16l16 6v34" />
      <path d="M40 56V30l14 6v20" />
      <path d="M8 56h48" />
      <path d="M16 34v0M16 42v0M32 28v0M32 38v0M46 40v0" />
    </svg>
  );
}

export default function TerrainPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-fond p-4 sm:p-6">
      <section className="flex w-full max-w-[900px] flex-col rounded-[28px] bg-carte p-6 shadow-panel sm:p-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackLink href="/configurateur" />
            <Wordmark className="h-9 sm:h-11" />
          </div>
          <span className="text-sm font-semibold text-encre-2">
            Étape {STEP} / {TOTAL}
          </span>
        </div>

        <div className="mt-6 flex gap-2.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < STEP ? "bg-jaune" : "bg-bordure"}`}
            />
          ))}
        </div>

        <h1 className="mt-8 text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.01em] text-bleu-fonce">
          Sur quel terrain roulez-vous le plus souvent&nbsp;?
        </h1>
        <p className="mt-2 text-base text-encre-2">
          Sélectionnez votre terrain principal.
        </p>

        <div className="mx-auto mt-8 grid w-full max-w-[600px] grid-cols-2 gap-4 sm:gap-5">
          {TERRAINS.map(({ id, label, Icon }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                aria-pressed={active}
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 px-4 py-7 text-center transition duration-200 ease-out hover:-translate-y-1 hover:shadow-card-hover ${
                  active
                    ? "border-bleu bg-bleu-leger shadow-card"
                    : "border-bordure bg-carte hover:border-bleu"
                }`}
              >
                <Icon className="h-12 w-auto text-bleu-fonce transition-transform duration-200 ease-out group-hover:scale-110" />
                <span className="text-sm font-bold tracking-[0.06em] text-bleu-fonce">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/configurateur/kilometres"
            className="group inline-flex h-[56px] min-w-[16rem] items-center justify-center gap-3 rounded-full bg-jaune px-9 text-base font-bold text-bleu-fonce shadow-cta transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
          >
            Suivant
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
