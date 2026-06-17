export const CONFIGURATOR_STORAGE_KEY = "michelin-configurator:v2";

export const CONFIGURATOR_STEPS = [
  "type",
  "modele",
  "terrain",
  "usage",
  "priorites",
  "kilometres",
  "details",
  "capteur",
] as const;

export type ConfiguratorStep = (typeof CONFIGURATOR_STEPS)[number];

export type ConfiguratorDraft = {
  bicycleModelId?: number;
  bicycleName?: string;
  bicycleTypeTitle?: string;
  brakeType?: string;
  goalTitle?: string;
  priorityComfort?: number;
  priorityDurability?: number;
  prioritySpeed?: number;
  roadSurfaceTitle?: string;
  tireWidthMm?: number;
  weeklyDistanceKm?: number;
  wheelSize?: string;
};

export type ConfiguratorOption = {
  description: string | null;
  id: number;
  title: string;
};

export type ConfiguratorBicycleModelOption = {
  brandName: string;
  description: string | null;
  id: number;
  model: string;
  typeTitle: string;
};

export type ConfiguratorOptions = {
  bicycleModels: ConfiguratorBicycleModelOption[];
  bicycleTypes: ConfiguratorOption[];
  goals: ConfiguratorOption[];
  roadSurfaces: ConfiguratorOption[];
};

export const CONFIGURATOR_ROUTES: Record<ConfiguratorStep, string> = {
  capteur: "/configurateur/capteur",
  details: "/configurateur/details",
  kilometres: "/configurateur/kilometres",
  modele: "/configurateur/modele",
  priorites: "/configurateur/priorites",
  terrain: "/configurateur/terrain",
  type: "/configurateur",
  usage: "/configurateur/usage",
};

export const BRAKE_TYPES = [
  { label: "Freins à disque", value: "disc" },
  { label: "Freins sur jante", value: "rim" },
] as const;

export const WHEEL_SIZES = ["700c", "29"] as const;

export const DEFAULT_PRIORITY_VALUE = 6;

export const BICYCLE_TYPE_ORDER = [
  "Road",
  "Gravel",
  "City",
  "Mountain",
  "E-Bike",
] as const;

export const ROAD_SURFACE_ORDER = ["Road", "Rough", "Gravel", "City"] as const;

export const GOAL_ORDER = ["Speed", "Comfort", "Durability"] as const;

export const TYPE_COPY: Record<
  string,
  { label: string; detail: string; defaults: Pick<ConfiguratorDraft, "brakeType" | "tireWidthMm" | "wheelSize"> }
> = {
  City: {
    label: "VILLE",
    detail: "Trajets quotidiens et voies urbaines.",
    defaults: { brakeType: "rim", tireWidthMm: 38, wheelSize: "700c" },
  },
  "E-Bike": {
    label: "E-BIKE",
    detail: "Assistance électrique et charges plus élevées.",
    defaults: { brakeType: "disc", tireWidthMm: 45, wheelSize: "700c" },
  },
  Gravel: {
    label: "GRAVEL",
    detail: "Routes mixtes, chemins compacts et exploration.",
    defaults: { brakeType: "disc", tireWidthMm: 42, wheelSize: "700c" },
  },
  Mountain: {
    label: "VTT",
    detail: "Sentiers, terrains cassants et pneus larges.",
    defaults: { brakeType: "disc", tireWidthMm: 60, wheelSize: "29" },
  },
  Road: {
    label: "ROUTE",
    detail: "Asphalte, entraînement et sorties rapides.",
    defaults: { brakeType: "disc", tireWidthMm: 28, wheelSize: "700c" },
  },
};

export const SURFACE_COPY: Record<string, { label: string; detail: string }> = {
  City: {
    label: "VILLE / QUOTIDIEN",
    detail: "Pistes cyclables, bordures et chaussée urbaine.",
  },
  Gravel: {
    label: "CHEMINS / GRAVEL",
    detail: "Gravier compact, liaisons route et pistes faciles.",
  },
  Road: {
    label: "ROUTE LISSE",
    detail: "Asphalte régulier et rendement prioritaire.",
  },
  Rough: {
    label: "ROUTE ABÎMÉE",
    detail: "Revêtement cassant, trous, sentiers et surfaces dures.",
  },
};

export const GOAL_COPY: Record<string, { label: string; detail: string }> = {
  Comfort: {
    label: "CONFORT",
    detail: "Filtrer les vibrations et garder du contrôle.",
  },
  Durability: {
    label: "DURABILITÉ",
    detail: "Résister à l'usure, aux crevaisons et aux longs cycles.",
  },
  Speed: {
    label: "VITESSE",
    detail: "Réduire la résistance au roulement et garder du répondant.",
  },
};

export const DISTANCE_OPTIONS = [
  { detail: "PAR SEMAINE", label: "MOINS DE 50 KM", value: 35 },
  { detail: "PAR SEMAINE", label: "50 - 150 KM", value: 100 },
  { detail: "PAR SEMAINE", label: "PLUS DE 150 KM", value: 180 },
] as const;

export function getStepIndex(step: ConfiguratorStep) {
  return CONFIGURATOR_STEPS.indexOf(step);
}

export function getPreviousStep(step: ConfiguratorStep) {
  const index = getStepIndex(step);

  return index > 0 ? CONFIGURATOR_STEPS[index - 1] : null;
}

export function getNextStep(step: ConfiguratorStep) {
  const index = getStepIndex(step);

  return index >= 0 && index < CONFIGURATOR_STEPS.length - 1
    ? CONFIGURATOR_STEPS[index + 1]
    : null;
}

export function orderByTitle<T extends { title: string }>(
  items: T[],
  order: readonly string[],
) {
  const positions = new Map(order.map((title, index) => [title, index]));

  return [...items].sort((left, right) => {
    const leftPosition = positions.get(left.title) ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = positions.get(right.title) ?? Number.MAX_SAFE_INTEGER;

    return leftPosition - rightPosition || left.title.localeCompare(right.title);
  });
}
