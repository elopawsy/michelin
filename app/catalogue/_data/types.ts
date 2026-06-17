/* Modèle de catalogue (généré depuis le TSV par parse-catalogue.mjs). */

export type CatalogueVariant = {
  diameterMm: number | null;
  diameterIn: string;
  widthMm: number | null;
  widthIn: string;
  weightG: number | null;
  pressureMinBar: number | null;
  pressureMaxBar: number | null;
  tubeless: boolean;
  sidewall: string;
  ean: string;
  designation: string;
};

export type CatalogueModel = {
  /** Nom de gamme interne (ex. « POWER GRAVEL »). */
  range: string;
  /** Nom commercial (ex. « MICHELIN POWER GRAVEL COMPETITION LINE »). */
  name: string;
  segment: string;
  /** Catégorie lisible : Gravel, VTT, Route, Ville & rando, Enfant. */
  category: string;
  ebike: boolean;
  tubeless: boolean;
  cycleTypes: string[];
  uses: string[];
  terrains: string[];
  technologies: string[];
  tpi: string;
  variants: CatalogueVariant[];
};
