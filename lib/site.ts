import "server-only";

/* Configuration canonique du site — utilisée pour le SEO (metadataBase,
   canonicals, sitemap, JSON-LD). Surchargée par l'environnement en prod. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://michelin.doublepoints3.com"
).replace(/\/$/, "");

export const SITE_NAME = "Michelin Ride";

/** Construit une URL absolue à partir d'un chemin relatif. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
