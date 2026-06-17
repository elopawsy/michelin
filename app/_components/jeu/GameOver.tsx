"use client";

import { Badge, Button, Picto } from "../ui";
import type { RunResult } from "./engine/types";

interface GameOverProps {
  result: RunResult;
  onRetry: () => void;
  onGarage: () => void;
  onMenu: () => void;
}

function Stat({
  label,
  value,
  picto,
}: {
  label: string;
  value: string;
  picto: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-card-sm border border-bordure bg-fond px-4 py-3">
      <Picto name={picto} className="mb-1 h-5 w-5 text-bleu" />
      <p className="text-xl leading-none font-extrabold tabular-nums text-encre">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-bold tracking-[0.12em] text-encre-2 uppercase">
        {label}
      </p>
    </div>
  );
}

export function GameOver({ result, onRetry, onGarage, onMenu }: GameOverProps) {
  const title =
    result.reason === "crash" ? "Chute !" : "Plus d'énergie !";
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-bleu-nuit/80 px-6 py-10 backdrop-blur-sm">
      <div
        className="flex w-full max-w-lg flex-col items-center gap-5 rounded-panel border border-bordure bg-carte p-7 text-center shadow-panel sm:p-9"
        role="dialog"
        aria-label="Fin de la sortie"
      >
        <p className="text-[13px] font-bold tracking-[0.18em] text-bleu uppercase">
          Fin de la sortie
        </p>
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-extrabold text-encre italic">
          {title}
        </h2>

        {(result.newBestDistance || result.newBestScore) && (
          <Badge variant="premium">Nouveau record&nbsp;!</Badge>
        )}

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Distance"
            picto="mileage"
            value={`${result.distance.toLocaleString("fr-FR")} m`}
          />
          <Stat
            label="Pièces"
            picto="car-tire"
            value={result.coins.toLocaleString("fr-FR")}
          />
          <Stat
            label="Figures"
            picto="stability"
            value={result.flips.toLocaleString("fr-FR")}
          />
          <Stat
            label="Score"
            picto="speed-rating"
            value={result.score.toLocaleString("fr-FR")}
          />
        </div>

        <div className="flex items-center gap-2 rounded-card-sm bg-bleu-fonce px-5 py-3 text-white shadow-pneu">
          <Picto name="car-tire" className="h-6 w-6 text-jaune" />
          <span className="text-lg font-extrabold tabular-nums">
            +{result.payout.toLocaleString("fr-FR")}
          </span>
          <span className="text-sm text-white/70">ajoutés au porte-monnaie</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button autoFocus onClick={onRetry}>
            Rejouer
          </Button>
          <Button variant="outline" onClick={onGarage}>
            Garage
          </Button>
          <Button variant="outline" onClick={onMenu}>
            Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
