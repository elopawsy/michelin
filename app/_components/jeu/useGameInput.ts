"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { InputState } from "./engine/types";

export interface GameInput {
  inputRef: RefObject<InputState>;
  setPedal: (v: boolean) => void;
  setBrake: (v: boolean) => void;
}

// Entrées du jeu via une ref stable (jamais de setState sur une touche de
// mouvement -> pas de re-render à 60 fps). "throttle" = pédaler.
export function useGameInput(enabled: boolean): GameInput {
  const inputRef = useRef<InputState>({ throttle: false, brake: false });

  useEffect(() => {
    if (!enabled) {
      inputRef.current.throttle = false;
      inputRef.current.brake = false;
      return;
    }
    const down = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
        case "d":
        case "D":
          inputRef.current.throttle = true;
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "ArrowDown":
        case "a":
        case "A":
        case " ":
          inputRef.current.brake = true;
          e.preventDefault();
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
        case "d":
        case "D":
          inputRef.current.throttle = false;
          break;
        case "ArrowLeft":
        case "ArrowDown":
        case "a":
        case "A":
        case " ":
          inputRef.current.brake = false;
          break;
      }
    };
    const release = () => {
      inputRef.current.throttle = false;
      inputRef.current.brake = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", release);
    };
  }, [enabled]);

  const setPedal = useCallback((v: boolean) => {
    inputRef.current.throttle = v;
  }, []);
  const setBrake = useCallback((v: boolean) => {
    inputRef.current.brake = v;
  }, []);

  return { inputRef, setPedal, setBrake };
}
