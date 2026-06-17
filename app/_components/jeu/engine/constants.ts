// Toutes les constantes de réglage du jeu — un seul fichier pour équilibrer.
// Le code ne contient jamais de nombre magique. Thème : VÉLO gravel (pas de
// moteur) -> on "pédale", la ressource qui descend est l'ÉNERGIE du cycliste,
// rechargée par des ravitaillements (bidons / gels).

import type { Palette } from "./types";

// --- Boucle / temps ---
export const DT = 1 / 60; // pas fixe (s)
export const MAX_FRAME_DT = 0.1; // anti spirale-de-la-mort (s)
export const MAX_SUBSTEPS = 6;
export const PX_PER_M = 14; // pixels-monde par mètre

// --- Physique ---
export const GRAVITY = 1800; // px/s²
export const WHEEL_BASE = 60; // empattement (px)
export const WHEEL_R = 18; // rayon de roue (px)
export const K_GROUND = 900; // raideur ressort sol
export const C_GROUND = 24; // amortissement ressort sol
export const PEDAL_FORCE = 1750; // force de pédalage (× pedalPower du pneu)
export const BRAKE_FORCE = 1600; // force de frein
export const GRIP_MU = 3.2; // coefficient d'adhérence de base (× grip du pneu)
export const WHEELIE_TORQUE = 6500; // couple de cabrage sous relance (pop borné)
export const WHEELIE_OMEGA_CAP = 0.5; // au-delà, on coupe le couple : pas de backflip
export const AIR_TORQUE = 1.5; // contrôle de rotation en l'air (rad/s²) — doux pour ne pas backflip
export const ANG_DRAG = 4.5; // frottement angulaire (/s) — stabilise vite l'assiette
export const LIN_DRAG = 0.12; // frottement linéaire air (/s)
export const INERTIA_FACTOR = 5200; // I = masse × ce facteur
export const V_MAX = 1600; // vitesse max absolue (px/s) × topSpeed
export const OMEGA_MAX = 12; // vitesse angulaire max (rad/s)
export const CRASH_ANGLE = 1.95; // ~112° d'inclinaison = chute
export const CRASH_GRACE = 0.25; // maintenue ce temps avant la chute (s)
export const OFFROAD_PENALTY = 0.45; // grip Road Performance hors bitume
export const SAMPLE_STEP = 8; // pas d'échantillonnage du terrain (px)
export const DPR_CAP = 2;
export const CAM_SMOOTH_Y = 0.08; // lissage vertical de la caméra (0..1, plus bas = plus doux)

// --- Économie ---
export const COIN_VALUE = 10;
export const DIST_PER_COIN = 25; // 1 "pièce de distance" tous les X mètres
export const COMBO_WINDOW = 1.6; // s pour enchaîner les pièces
export const COMBO_MAX = 5;
export const FLIP_BONUS = 100; // par rotation complète à la réception

// --- Énergie du cycliste ---
export const ENERGY_MAX = 100;
export const DRAIN_IDLE = 1.5; // /s en roue libre
export const DRAIN_PEDAL = 6; // /s en pédalant
export const RAVITO_REFILL = 35; // recharge par ravitaillement
export const COIN_ENERGY_BONUS = 1.5; // une pièce regonfle un peu l'énergie

// --- Génération du monde ---
export const COIN_DX = 220; // espacement des emplacements de pièces (px)
export const COIN_HEIGHT = 46; // hauteur de flottement au-dessus du sol
export const RAVITO_DX = 1500; // espacement des ravitaillements (px)
export const RAVITO_HEIGHT = 40;
export const PICKUP_RADIUS = 34; // rayon de collecte

// --- HUD ---
export const HUD_THROTTLE_MS = 100; // ~10 Hz

// --- Palette canvas (hex de la DA, globals.css) ---
export const PALETTE: Palette = {
  skyTop: "#eef4ff",
  skyHorizon: "#f7f9fc",
  hillsFar: "#27509b",
  hillsMid: "#00205b",
  groundBody: "#00205b",
  groundEdge: "#fce500",
  groundDepth: "#27509b",
  roughStipple: "#33415c",
  coinFill: "#fce500",
  coinRim: "#00205b",
  coinSpark: "#ffd600",
  ravito: "#2e7d32",
  energyLow: "#b71c1c",
  energyMid: "#f9a825",
  bikeWheel: "#000c34",
  bikeHub: "#fce500",
  dust: "#6b7280",
  textOnCanvas: "#000c34",
  veil: "#000c34",
  crashFlash: "#fff1f1",
  connectedGlow: "#2e7d32",
};
