/* ──────────────────────────────────────────────────────────────
   Modèle de contenu du blog éditorial « Le Mag ».

   Le contenu est statique et typé : chaque article est un tableau de
   blocs (ContentBlock) rendu par <ArticleBody>. Cela garde les pages
   100 % statiques (SSG → idéal SEO/perf) sans base de données.

   Le texte des paragraphes/leads/quotes accepte un balisage léger :
     **gras**            → <strong>
     [libellé](/chemin)  → lien (interne via next/link, externe sinon)
─────────────────────────────────────────────────────────────── */

export type CategoryId = "innovation" | "conseils" | "pratique";

export type Category = {
  id: CategoryId;
  label: string;
  /** Phrase d'accroche affichée sur le hub. */
  tagline: string;
};

/** Une figure animée (compteur) du bloc « stats ». */
export type StatItem = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};

/** Une carte du bloc « features » (pictogramme + titre + texte). */
export type FeatureItem = {
  /** Nom d'un SVG présent dans /public/pictograms (sans extension). */
  picto: string;
  title: string;
  text: string;
};

export type StepItem = {
  /** Étiquette courte : numéro, année, étape… */
  label: string;
  title: string;
  text: string;
};

export type ComparisonColumn = {
  title: string;
  /** Atouts / points clés de la colonne. */
  points: string[];
};

export type FaqItem = {
  q: string;
  a: string;
};

/* ── Union des blocs de contenu ──────────────────────────────── */
export type ContentBlock =
  | { type: "lead"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id?: string }
  | { type: "subheading"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "stats"; items: StatItem[] }
  | { type: "features"; columns?: 2 | 3; items: FeatureItem[] }
  | {
      type: "callout";
      variant?: "info" | "tip" | "warning";
      title?: string;
      text: string;
    }
  | { type: "steps"; items: StepItem[] }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "comparison"; columns: ComparisonColumn[] }
  | { type: "faq"; title?: string; items: FaqItem[] }
  | { type: "cta"; title: string; text?: string; href: string; label: string };

export type Article = {
  slug: string;
  /** Titre éditorial (H1) et base du <title> SEO. */
  title: string;
  /** Résumé : description méta + accroche des cartes. */
  excerpt: string;
  category: CategoryId;
  heroImage: string;
  heroAlt: string;
  /** Temps de lecture estimé, en minutes. */
  readingMinutes: number;
  /** Date de publication au format ISO (YYYY-MM-DD). */
  published: string;
  /** Date de mise à jour éventuelle (YYYY-MM-DD). */
  updated?: string;
  keywords: string[];
  author: string;
  featured?: boolean;
  /** Slugs d'articles liés (maillage interne). */
  related?: string[];
  content: ContentBlock[];
};
