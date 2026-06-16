"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BackLink, Wordmark } from "../../_components/ui";

const STEP = 4;
const TOTAL = 6;

const VOLUMES = [
  { id: "faible", titre: "MOINS DE 50 KM", detail: "PAR SEMAINE", level: 0.18 },
  { id: "moyen", titre: "50 – 150 KM", detail: "PAR SEMAINE", level: 0.5 },
  { id: "eleve", titre: "PLUS DE 150 KM", detail: "PAR SEMAINE", level: 0.82 },
] as const;

/* Jauge de vitesse : arc semi-circulaire + aiguille dont l'angle suit `level`
   (0 = mini à gauche, 1 = maxi à droite). */
function GaugeIcon({ level, className = "" }: { level: number; className?: string }) {
  const angle = Math.PI * (1 - level); // π (gauche) → 0 (droite)
  const cx = 32;
  const cy = 38;
  const r = 22;
  const x2 = cx + r * 0.82 * Math.cos(angle);
  const y2 = cy - r * 0.82 * Math.sin(angle);

  return (
    <svg
      viewBox="0 0 64 56"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} />
      <path d="M16 38l-3-3M32 16v-4M48 38l3-3" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} />
      <circle cx={cx} cy={cy} r="3.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function KilometresPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-fond p-4 sm:p-6">
      <section className="flex w-full max-w-[900px] flex-col rounded-[28px] bg-carte p-6 shadow-panel sm:p-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackLink href="/configurateur/terrain" />
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
          Combien de kilomètres parcourez-vous par mois&nbsp;?
        </h1>
        <p className="mt-2 text-base text-encre-2">
          Sélectionnez votre volume moyen.
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-[560px] flex-col gap-4">
          {VOLUMES.map(({ id, titre, detail, level }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                aria-pressed={active}
                className={`group flex items-center gap-5 rounded-2xl border-2 px-6 py-5 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover ${
                  active
                    ? "border-bleu bg-bleu-leger shadow-card"
                    : "border-bordure bg-carte hover:border-bleu"
                }`}
              >
                <GaugeIcon
                  level={level}
                  className="h-11 w-auto shrink-0 text-bleu-fonce transition-transform duration-200 ease-out group-hover:scale-110"
                />
                <span className="flex flex-col leading-tight">
                  <span className="text-base font-bold tracking-[0.04em] text-bleu-fonce">
                    {titre}
                  </span>
                  <span className="text-sm font-semibold tracking-[0.04em] text-encre-2">
                    {detail}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/configurateur/capteur"
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
