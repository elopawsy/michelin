"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Wordmark } from "../_components/ui";

const STEP = 2;
const TOTAL = 4;

const BIKES = [
  { id: "route", label: "ROUTE" },
  { id: "gravel", label: "GRAVEL" },
  { id: "ville", label: "VILLE" },
  { id: "vtt", label: "VTT" },
];

function BikeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="28" cy="54" r="22" />
      <circle cx="92" cy="54" r="22" />
      <circle cx="56" cy="54" r="3.5" fill="currentColor" stroke="none" />
      <path d="M28 54H56L46 28H78L92 54" />
      <path d="M56 54 78 28" />
      <path d="M28 54 46 28" />
      <path d="M40 27 53 27" />
      <path d="M78 28c7-3 13-1 16 4" />
    </svg>
  );
}

export default function Configurateur() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-fond p-4 sm:p-6">
      <section className="flex w-full max-w-[900px] flex-col rounded-[28px] bg-carte p-6 shadow-panel sm:p-9">
        <div className="flex items-center justify-between">
          <Wordmark className="h-9 sm:h-11" />
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
          Quel vélo utilisez-vous&nbsp;?
        </h1>
        <p className="mt-2 text-base text-encre-2">
          Sélectionnez votre type de vélo.
        </p>

        <div className="mx-auto mt-8 grid w-full max-w-[600px] grid-cols-2 gap-4 sm:gap-5">
          {BIKES.map((b) => {
            const active = selected === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b.id)}
                aria-pressed={active}
                className={`group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 px-4 py-7 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-card-hover ${
                  active
                    ? "border-bleu bg-bleu-leger shadow-card"
                    : "border-bordure bg-carte hover:border-bleu"
                }`}
              >
                <BikeIcon className="h-12 w-auto text-bleu-fonce transition-transform duration-200 ease-out group-hover:scale-110" />
                <span className="text-sm font-bold tracking-[0.06em] text-bleu-fonce">
                  {b.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bleu-fonce" />
          <span className="h-2.5 w-2.5 rounded-full bg-dot" />
          <span className="h-2.5 w-2.5 rounded-full bg-dot" />
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/pneu"
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
