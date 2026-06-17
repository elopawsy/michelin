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

/* ──────────────────────────────────────────────────────────────
   Génération du seed roues (lib/wheels.generated.ts) — barème validé :
   scores dérivés du segment, de la catégorie, de la largeur et des
   technologies de renfort ; prix estimés par segment (placeholder).
─────────────────────────────────────────────────────────────── */
const SEG_RANK = {
  "PREMIUM RACING LINE": 4,
  "PREMIUM COMPETITION LINE": 3,
  "PREMIUM PERFORMANCE LINE": 2,
  "ACCESS LINE": 1,
};
const SEG_PRICE = { 4: "64.90", 3: "54.90", 2: "39.90", 1: "27.90" };
const clampS = (n) => Math.max(1, Math.min(10, Math.round(n)));

function widthMmOf(v) {
  if (v.widthMm) return v.widthMm;
  const i = parseFloat(v.widthIn);
  return Number.isFinite(i) && i > 0 ? Math.round(i * 25.4) : null;
}

function wheelTypeFor(category, variants) {
  if (category === "VTT") {
    const counts = {};
    for (const v of variants)
      if (v.diameterIn) counts[v.diameterIn] = (counts[v.diameterIn] || 0) + 1;
    const top =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "29";
    if (top.startsWith("27")) return "Trail 27.5";
    if (top.startsWith("26")) return "Trail 26";
    return "Trail 29";
  }
  if (category === "Gravel") {
    const has622 = variants.some((v) => v.diameterMm === 622);
    const has584 = variants.some((v) => v.diameterMm === 584);
    return !has622 && has584 ? "Gravel 650B" : "Gravel 700c";
  }
  if (category === "Route") return "Road 700c";
  if (category === "Ville & rando") return "City 700c";
  return null;
}

const BIKETYPE = {
  Route: ["Road"],
  Gravel: ["Gravel"],
  "Ville & rando": ["City"],
  VTT: ["Mountain"],
};
const SURFACE = {
  Route: ["Road"],
  Gravel: ["Road", "Gravel", "Rough"],
  "Ville & rando": ["City", "Road"],
  VTT: ["Gravel", "Rough"],
};
const SPEED_BASE = { Route: 9, Gravel: 6, "Ville & rando": 5, VTT: 4 };
const RR_BASE = { Route: 9, Gravel: 7, "Ville & rando": 6, VTT: 4 };
const COMFORT_BASE = { Route: 6, Gravel: 8, "Ville & rando": 8, VTT: 9 };
const DURA_BASE = { Route: 6, Gravel: 7, "Ville & rando": 9, VTT: 8 };

const wheelsGen = [];
const usedTypes = new Set();

for (const m of catalogue) {
  if (m.category === "Enfant" || m.category === "Autre") continue;
  const wtTitle = wheelTypeFor(m.category, m.variants);
  if (!wtTitle) continue;
  const widths = m.variants.map(widthMmOf).filter((n) => n);
  if (widths.length === 0) continue;
  usedTypes.add(wtTitle);

  const minW = Math.min(...widths);
  const maxW = Math.max(...widths);
  const weights = m.variants.map((v) => v.weightG).filter((n) => n);
  const weightG = weights.length
    ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length)
    : 400;
  const rank = SEG_RANK[m.segment] ?? 2;
  const narrow = minW < 32;
  const wide = maxW > 45;
  const reinforced = m.technologies.some((t) => /SHIELD|PROTECTION/i.test(t));
  const uses = m.uses.map((u) => u.toUpperCase());

  const speed = clampS(SPEED_BASE[m.category] + (rank - 2) + (narrow ? 1 : 0) - (wide ? 1 : 0));
  const rolling = clampS(RR_BASE[m.category] + (rank - 2) + (narrow ? 1 : 0) - (wide ? 1 : 0));
  const comfort = clampS(COMFORT_BASE[m.category] + (m.tubeless ? 1 : 0) + (wide ? 1 : 0));
  const durability = clampS(
    DURA_BASE[m.category] + (reinforced ? 2 : 0) + (rank === 1 ? 1 : 0) - (rank === 4 ? 1 : 0),
  );

  const bts = [...BIKETYPE[m.category]];
  if (m.category === "Route" && uses.some((u) => /ENDURANCE|ALL ROAD|TOURING/.test(u)))
    bts.push("City");
  if (m.ebike) bts.push("E-Bike");

  wheelsGen.push({
    wheelTypeTitle: wtTitle,
    model: m.name.replace(/^MICHELIN /, ""),
    description: `${m.category} — ${m.segment.replace("PREMIUM ", "").toLowerCase()}${m.tubeless ? ", tubeless ready" : ""}.`,
    durabilityKm: 3000 + durability * 600,
    minTireWidthMm: minW,
    maxTireWidthMm: maxW,
    weightG,
    price: SEG_PRICE[rank],
    tubelessReady: m.tubeless,
    brakeType: "disc",
    rollingResistanceScore: rolling,
    comfortScore: comfort,
    speedScore: speed,
    durabilityScore: durability,
    bicycleTypes: [...new Set(bts)],
    surfaces: SURFACE[m.category],
    goalScores: { Speed: speed, Comfort: comfort, Durability: durability },
  });
}

const EXTRA_TYPES = [
  { title: "Gravel 650B", wheelSize: "650b", description: "Format 650B pour le gravel et l'aventure." },
  { title: "Trail 27.5", wheelSize: "27.5", description: "Format VTT 27,5 pouces." },
  { title: "Trail 26", wheelSize: "26", description: "Format VTT 26 pouces." },
].filter((t) => usedTypes.has(t.title));

writeFileSync(
  "lib/wheels.generated.ts",
  banner +
    `import type { SeedWheel, SeedWheelType } from "./seed-types";\n\n` +
    `export const GENERATED_WHEEL_TYPES: SeedWheelType[] = ${JSON.stringify(EXTRA_TYPES, null, 2)};\n\n` +
    `export const GENERATED_WHEELS: SeedWheel[] = ${JSON.stringify(wheelsGen, null, 2)};\n`,
);

console.log(`Roues générées : ${wheelsGen.length} | types ajoutés : ${EXTRA_TYPES.map((t) => t.title).join(", ") || "aucun"}`);
