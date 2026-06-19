"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  DPR_CAP,
  DT,
  HUD_THROTTLE_MS,
  MAX_FRAME_DT,
  MAX_SUBSTEPS,
  PALETTE,
} from "./engine/constants";
import { render } from "./engine/render";
import { GameEngine } from "./engine/world";
import type {
  HudSnapshot,
  InputState,
  RunResult,
  TireStats,
  Viewport,
} from "./engine/types";

interface GameCanvasProps {
  seed: number;
  tireStats: TireStats;
  connected: boolean;
  running: boolean;
  reducedMotion: boolean;
  inputRef: RefObject<InputState>;
  onHud: (s: HudSnapshot) => void;
  onRunEnd: (r: RunResult) => void;
}

export function GameCanvas({
  seed,
  tireStats,
  connected,
  running,
  reducedMotion,
  inputRef,
  onHud,
  onRunEnd,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runningRef = useRef(running);
  const reducedRef = useRef(reducedMotion);
  const onHudRef = useRef(onHud);
  const onRunEndRef = useRef(onRunEnd);

  // Sync des valeurs réactives dans des refs : la boucle ne se recrée pas
  // (sinon le moteur serait réinitialisé à chaque pause).
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);
  useEffect(() => {
    onHudRef.current = onHud;
  }, [onHud]);
  useEffect(() => {
    onRunEndRef.current = onRunEnd;
  }, [onRunEnd]);

  // Boucle rAF + moteur. Recréée seulement quand le run (seed) ou le pneu change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new GameEngine(seed, tireStats, connected);
    const view: Viewport = { width: canvas.clientWidth || 800, height: canvas.clientHeight || 450 };

    const resize = () => {
      const parent = canvas.parentElement;
      const cssW = parent?.clientWidth || canvas.clientWidth || 800;
      const cssH = parent?.clientHeight || canvas.clientHeight || 450;
      const dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.width = cssW;
      view.height = cssH;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let raf = 0;
    let last = -1;
    let acc = 0;
    let lastHud = -1;
    let ended = false;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (last < 0) last = t;
      const frameDt = Math.min((t - last) / 1000, MAX_FRAME_DT);
      last = t;

      if (runningRef.current && !engine.runOver) {
        acc += frameDt;
        let n = 0;
        while (acc >= DT && n < MAX_SUBSTEPS) {
          engine.step(DT, inputRef.current, reducedRef.current);
          acc -= DT;
          n++;
        }
      } else {
        acc = 0; // pas d'avance rapide à la reprise
      }

      const alpha = runningRef.current && !engine.runOver ? acc / DT : 1;
      render(ctx, engine, PALETTE, view, {
        reducedMotion: reducedRef.current,
        time: t / 1000,
        alpha,
      });

      if (t - lastHud >= HUD_THROTTLE_MS) {
        lastHud = t;
        onHudRef.current(engine.hudSnapshot());
      }

      if (engine.runOver && !ended) {
        ended = true;
        onHudRef.current(engine.hudSnapshot());
        onRunEndRef.current(engine.result());
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [seed, tireStats, connected, inputRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-full w-full touch-none"
    />
  );
}
