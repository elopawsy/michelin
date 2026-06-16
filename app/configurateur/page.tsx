"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight, BackLink, Wordmark } from "../_components/ui";

const STEP = 2;
const TOTAL = 6;

type IconProps = { className?: string };

/** Châssis SVG commun : viewBox, style de trait et pédalier partagés. */
function BikeSvg({
  className = "",
  children,
}: IconProps & { children: ReactNode }) {
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
      <circle cx="58" cy="56" r="3" fill="currentColor" stroke="none" />
      {children}
    </svg>
  );
}

/** Route : guidon cintre (drop bar) et pneus fins. */
function RouteIcon({ className }: IconProps) {
  return (
    <BikeSvg className={className}>
      <circle cx="32" cy="56" r="20" />
      <circle cx="88" cy="56" r="20" />
      <path d="M32 56 50 28 58 56Z" />
      <path d="M50 28 76 30 58 56" />
      <path d="M76 30 88 56" />
      <path d="M45 27h11" />
      <path d="M76 30V23" />
      <path d="M70 23h14a6 6 0 0 1 6 6v2a6 6 0 0 1-6 6" />
    </BikeSvg>
  );
}

/** Gravel : guidon cintre et pneus larges (jante apparente). */
function GravelIcon({ className }: IconProps) {
  return (
    <BikeSvg className={className}>
      <circle cx="32" cy="56" r="20" />
      <circle cx="32" cy="56" r="13" />
      <circle cx="88" cy="56" r="20" />
      <circle cx="88" cy="56" r="13" />
      <path d="M32 56 50 28 58 56Z" />
      <path d="M50 28 76 30 58 56" />
      <path d="M76 30 88 56" />
      <path d="M45 27h11" />
      <path d="M76 30V23" />
      <path d="M70 23h14a6 6 0 0 1 6 6v2a6 6 0 0 1-6 6" />
    </BikeSvg>
  );
}

/** Ville : cadre col-de-cygne, guidon relevé et panier avant. */
function VilleIcon({ className }: IconProps) {
  return (
    <BikeSvg className={className}>
      <circle cx="32" cy="56" r="20" />
      <circle cx="88" cy="56" r="20" />
      <path d="M32 56 50 30 58 56Z" />
      <path d="M74 32 58 56" />
      <path d="M50 30Q56 48 74 32" />
      <path d="M74 32 88 56" />
      <path d="M45 29h11" />
      <path d="M74 32 76 19" />
      <path d="M76 19q-8 1-10 8" />
      <path d="M80 24h16l-2 12H82z" />
      <path d="M85 24v12M91 24v12" />
    </BikeSvg>
  );
}

/** VTT : guidon plat, fourche suspendue et pneus larges. */
function VttIcon({ className }: IconProps) {
  return (
    <BikeSvg className={className}>
      <circle cx="32" cy="56" r="20" />
      <circle cx="32" cy="56" r="13" />
      <circle cx="88" cy="56" r="20" />
      <circle cx="88" cy="56" r="13" />
      <path d="M32 56 50 28 58 56Z" />
      <path d="M50 28 76 30 58 56" />
      <path d="M76 30 88 56" />
      <path d="M81 31 87 48" />
      <path d="M45 27h11" />
      <path d="M76 30V22" />
      <path d="M68 22h16" />
    </BikeSvg>
  );
}

const BIKES: { id: string; label: string; Icon: (props: IconProps) => ReactNode }[] =
  [
    { id: "route", label: "ROUTE", Icon: RouteIcon },
    { id: "gravel", label: "GRAVEL", Icon: GravelIcon },
    { id: "ville", label: "VILLE", Icon: VilleIcon },
    { id: "vtt", label: "VTT", Icon: VttIcon },
  ];

export default function Configurateur() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-fond p-4 sm:p-6">
      <section className="flex w-full max-w-[900px] flex-col rounded-[28px] bg-carte p-6 shadow-panel sm:p-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackLink href="/" />
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
          Quel vélo utilisez-vous&nbsp;?
        </h1>
        <p className="mt-2 text-base text-encre-2">
          Sélectionnez votre type de vélo.
        </p>

        <div className="mx-auto mt-8 grid w-full max-w-[600px] grid-cols-2 gap-4 sm:gap-5">
          {BIKES.map((b) => {
            const active = selected === b.id;
            const Icon = b.Icon;
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
                <Icon className="h-12 w-auto text-bleu-fonce transition-transform duration-200 ease-out group-hover:scale-110" />
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
            href="/configurateur/terrain"
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
