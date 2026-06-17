"use client";

import { useEffect, useRef, useState } from "react";
import { activeCountries, DEALERS } from "../_data/dealers";

/* Carte interactive (Leaflet via CDN — pas de dépendance npm, pas de clé API) :
   - un repère par pays revendeur, avec les boutiques en lien dans la popup ;
   - un planificateur de parcours vélo : on clique des points, le tracé suit
     les routes via l'API publique BRouter (profil trekking/vélo), avec repli
     à vol d'oiseau si le service est indisponible.
   Tout l'accès à Leaflet se fait dans des effets/handlers (navigateur
   uniquement), donc le composant reste sûr au rendu serveur. */

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const BROUTER = "https://brouter.de/brouter";

/* Typage minimal de la portion de l'API Leaflet utilisée. */
type LatLng = [number, number];
type Handle = { addTo(map: unknown): Handle; bindPopup(html: string): Handle; remove(): void };
type LMap = {
  setView(center: LatLng, zoom: number): LMap;
  fitBounds(bounds: LatLng[], opts?: Record<string, unknown>): void;
  on(event: string, handler: (e: { latlng: { lat: number; lng: number } }) => void): void;
  remove(): void;
};
type Leaflet = {
  map(el: HTMLElement, opts?: Record<string, unknown>): LMap;
  tileLayer(url: string, opts?: Record<string, unknown>): Handle;
  marker(latlng: LatLng, opts?: Record<string, unknown>): Handle;
  circleMarker(latlng: LatLng, opts?: Record<string, unknown>): Handle;
  polyline(latlngs: LatLng[], opts?: Record<string, unknown>): Handle;
};

function loadLeaflet(): Promise<Leaflet> {
  const w = window as unknown as { L?: Leaflet };
  if (w.L) return Promise.resolve(w.L);

  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }

  return new Promise<Leaflet>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${LEAFLET_JS}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(w.L as Leaflet));
      existing.addEventListener("error", reject);
      if (w.L) resolve(w.L);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(w.L as Leaflet);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function totalKm(points: LatLng[]): number {
  return points.reduce(
    (acc, p, i) => (i === 0 ? 0 : acc + haversineKm(points[i - 1], p)),
    0,
  );
}

const MICHELIN_BLUE = "#27509b";
const MICHELIN_YELLOW = "#fce500";

