"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "../ui";
import { GameCanvas } from "./GameCanvas";
import { Garage } from "./Garage";
import { GameOver } from "./GameOver";
import { Hud } from "./Hud";
import { Menu } from "./Menu";
import { TouchControls } from "./TouchControls";
import { tireById } from "./data/tires";
import { useGameInput } from "./useGameInput";
import { usePersistentProgress } from "./usePersistentProgress";
import type { HudSnapshot, RunResult, Screen } from "./engine/types";

function initialHud(connected: boolean): HudSnapshot {
  return {
    distance: 0,
    money: 0,
    combo: 1,
    energyPct: 1,
    score: 0,
    connected,
    runOver: false,
  };
}

// prefers-reduced-motion via external store (SSR-safe, pas de setState en effet).
function subscribeRM(cb: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function rmSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function rmServer(): boolean {
  return false;
}

export function GameClient() {
  const {
    progress,
    isUnlocked,
    requirementsMet,
    canBuy,
    buyTire,
    equipTire,
    bankRun,
  } = usePersistentProgress();

  const [screen, setScreen] = useState<Screen>("menu");
  const [paused, setPaused] = useState(false);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState<RunResult | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const reducedMotion = useSyncExternalStore(subscribeRM, rmSnapshot, rmServer);

  const equipped = tireById(progress.equipped);
  const connected = progress.equipped === "ride700";
  const tireStats = equipped.stats;
  const [hud, setHud] = useState<HudSnapshot>(() => initialHud(connected));

  const running = screen === "playing" && !paused;
  const { inputRef, setPedal, setBrake } = useGameInput(running);

  // pause auto quand l'onglet/fenêtre perd le focus
  useEffect(() => {
    if (screen !== "playing") return;
    const onHide = () => setPaused(true);
    const onVis = () => {
      if (document.hidden) setPaused(true);
    };
    window.addEventListener("blur", onHide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [screen]);

  const startRun = useCallback(() => {
    setResult(null);
    setHud(initialHud(progress.equipped === "ride700"));
    setPaused(false);
    setSeed((s) => s + 1);
    setScreen("playing");
  }, [progress.equipped]);

  const onRunEnd = useCallback(
    (r: RunResult) => {
      const banked = bankRun(r);
      setResult(banked);
      setScreen("over");
      setAnnouncement(
        `Sortie terminée. ${banked.distance} mètres, ${banked.coins} pièces, plus ${banked.payout} de gains.` +
          (banked.newBestDistance ? " Nouveau record de distance !" : ""),
      );
    },
    [bankRun],
  );

  // touches d'interface : P/Échap = pause, Entrée = démarrer/rejouer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        if (screen === "playing") setPaused((p) => !p);
      } else if (e.key === "Enter") {
        if (screen === "menu" || screen === "over") startRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, startRun]);

  const garageApi = useMemo(
    () => ({ isUnlocked, requirementsMet, canBuy, buyTire, equipTire }),
    [isUnlocked, requirementsMet, canBuy, buyTire, equipTire],
  );

  const showCanvas = screen === "playing" || screen === "over";

  return (
    <div className="relative h-[clamp(440px,72vh,720px)] w-full overflow-hidden rounded-card border border-bordure bg-bleu-nuit shadow-panel">
      <p className="sr-only">
        Jeu de vélo gravel : pédalez le plus loin possible, ramassez des pièces
        et débloquez les pneus Michelin. Commandes au clavier (flèches / espace)
        ou boutons tactiles.
      </p>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {showCanvas && (
        <GameCanvas
          seed={seed}
          tireStats={tireStats}
          connected={connected}
          running={running}
          reducedMotion={reducedMotion}
          inputRef={inputRef}
          onHud={setHud}
          onRunEnd={onRunEnd}
        />
      )}

      {screen === "playing" && (
        <>
          <Hud
            hud={hud}
            bestDistance={progress.bestDistance}
            onPause={() => setPaused(true)}
          />
          <TouchControls setPedal={setPedal} setBrake={setBrake} />
        </>
      )}

      {screen === "playing" && paused && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Jeu en pause"
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-bleu-nuit/75 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-extrabold text-white italic">Pause</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button autoFocus onClick={() => setPaused(false)}>
              Reprendre
            </Button>
            <Button variant="outline" onClick={() => setScreen("menu")}>
              Menu
            </Button>
          </div>
        </div>
      )}

      {screen === "menu" && (
        <Menu
          equipped={equipped}
          bestDistance={progress.bestDistance}
          money={progress.money}
          onPlay={startRun}
          onGarage={() => setScreen("garage")}
        />
      )}

      {screen === "over" && result && (
        <GameOver
          result={result}
          onRetry={startRun}
          onGarage={() => setScreen("garage")}
          onMenu={() => setScreen("menu")}
        />
      )}

      {screen === "garage" && (
        <Garage
          progress={progress}
          api={garageApi}
          onResume={startRun}
          onMenu={() => setScreen("menu")}
        />
      )}
    </div>
  );
}
