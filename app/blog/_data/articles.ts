import type { Article, CategoryId } from "./types";
import { CATEGORIES } from "./categories";

/* Registre des articles. Un fichier par article sous ./articles/<slug>.ts.
   L'ordre de ce tableau fait foi (du plus récent au plus ancien). */
import { pressionPneusGravelGuide } from "./articles/pression-pneus-gravel-guide";
import { choisirLargeurPneusGravel } from "./articles/choisir-largeur-pneus-gravel";
import { technologieGommeAdherenceRendement } from "./articles/technologie-gomme-adherence-rendement";
import { technologiesAntiCrevaison } from "./articles/technologies-anti-crevaison";
import { pneuVeloConnecte } from "./articles/pneu-velo-connecte";
import { tubelessOuChambreAAir } from "./articles/tubeless-ou-chambre-a-air";

const ARTICLES: Article[] = [
  pressionPneusGravelGuide,
  choisirLargeurPneusGravel,
  technologieGommeAdherenceRendement,
  technologiesAntiCrevaison,
  pneuVeloConnecte,
  tubelessOuChambreAAir,
];

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticle(slug: string): Article | undefined {
  return BY_SLUG.get(slug);
}

export function getArticlesByCategory(category: CategoryId): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

/** Article mis en avant sur le hub (le 1er marqué featured, sinon le 1er). */
export function getFeaturedArticle(): Article {
  return ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
}

/** Articles liés : ceux listés dans `related`, complétés par même catégorie. */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const out: Article[] = [];
  const seen = new Set<string>([article.slug]);

  for (const slug of article.related ?? []) {
    const found = BY_SLUG.get(slug);
    if (found && !seen.has(found.slug)) {
      out.push(found);
      seen.add(found.slug);
    }
  }
  if (out.length < limit) {
    for (const candidate of getArticlesByCategory(article.category)) {
      if (out.length >= limit) break;
      if (!seen.has(candidate.slug)) {
        out.push(candidate);
        seen.add(candidate.slug);
      }
    }
  }
  return out.slice(0, limit);
}

/** Catégories qui contiennent au moins un article (pour le hub). */
export function getNonEmptyCategories() {
  return CATEGORIES.filter((c) => getArticlesByCategory(c.id).length > 0);
}