export function DealerMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const leafletRef = useRef<Leaflet | null>(null);
  const waypointsRef = useRef<LatLng[]>([]);
  const pointLayersRef = useRef<Handle[]>([]);
  const lineRef = useRef<Handle | null>(null);
  const planningRef = useRef(false);

  const [planning, setPlanning] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function clearRoute() {
    for (const layer of pointLayersRef.current) layer.remove();
    pointLayersRef.current = [];
    lineRef.current?.remove();
    lineRef.current = null;
    waypointsRef.current = [];
    setDistance(null);
  }

  async function drawRoute() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const pts = waypointsRef.current;
    if (!L || !map || pts.length < 2) return;

    lineRef.current?.remove();

    let line: LatLng[] | null = null;
    let km: number | null = null;

    try {
      const lonlats = pts.map((p) => `${p[1]},${p[0]}`).join("|");
      const res = await fetch(
        `${BROUTER}?lonlats=${lonlats}&profile=trekking&alternativeidx=0&format=geojson`,
      );
      if (res.ok) {
        const geo = await res.json();
        const coords: [number, number][] =
          geo?.features?.[0]?.geometry?.coordinates ?? [];
        if (coords.length > 1) {
          line = coords.map((c) => [c[1], c[0]] as LatLng);
          const tk = geo.features[0].properties?.["track-length"];
          km = tk ? Number(tk) / 1000 : totalKm(line);
        }
      }
    } catch {
      // BRouter indisponible : repli à vol d'oiseau.
    }

    if (!line) {
      line = pts;
      km = totalKm(pts);
    }

    lineRef.current = L.polyline(line, {
      color: MICHELIN_BLUE,
      weight: 4,
      opacity: 0.85,
    }).addTo(map);
    map.fitBounds(line, { padding: [40, 40] });
    setDistance(km);
  }

  function addWaypoint(point: LatLng) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    waypointsRef.current = [...waypointsRef.current, point];
    pointLayersRef.current.push(
      L.circleMarker(point, {
        radius: 6,
        color: MICHELIN_BLUE,
        fillColor: MICHELIN_YELLOW,
        fillOpacity: 1,
        weight: 2,
      }).addTo(map),
    );
    void drawRoute();
  }

  // Initialisation unique de la carte.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        leafletRef.current = L;
        const map = L.map(containerRef.current, { scrollWheelZoom: false });
        map.setView([48.5, 5], 4);
        // Fond épuré (CartoDB Positron) : blanc / gris / bleu, accordé à la DA.
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution: "© OpenStreetMap, © CARTO",
            subdomains: "abcd",
            maxZoom: 19,
          },
        ).addTo(map);

        for (const country of activeCountries()) {
          const shops = DEALERS.filter((d) => d.country === country.code);
          const popup =
            `<strong>${country.label}</strong><br/>` +
            shops
              .map(
                (s) =>
                  `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a>`,
              )
              .join("<br/>");
          // Repère charté (bleu Michelin, liseré blanc) plutôt que l'épingle par défaut.
          L.circleMarker(country.coords, {
            radius: 10,
            color: "#ffffff",
            weight: 2,
            fillColor: MICHELIN_BLUE,
            fillOpacity: 1,
          })
            .addTo(map)
            .bindPopup(popup);
        }

        map.on("click", (e) => {
          if (!planningRef.current) return;
          addWaypoint([e.latlng.lat, e.latlng.lng]);
        });

        mapRef.current = map;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePlanning() {
    const next = !planning;
    setPlanning(next);
    planningRef.current = next;
    if (next) clearRoute(); // un nouveau parcours efface le précédent
  }

  return (
    <div className="overflow-hidden rounded-card border border-bordure bg-carte shadow-card">
      {/* Accord à la DA Michelin : popups arrondies, polices et couleurs de marque. */}
      <style>{`
        .leaflet-container { font-family: var(--font-sans); background: #f7f9fc; }
        .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 12px 30px rgba(0,12,52,.12); }
        .leaflet-popup-content { margin: 14px 16px; color: #00205b; line-height: 1.6; }
        .leaflet-popup-content strong { font-weight: 800; }
        .leaflet-popup-content a { color: #27509b; font-weight: 700; text-decoration: none; }
        .leaflet-popup-content a:hover { text-decoration: underline; }
        .leaflet-bar a { color: #00205b; border-radius: 8px !important; }
        .leaflet-bar a:hover { background: #eef4ff; }
        .leaflet-control-attribution { font-size: 10px; background: rgba(255,255,255,.7); }
      `}</style>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bordure px-5 py-4">
        <div>
          <p className="text-[13px] font-bold tracking-[0.16em] text-bleu uppercase">
            Carte
          </p>
          <p className="text-sm text-encre-2">
            {planning
              ? "Cliquez sur la carte pour ajouter des étapes à votre parcours."
              : "Repères des pays où nos revendeurs livrent."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {distance !== null && (
            <span className="rounded-pill bg-bleu-leger px-3 py-1 text-sm font-bold text-bleu">
              {distance.toFixed(1)} km
            </span>
          )}
          {planning && (
            <button
              type="button"
              onClick={clearRoute}
              className="rounded-pill border border-bordure px-4 py-2 text-sm font-bold text-encre-2 transition hover:bg-fond"
            >
              Effacer
            </button>
          )}
          <button
            type="button"
            onClick={togglePlanning}
            className={`rounded-pill px-4 py-2 text-sm font-bold transition ${
              planning
                ? "bg-bleu-fonce text-white hover:bg-bleu-nuit"
                : "bg-jaune text-bleu-fonce hover:bg-jaune-hover"
            }`}
          >
            {planning ? "Terminer" : "Tracer un parcours"}
          </button>
        </div>
      </div>

      <div className="relative">
        <div ref={containerRef} className="h-[clamp(360px,52vh,560px)] w-full" />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-fond text-sm text-encre-3">
            {status === "loading"
              ? "Chargement de la carte…"
              : "Carte indisponible (connexion requise)."}
          </div>
        )}
      </div>
    </div>
  );
}
