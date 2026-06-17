/* Revendeurs Michelin (boutiques en ligne) par région et pays.
   Source : liste catalogue revendeurs. Les coordonnées sont des centroïdes
   pays, utilisées pour positionner les repères sur la carte. */

export type RegionId = "EUN" | "EUS" | "ECA";

export type Region = { id: RegionId; label: string };

export const REGIONS: Region[] = [
  { id: "EUN", label: "Europe du Nord" },
  { id: "ECA", label: "Europe centrale" },
  { id: "EUS", label: "Europe du Sud & de l’Ouest" },
];

export type Country = {
  code: string;
  label: string;
  /** Centroïde [latitude, longitude] pour la carte. */
  coords: [number, number];
};

export const COUNTRIES: Record<string, Country> = {
  UK: { code: "UK", label: "Royaume-Uni", coords: [52.8, -1.6] },
  DE: { code: "DE", label: "Allemagne", coords: [51.1, 10.4] },
  ES: { code: "ES", label: "Espagne", coords: [40.2, -3.7] },
  NL: { code: "NL", label: "Pays-Bas", coords: [52.2, 5.3] },
  IT: { code: "IT", label: "Italie", coords: [42.8, 12.5] },
  PL: { code: "PL", label: "Pologne", coords: [52.0, 19.1] },
  BE: { code: "BE", label: "Belgique", coords: [50.6, 4.6] },
  FR: { code: "FR", label: "France", coords: [46.6, 2.5] },
};

export type Dealer = {
  name: string;
  region: RegionId;
  country: string;
  url: string;
};

/** Nom lisible dérivé du domaine. */
export const DEALERS: Dealer[] = [
  { name: "Tredz", region: "EUN", country: "UK", url: "https://www.tredz.co.uk" },
  { name: "Biketart", region: "EUN", country: "UK", url: "https://www.biketart.com" },
  { name: "Evans Cycles", region: "EUN", country: "UK", url: "https://www.evanscycles.com" },
  { name: "Bike24", region: "EUN", country: "DE", url: "https://www.bike24.com" },
  { name: "Bike-Components", region: "EUN", country: "DE", url: "https://www.bike-components.de" },
  { name: "Amazon", region: "EUN", country: "DE", url: "https://www.amazon.de" },
  { name: "Deporvillage", region: "EUS", country: "ES", url: "https://www.deporvillage.com" },
  { name: "FuturumShop", region: "EUS", country: "NL", url: "https://www.futurumshop.nl" },
  { name: "LordGun", region: "EUS", country: "IT", url: "https://www.lordgunbicycles.com" },
  { name: "Centrum Rowerowe", region: "ECA", country: "PL", url: "https://www.centrumrowerowe.pl" },
  { name: "Bikeinn", region: "EUS", country: "ES", url: "https://www.bikeinn.com" },
  { name: "Van Eyck Sport", region: "EUS", country: "BE", url: "https://www.vaneycksports.be" },
  { name: "Probikeshop", region: "EUS", country: "FR", url: "https://www.probikeshop.fr" },
  { name: "Alltricks", region: "EUS", country: "FR", url: "https://www.alltricks.fr" },
  { name: "Matériel-Vélo", region: "EUS", country: "FR", url: "https://www.materiel-velo.com" },
];

export function dealersByRegion(region: RegionId): Dealer[] {
  return DEALERS.filter((d) => d.region === region);
}

export function regionsWithDealers(): Region[] {
  return REGIONS.filter((r) => dealersByRegion(r.id).length > 0);
}

/** Dédupliqué : pays distincts ayant au moins un revendeur. */
export function activeCountries(): Country[] {
  const seen = new Set<string>();
  const out: Country[] = [];
  for (const d of DEALERS) {
    if (!seen.has(d.country) && COUNTRIES[d.country]) {
      seen.add(d.country);
      out.push(COUNTRIES[d.country]);
    }
  }
  return out;
}
