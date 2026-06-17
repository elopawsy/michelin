"use client";

import { useEffect } from "react";
import { Picto } from "../ui";

interface TouchControlsProps {
  setPedal: (v: boolean) => void;
  setBrake: (v: boolean) => void;
}

export function TouchControls({ setPedal, setBrake }: TouchControlsProps) {
  // Relâche global : un doigt qui glisse hors du bouton ne reste jamais "collé".
  useEffect(() => {
    const release = () => {
      setPedal(false);
      setBrake(false);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [setPedal, setBrake]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4 select-none sm:p-6">
      <button
        type="button"
        aria-label="Freiner"
        onPointerDown={(e) => {
          e.preventDefault();
          setBrake(true);
        }}
        onPointerUp={() => setBrake(false)}
        onPointerLeave={() => setBrake(false)}
        className="pointer-events-auto flex h-20 w-20 touch-none items-center justify-center rounded-pill border border-white/15 bg-bleu-fonce text-white shadow-pneu transition active:scale-95"
      >
        <Picto name="car-tire" className="h-9 w-9" />
      </button>
      <button
        type="button"
        aria-label="Pédaler"
        onPointerDown={(e) => {
          e.preventDefault();
          setPedal(true);
        }}
        onPointerUp={() => setPedal(false)}
        onPointerLeave={() => setPedal(false)}
        className="pointer-events-auto flex h-24 w-24 touch-none items-center justify-center rounded-pill bg-jaune text-bleu-fonce shadow-cta transition active:scale-95"
      >
        <Picto name="off-road-car-tire" className="h-11 w-11" />
      </button>
    </div>
  );
}
