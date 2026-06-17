"use client";

import Image from "next/image";
import { Button, Picto } from "../ui";
import type { TireDef } from "./engine/types";

interface MenuProps {
  equipped: TireDef;
  bestDistance: number;
  money: number;
  onPlay: () => void;
  onGarage: () => void;
}

export function Menu({
  equipped,
  bestDistance,
  money,
  onPlay,
  onGarage,
}: MenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-fond/92 px-6 py-10 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <p className="text-[13px] font-bold tracking-[0.18em] text-bleu uppercase">
          Michelin Ride · Le jeu
        </p>
        <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-encre italic">
          La Côte
        </h1>
        <p className="max-w-md text-base leading-[1.6] text-encre-2">
          Pédalez le plus loin possible sur le gravel, ramassez des pièces et
          débloquez toute la gamme de pneus Michelin. Gérez votre énergie et
          gardez l&apos;équilibre&nbsp;!
        </p>

        <Image
          src="/hero-bibendum.png"
          alt=""
          width={220}
          height={260}
          priority
          className="h-40 w-auto drop-shadow-[0_8px_24px_rgba(0,12,52,0.12)]"
        />

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-encre-2">
          <span className="inline-flex items-center gap-2 rounded-pill border border-bordure bg-carte px-3 py-1.5 font-semibold shadow-card">
            Pneu équipé&nbsp;: <span className="text-encre">{equipped.model}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-pill border border-bordure bg-carte px-3 py-1.5 font-semibold shadow-card">
            Record&nbsp;:{" "}
            <span className="tabular-nums text-encre">
              {bestDistance.toLocaleString("fr-FR")} m
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-pill border border-bordure bg-carte px-3 py-1.5 font-semibold shadow-card">
            <Picto name="car-tire" className="h-4 w-4 text-jaune" />
            <span className="tabular-nums text-encre">
              {money.toLocaleString("fr-FR")}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onPlay}>Pédaler&nbsp;!</Button>
          <Button variant="outline" onClick={onGarage}>
            Garage
          </Button>
        </div>

        <p className="text-xs text-encre-3">
          Clavier&nbsp;: → ou Espace pour pédaler · ← pour freiner / reculer · P
          pour pause. Sur mobile&nbsp;: les deux boutons en bas de l&apos;écran.
        </p>
      </div>
    </div>
  );
}
