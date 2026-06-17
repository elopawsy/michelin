import type { MetadataRoute } from "next";
import { getAllArticles } from "./blog/_data/articles";
import { SITE_URL } from "@/lib/site";

/* Sitemap : uniquement les URL publiques et indexables (accueil + Le Mag).
   Les pages applicatives derrière authentification en sont volontairement
   exclues (un crawler y serait redirigé vers /login). */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const latest = articles.reduce<string>(
    (acc, a) => (a.updated ?? a.published) > acc ? (a.updated ?? a.published) : acc,
    "1970-01-01",
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(`${latest}T00:00:00`),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(`${article.updated ?? article.published}T00:00:00`),
      changeFrequency: "monthly" as const,
      priority: article.featured ? 0.8 : 0.7,
    })),
  ];
}
