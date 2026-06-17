"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Picto } from "../ui";
import { GAME_TIRES, tireById } from "./data/tires";
import type { Progress, TireDef, TireId } from "./engine/types";

interface GarageApi {
  isUnlocked: (id: TireId) => boolean;
  requirementsMet: (id: TireId) => boolean;
  canBuy: (id: TireId) => boolean;
  buyTire: (id: TireId) => void;
  equipTire: (id: TireId) => void;
}

interface GarageProps {
  progress: Progress;
  api: GarageApi;
  onResume: () => void;
  onMenu: () => void;
}

const SCORE_FIELDS: { key: keyof TireDef["scores"]; label: string; picto: string }[] = [
  { key: "rollingResistance", label: "Rendement", picto: "energy-efficiency" },
  { key: "comfort", label: "Confort", picto: "stability" },
  { key: "speed", label: "Vitesse", picto: "speed-rating" },
  { key: "durability", label: "Durabilité", picto: "tread-durability" },
];

function ScoreBar({
  label,
  picto,
  value,
  dark,
}: {
  label: string;
  picto: string;
  value: number;
  dark: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Picto
        name={picto}
        className={`h-4 w-4 shrink-0 ${dark ? "text-jaune" : "text-bleu"}`}
      />
      <span
        className={`w-[68px] shrink-0 text-[11px] font-semibold ${dark ? "text-white/70" : "text-encre-2"}`}
      >
        {label}
      </span>
      <span
        className={`h-1.5 flex-1 overflow-hidden rounded-pill ${dark ? "bg-white/20" : "bg-bordure"}`}
      >
        <span
          className={`block h-full rounded-pill ${dark ? "bg-jaune" : "bg-bleu"}`}
          style={{ width: `${value * 10}%` }}
        />
      </span>
    </div>
  );
}

function TireCard({
  tire,
  progress,
  api,
  onDiscover,
}: {
  tire: TireDef;
  progress: Progress;
  api: GarageApi;
  onDiscover: (t: TireDef) => void;
}) {
  const owned = api.isUnlocked(tire.id);
  const equipped = progress.equipped === tire.id;
  const reqMet = api.requirementsMet(tire.id);
  const affordable = api.canBuy(tire.id);
  const dark = tire.premium;

  const buy = () => {
    if (!api.canBuy(tire.id)) return;
    api.buyTire(tire.id);
    onDiscover(tire);
  };

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-card border p-5 shadow-card transition duration-200 hover:-translate-y-0.5 ${
        dark
          ? "border-bleu-fonce bg-bleu-fonce text-white shadow-pneu"
          : "border-bordure bg-carte"
      }`}
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: tire.accentHex }}
        aria-hidden="true"
      />
      <Picto
        name={tire.picto}
        className={`pointer-events-none absolute -right-5 -bottom-5 h-32 w-32 ${dark ? "text-white/10" : "text-bleu/10"}`}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p
            className={`text-[11px] font-bold tracking-[0.16em] uppercase ${dark ? "text-jaune" : "text-bleu"}`}
          >
            {tire.category}
          </p>
          <h3 className="mt-1 text-lg leading-tight font-extrabold">
            {tire.model}
          </h3>
        </div>
        {equipped ? (
          <Badge variant="connecte">
            <span className="h-2 w-2 rounded-full bg-succes" />
            Équipé
          </Badge>
        ) : tire.premium ? (
          <Badge variant="premium">Premium</Badge>
        ) : !owned ? (
          <Badge variant="neutre">Verrouillé</Badge>
        ) : null}
      </div>

      <p
        className={`relative mt-2 text-sm leading-[1.5] ${dark ? "text-white/75" : "text-encre-2"}`}
      >
        {tire.blurb}
      </p>

      <div
        className={`relative mt-3 flex gap-4 text-xs ${dark ? "text-white/60" : "text-encre-3"}`}
      >
        <span>{tire.priceEur.toFixed(2).replace(".", ",")} €</span>
        <span>{tire.weightG} g</span>
      </div>

      <div className="relative mt-3 flex flex-col gap-1.5">
        {SCORE_FIELDS.map((f) => (
          <ScoreBar
            key={f.key}
            label={f.label}
            picto={f.picto}
            value={tire.scores[f.key]}
            dark={dark}
          />
        ))}
      </div>

      <div className="relative mt-4">
        {equipped ? (
          <p
            className={`text-center text-sm font-bold ${dark ? "text-white/80" : "text-encre-2"}`}
          >
            Pneu actuellement monté
          </p>
        ) : owned ? (
          <Button
            variant={dark ? "primary" : "outline"}
            className="w-full"
            onClick={() => api.equipTire(tire.id)}
          >
            Équiper
          </Button>
        ) : !reqMet ? (
          <p
            className={`text-center text-xs font-semibold ${dark ? "text-white/70" : "text-encre-3"}`}
          >
            Nécessite&nbsp;:{" "}
            {tire.requires.map((r) => tireById(r).model).join(" + ")}
          </p>
        ) : (
          <Button className="w-full" disabled={!affordable} onClick={buy}>
            Débloquer · {tire.cost.toLocaleString("fr-FR")}
            <Picto name="car-tire" className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  );
}

export function Garage({ progress, api, onResume, onMenu }: GarageProps) {
  const [discovered, setDiscovered] = useState<TireDef | null>(null);

  useEffect(() => {
    if (!discovered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDiscovered(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [discovered]);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-fond px-6 py-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold tracking-[0.18em] text-bleu uppercase">
              Garage
            </p>
            <h2 className="mt-1 text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-extrabold text-encre italic">
              La gamme Michelin
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-pill border border-bordure bg-carte px-4 py-2 shadow-card">
            <Picto name="car-tire" className="h-6 w-6 text-jaune" />
            <span className="text-xl font-extrabold tabular-nums text-encre">
              {progress.money.toLocaleString("fr-FR")}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_TIRES.map((tire) => (
            <TireCard
              key={tire.id}
              tire={tire}
              progress={progress}
              api={api}
              onDiscover={setDiscovered}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={onResume}>Pédaler&nbsp;!</Button>
          <Button variant="outline" onClick={onMenu}>
            Menu
          </Button>
        </div>
      </div>

      {discovered && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-bleu-nuit/80 px-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="discover-title"
            className="w-full max-w-md rounded-panel border border-bordure bg-carte p-7 text-center shadow-panel"
          >
            <Badge variant="premium">Nouveau pneu débloqué&nbsp;!</Badge>
            <Picto
              name={discovered.picto}
              className="mx-auto mt-4 h-16 w-16 text-bleu"
            />
            <h3
              id="discover-title"
              className="mt-3 text-2xl font-extrabold text-encre italic"
            >
              {discovered.model}
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-encre-2">
              {discovered.blurb}
            </p>
            <Button autoFocus className="mt-5" onClick={() => setDiscovered(null)}>
              Continuer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
