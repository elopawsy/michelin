import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const description =
  "Michelin Ride, l'application vélo connectée pour suivre pression, usure, vitesse et recommandations pneu.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Michelin Ride",
    description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f9fc",
    theme_color: "#00205b",
    categories: ["sports", "health", "lifestyle"],
    lang: "fr",
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Capteur de pneu",
        short_name: "Capteur",
        description: "Ouvrir les données du capteur Michelin Ride.",
        url: "/pneu",
        icons: [
          {
            src: "/pwa/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Recommandations",
        short_name: "Pneus",
        description: "Voir les recommandations de pneus.",
        url: "/recommandations",
        icons: [
          {
            src: "/pwa/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    screenshots: [
      {
        src: new URL("/hero-home.png", SITE_URL).pathname,
        sizes: "1600x900",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/capteur.png",
        sizes: "1254x1254",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
