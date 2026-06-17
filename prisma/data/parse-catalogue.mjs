// Parse le TSV catalogue → app/catalogue/_data/catalogue.generated.ts (typé).
// Filtre : pneus (TYRE + TUBULAR) actuellement au catalogue (non discontinués
// avant aujourd'hui), regroupés par gamme (Range interne) avec leurs variantes.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "prisma/data/catalogue-bike.tsv";
const OUT = "app/catalogue/_data/catalogue.generated.ts";
const NOW = { y: 2026, m: 6 }; // référence : juin 2026

const MONTHS = {
  "janv": 1, "févr": 2, "mars": 3, "avr": 4, "mai": 5, "juin": 6,
  "juil": 7, "août": 8, "sept": 9, "oct": 10, "nov": 11, "déc": 12,
};

// "déc.-25" → {y:2025,m:12}. Renvoie null si illisible.
function parseDate(s) {
  if (!s) return null;
  const m = s.trim().match(/^([a-zûé]+)\.?-(\d{2})$/i);
  if (!m) return null;
  const month = MONTHS[m[1].toLowerCase()];
  if (!month) return null;
  return { y: 2000 + Number(m[2]), m: month };
}

// actif si pas de date de fin, ou date de fin >= maintenant
function isActive(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return true;
  return d.y > NOW.y || (d.y === NOW.y && d.m >= NOW.m);
}

