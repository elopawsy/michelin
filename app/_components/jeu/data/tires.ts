// Gamme de pneus du jeu — recopiée à la main depuis lib/seed-catalog.ts
// (NE JAMAIS importer lib/seed-catalog : c'est un module `server-only`).
// Les stats de jeu dérivent des scores du catalogue réel : le ressenti
// reflète la vraie gamme Michelin, focus gravel.

import type { TireDef, TireId, TireStats } from "../engine/types";

export const GAME_TIRES: readonly TireDef[] = [
  {
    id: "city",
    model: "Michelin City Durable",
    category: "Ville · 700c",
    blurb:
      "Increvable et planté. Lent mais pardonne tout : le pneu de départ pour apprendre la côte sans casse.",
    priceEur: 39.9,
    weightG: 520,
    scores: { rollingResistance: 6, comfort: 8, speed: 6, durability: 10 },
    cost: 0,
    unlockOrder: 1,
    premium: false,
    requires: [],
    picto: "car-tire",
    accentHex: "#6b7280",
    stats: {
      pedalPower: 0.8,
      grip: 0.78,
      weight: 1.2,
      wearRate: 0.4,
      topSpeed: 0.9,
      roadOnly: false,
    },
  },
  {
    id: "endurance",
    model: "Michelin Endurance Comfort",
    category: "Route · 700c",
    blurb:
      "Le polyvalent souple. Premier vrai upgrade : plus rapide et confortable, tubeless, à l'aise sur le bitume.",
    priceEur: 54.9,
    weightG: 310,
    scores: { rollingResistance: 8, comfort: 8, speed: 8, durability: 8 },
    cost: 1200,
    unlockOrder: 2,
    premium: false,
    requires: [],
    picto: "car-tire",
    accentHex: "#27509b",
    stats: {
      pedalPower: 1.0,
      grip: 0.62,
      weight: 0.95,
      wearRate: 0.62,
      topSpeed: 1.05,
      roadOnly: false,
    },
  },
  {
    id: "road",
    model: "Michelin Road Performance",
    category: "Route · 700c",
    blurb:
      "La fusée du bitume. Vitesse max absolue, mais le grip s'effondre dès que ça devient cassant : le pari risqué.",
    priceEur: 59.9,
    weightG: 260,
    scores: { rollingResistance: 9, comfort: 6, speed: 10, durability: 6 },
    cost: 2400,
    unlockOrder: 3,
    premium: false,
    requires: [],
    picto: "speed-rating",
    accentHex: "#b71c1c",
    stats: {
      pedalPower: 1.15,
      grip: 0.55,
      weight: 0.8,
      wearRate: 0.8,
      topSpeed: 1.2,
      roadOnly: true,
    },
  },
  {
    id: "gravel",
    model: "Michelin Gravel Mixed",
    category: "Gravel · 700c",
    blurb:
      "Le héros gravel, sans point faible. Le seul noté route + gravel + cassant : la ligne principale, à l'aise partout.",
    priceEur: 64.9,
    weightG: 440,
    scores: { rollingResistance: 7, comfort: 8, speed: 7, durability: 8 },
    cost: 3600,
    unlockOrder: 4,
    premium: false,
    requires: [],
    picto: "off-road-car-tire",
    accentHex: "#fce500",
    stats: {
      pedalPower: 1.0,
      grip: 0.72,
      weight: 1.0,
      wearRate: 0.62,
      topSpeed: 1.04,
      roadOnly: false,
    },
  },
  {
    id: "trail",
    model: "Michelin Trail Control",
    category: "Trail · 29″",
    blurb:
      "Grimpe tout, accroche partout. Le plus grippant et le plus lourd : conquiert les pentes les plus raides, vitesse modérée.",
    priceEur: 69.9,
    weightG: 850,
    scores: { rollingResistance: 5, comfort: 9, speed: 5, durability: 9 },
    cost: 4800,
    unlockOrder: 5,
    premium: false,
    requires: [],
    picto: "motorbike-tire",
    accentHex: "#2e7d32",
    stats: {
      pedalPower: 0.85,
      grip: 1.0,
      weight: 1.35,
      wearRate: 0.55,
      topSpeed: 0.88,
      roadOnly: false,
    },
  },
  {
    id: "ride700",
    model: "Ride Gravel 700 × 42",
    category: "Gravel connecté",
    blurb:
      "L'aboutissement connecté. Tubeless, gomme tendre, carcasse souple, flanc blanc : grip gravel + vitesse quasi route, et la télémétrie live pression/usure/surface. Le meilleur de la gamme.",
    priceEur: 89.9,
    weightG: 420,
    scores: { rollingResistance: 8, comfort: 9, speed: 9, durability: 9 },
    cost: 8000,
    unlockOrder: 6,
    premium: true,
    requires: ["gravel", "trail"],
    picto: "bicycle-tire",
    accentHex: "#fce500",
    stats: {
      pedalPower: 1.15,
      grip: 0.95,
      weight: 0.9,
      wearRate: 0.45,
      topSpeed: 1.18,
      roadOnly: false,
    },
  },
];

const TIRE_MAP: ReadonlyMap<TireId, TireDef> = new Map(
  GAME_TIRES.map((t) => [t.id, t]),
);

export function tireById(id: TireId): TireDef {
  const t = TIRE_MAP.get(id);
  // 'city' existe toujours ; fallback défensif sans `any`.
  return t ?? GAME_TIRES[0];
}

export function deriveTireParams(id: TireId): TireStats {
  return tireById(id).stats;
}
