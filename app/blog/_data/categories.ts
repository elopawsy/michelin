import type { Category, CategoryId } from "./types";

/* Catégories éditoriales du Mag. L'ordre fait foi sur le hub. */
export const CATEGORIES: Category[] = [
  {
    id: "innovation",
    label: "Innovation",
    tagline: "Les technologies qui font avancer le pneu vélo.",
  },
  {
    id: "conseils",
    label: "Conseils & entretien",
    tagline: "Tirer le meilleur de vos pneus, kilomètre après kilomètre.",
  },
  {
    id: "pratique",
    label: "Gravel & pratique",
    tagline: "Bien s'équiper pour rouler par-delà le bitume.",
  },
];

const BY_ID = new Map<CategoryId, Category>(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  const category = BY_ID.get(id);
  if (!category) throw new Error(`Catégorie inconnue : ${id}`);
  return category;
}
