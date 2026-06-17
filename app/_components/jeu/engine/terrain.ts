// Terrain procédural déterministe : heightmap 1D C1-continue (somme de sinus +
// value-noise), seedée. Monde infini, mémoire O(1) (tout est fonction de x).
// Comme le sol est une fonction à valeur unique de x, une roue ne peut jamais
// "tunneler" — d'où la stabilité du modèle physique.

import {
  COIN_DX,
  COIN_HEIGHT,
  PX_PER_M,
  RAVITO_DX,
  RAVITO_HEIGHT,
} from "./constants";
import type { Vec2 } from "./types";

const TAU = Math.PI * 2;
const GROUND_BASE = 430; // y-monde de référence du sol (y vers le bas)

// PRNG déterministe.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(seed: number, i: number): number {
  let h = (i ^ seed) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(seed: number, x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(seed, i);
  const b = hash(seed, i + 1);
  return a + (b - a) * smooth(f);
}

export interface Terrain {
  groundY: (x: number) => number;
  slope: (x: number) => number;
  roughness: (x: number) => number;
  coinAt: (i: number) => Vec2 | null;
  ravitoAt: (i: number) => Vec2 | null;
}

export function createTerrain(seed: number): Terrain {
  const r = mulberry32(seed);
  const p1 = r() * TAU;
  const p2 = r() * TAU;
  const p3 = r() * TAU;
  const noiseSeed = (seed * 2654435761) >>> 0;
  const coinSeed = (seed ^ 0x9e3779b9) >>> 0;
  const ravitoSeed = (seed ^ 0x85ebca6b) >>> 0;

  const difficulty = (xm: number): number => Math.min(1.0, Math.max(0, xm) / 2000);

  const groundY = (x: number): number => {
    const xm = x / PX_PER_M;
    const d = difficulty(xm);
    const intro = Math.min(1, Math.max(0, xm) / 45); // démarrage calme
    // collines roulantes : longues longueurs d'onde, amplitudes mesurées ->
    // pentes franchissables. (pente max d'un sinus = amp·2π/longueur)
    const amp1 = (44 + 28 * d) * intro;
    const amp2 = (15 + 13 * d) * intro;
    const amp3 = (4 + 6 * d) * intro;
    let y = GROUND_BASE;
    y += amp1 * Math.sin((x / 720) * TAU + p1);
    y += amp2 * Math.sin((x / 320) * TAU + p2);
    y += amp3 * Math.sin((x / 150) * TAU + p3);
    y += (valueNoise(noiseSeed, x / 130) - 0.5) * 2 * (7 + 12 * d) * intro;
    y += xm * 0.15; // très légère descente générale vers la droite : aide à avancer
    return y;
  };

  const slope = (x: number): number => (groundY(x + 2) - groundY(x - 2)) / 4;

  const roughness = (x: number): number => {
    const d = difficulty(x / PX_PER_M);
    const n = Math.abs(valueNoise(noiseSeed + 99, x / 36) - 0.5) * 2;
    return Math.min(1, 0.18 + d * 0.5 + n * 0.5);
  };

  const coinAt = (i: number): Vec2 | null => {
    if (i < 1) return null;
    if (hash(coinSeed, i) < 0.36) return null; // ~64 % d'emplacements occupés
    const x = i * COIN_DX;
    return { x, y: groundY(x) - COIN_HEIGHT };
  };

  const ravitoAt = (i: number): Vec2 | null => {
    if (i < 1) return null;
    if (hash(ravitoSeed, i) < 0.45) return null;
    const x = i * RAVITO_DX;
    return { x, y: groundY(x) - RAVITO_HEIGHT };
  };

  return { groundY, slope, roughness, coinAt, ravitoAt };
}
