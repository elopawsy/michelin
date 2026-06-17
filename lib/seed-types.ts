/* Types partagés pour les données de seed des roues (catalogue → Wheel). */

export type SeedWheelType = {
  title: string;
  wheelSize: string;
  description: string;
};

export type SeedWheel = {
  wheelTypeTitle: string;
  model: string;
  description: string;
  durabilityKm: number;
  minTireWidthMm: number;
  maxTireWidthMm: number;
  weightG: number;
  price: string;
  tubelessReady: boolean;
  brakeType: string;
  rollingResistanceScore: number;
  comfortScore: number;
  speedScore: number;
  durabilityScore: number;
  bicycleTypes: string[];
  surfaces: string[];
  goalScores: Record<string, number>;
};
