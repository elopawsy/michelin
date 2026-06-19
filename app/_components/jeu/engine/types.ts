// Types partagés du jeu "Michelin Ride — La Côte" (aucun runtime ici).
// Donner de vrais types à tout le moteur tue @typescript-eslint/no-explicit-any.

export type TireId =
  | "city"
  | "endurance"
  | "road"
  | "gravel"
  | "trail"
  | "ride700";

export type Screen = "menu" | "playing" | "over" | "garage";

export interface Vec2 {
  x: number;
  y: number;
}

export interface InputState {
  throttle: boolean;
  brake: boolean;
}

// Stats de jeu (multiplicateurs) dérivées du catalogue Michelin réel.
export interface TireStats {
  pedalPower: number; // relance / puissance de pédalage relative
  grip: number; // adhérence (limite de traction)
  weight: number; // masse relative (accélération / inertie)
  wearRate: number; // usure relative (purement cosmétique en v1)
  topSpeed: number; // multiplicateur de vitesse max
  roadOnly: boolean; // grip s'effondre hors bitume (Road Performance)
}

// Scores catalogue 1-10 (affichés dans le garage).
export interface TireScores {
  rollingResistance: number;
  comfort: number;
  speed: number;
  durability: number;
}

export interface TireDef {
  id: TireId;
  model: string;
  category: string;
  blurb: string;
  priceEur: number; // prix réel catalogue (affichage)
  weightG: number; // poids réel catalogue (affichage)
  scores: TireScores;
  cost: number; // coût en argent du jeu (déblocage)
  unlockOrder: number;
  premium: boolean;
  requires: TireId[]; // pré-requis de déblocage
  picto: string; // slug dans /public/pictograms
  accentHex: string;
  stats: TireStats;
}

export interface BikeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  theta: number;
  omega: number;
  airTime: number;
  onGround: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

export interface HudSnapshot {
  distance: number; // mètres
  money: number; // argent gagné dans le run en cours
  combo: number; // multiplicateur 1..COMBO_MAX
  energyPct: number; // 0..1
  score: number;
  connected: boolean; // pneu Ride 700 équipé
  runOver: boolean;
}

export type RunEndReason = "crash" | "energy";

export interface RunResult {
  distance: number;
  coins: number;
  payout: number;
  flips: number;
  score: number;
  reason: RunEndReason;
  newBestDistance: boolean;
  newBestScore: boolean;
}

export interface Progress {
  version: number;
  money: number;
  owned: TireId[];
  equipped: TireId;
  bestDistance: number;
  bestScore: number;
  totalCoins: number;
}

export interface Viewport {
  width: number;
  height: number;
}

// Palette canvas : hex de la DA (globals.css) mappés à des rôles de jeu.
export interface Palette {
  skyTop: string;
  skyHorizon: string;
  hillsFar: string;
  hillsMid: string;
  groundBody: string;
  groundEdge: string;
  groundDepth: string;
  roughStipple: string;
  coinFill: string;
  coinRim: string;
  coinSpark: string;
  ravito: string;
  energyLow: string;
  energyMid: string;
  bikeWheel: string;
  bikeHub: string;
  dust: string;
  textOnCanvas: string;
  veil: string;
  crashFlash: string;
  connectedGlow: string;
}