const num = (v) => {
  const s = (v == null ? "" : String(v)).replace(",", ".").trim();
  if (s === "") return null; // Number("") === 0 : à éviter
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const clean = (v) => (v == null ? "" : String(v).trim());
const splitList = (v) =>
  clean(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const raw = readFileSync(SRC, "utf8").replace(/\r/g, "");
const lines = raw.split("\n").filter((l) => l.length > 0);
const headers = lines[0].split("\t").map((h) => h.trim());
const col = (name) => headers.indexOf(name);

const IDX = {
  productType: col("Product Type"),
  segment: col("Segment"),
  range: col("Range (Internal)"),
  bead: col("Bead"),
  ean: col("EAN Code"),
  discontinued: col("Discontinued Date"),
  weight: col("Weight (g)"),
  webRange: col("Web Range Name"),
  webDiaMm: col("Web Diameter (mm)"),
  webDiaIn: col("Web Diameter (Inch)"),
  webWidthMm: col("Web Width (mm)"),
  webWidthIn: col("Web Width (Inch)"),
  designation: col("Web Product Designation"),
  tpi: col("TPI"),
  pMin: col("Minimum Pressure (Bar)"),
  pMax: col("Maximum Pressure (Bar)"),
  sealing: col("Sealing"),
  sidewall: col("Sidewall Color"),
  terrains: col("Terrain Types"),
  use: col("Use"),
  rubber: col("Rubber Technologies"),
  casing: col("Casing Technologies"),
  tread: col("Tread Pattern Technologies"),
  reinforcement: col("Reinforcement Technologies"),
  ebike: col("E-Bike Technologies"),
  cycleWeb: col("CYCLE TYPE WEB"),
  cycleInternal: col("Cycle Type"),
};

// Catégorie lisible : CYCLE TYPE WEB d'abord, repli sur le type interne
// (utile pour les pneus e-bike dont le web ne porte que « E-BIKE »).
function category(cycleWeb, cycleInternal) {
  const set = new Set(splitList(cycleWeb).map((s) => s.toUpperCase()));
  if (set.has("GRAVEL")) return "Gravel";
  if (set.has("MTB")) return "VTT";
  if (set.has("ROAD")) return "Route";
  if (set.has("COMMUTING & TOUR")) return "Ville & rando";
  if (set.has("KIDS")) return "Enfant";
  const internal = clean(cycleInternal).toUpperCase();
  if (internal === "MTB") return "VTT";
  if (internal === "ROAD") return "Route";
  if (internal === "CITY") return "Ville & rando";
  return "Autre";
}

const models = new Map();
let kept = 0;

for (let i = 1; i < lines.length; i++) {
  const c = lines[i].split("\t");
  const productType = clean(c[IDX.productType]);
  if (productType !== "TYRE" && productType !== "TUBULAR") continue; // pneus seulement
  if (!isActive(clean(c[IDX.discontinued]))) continue; // catalogue courant

  const range = clean(c[IDX.range]);
  if (!range) continue;
  const segment = clean(c[IDX.segment]);
  const key = `${range}__${segment}`;

  if (!models.has(key)) {
    models.set(key, {
      range,
      segment,
      name: clean(c[IDX.webRange]) || `MICHELIN ${range}`,
      category: category(c[IDX.cycleWeb], c[IDX.cycleInternal]),
      cycleTypes: new Set(),
      ebike: false,
      tubeless: false,
      uses: new Set(),
      terrains: new Set(),
      technologies: new Set(),
      tpi: clean(c[IDX.tpi]),
      variants: [],
    });
  }
  const model = models.get(key);

  splitList(c[IDX.cycleWeb]).forEach((x) => {
    if (x.toUpperCase() === "E-BIKE") model.ebike = true;
    else model.cycleTypes.add(x);
  });
  splitList(c[IDX.use]).forEach((x) => model.uses.add(x));
  splitList(c[IDX.terrains]).forEach((x) => model.terrains.add(x));
  [IDX.rubber, IDX.casing, IDX.tread, IDX.reinforcement].forEach((idx) =>
    splitList(c[idx]).forEach((x) => model.technologies.add(x)),
  );
  const tubeless = clean(c[IDX.sealing]).toUpperCase().includes("TUBELESS");
  if (tubeless) model.tubeless = true;

  model.variants.push({
    diameterMm: num(c[IDX.webDiaMm]),
    diameterIn: clean(c[IDX.webDiaIn]),
    widthMm: num(c[IDX.webWidthMm]),
    widthIn: clean(c[IDX.webWidthIn]),
    weightG: num(c[IDX.weight]),
    pressureMinBar: num(c[IDX.pMin]),
    pressureMaxBar: num(c[IDX.pMax]),
    tubeless,
    sidewall: clean(c[IDX.sidewall]),
    ean: clean(c[IDX.ean]),
    designation: clean(c[IDX.designation]),
  });
  kept++;
}

// Sérialise (Set → tableau trié), tri par catégorie puis nom.
const SEG_ORDER = [
  "PREMIUM RACING LINE",
  "PREMIUM COMPETITION LINE",
  "PREMIUM PERFORMANCE LINE",
  "ACCESS LINE",
];
const catalogue = [...models.values()]
  .map((m) => ({
    range: m.range,
    name: m.name,
    segment: m.segment,
    category: m.category,
    ebike: m.ebike,
    tubeless: m.tubeless,
    cycleTypes: [...m.cycleTypes],
    uses: [...m.uses],
    terrains: [...m.terrains],
    technologies: [...m.technologies],
    tpi: m.tpi,
    variants: m.variants,
  }))
  .sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      SEG_ORDER.indexOf(a.segment) - SEG_ORDER.indexOf(b.segment) ||
      a.name.localeCompare(b.name),
  );

const banner =
  "// Généré par prisma/data/parse-catalogue.mjs — NE PAS éditer à la main.\n" +
  "// Source : prisma/data/catalogue-bike.tsv (gamme vélo Michelin).\n";

const ts =
  banner +
  `import type { CatalogueModel } from "./types";\n\n` +
  `export const CATALOGUE: CatalogueModel[] = ${JSON.stringify(catalogue, null, 2)};\n`;

writeFileSync(OUT, ts);

console.log(`Lignes pneus actives retenues : ${kept}`);
console.log(`Modèles (gammes) : ${catalogue.length}`);
const byCat = {};
for (const m of catalogue) byCat[m.category] = (byCat[m.category] || 0) + 1;
console.log("Par catégorie :", byCat);
