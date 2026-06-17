"use client";

import { useMemo, useState } from "react";
import { Picto } from "../../_components/ui";
import type { CatalogueModel } from "../_data/types";

const CATEGORIES = ["Tous", "Gravel", "Route", "VTT", "Ville & rando", "Enfant"];

const SEGMENT_SHORT: Record<string, string> = {
  "PREMIUM RACING LINE": "Racing Line",
  "PREMIUM COMPETITION LINE": "Competition Line",
  "PREMIUM PERFORMANCE LINE": "Performance Line",
  "ACCESS LINE": "Access Line",
};

function range(nums: number[]): string | null {
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? `${min}` : `${min}–${max}`;
}

/** Résumé des tailles d'un modèle (diamètres + largeurs, en mm ou en pouces). */
function sizes(model: CatalogueModel) {
  const diaMm = [
    ...new Set(
      model.variants.map((v) => v.diameterMm).filter((n): n is number => !!n),
    ),
  ].sort((a, b) => b - a);
  const diaIn = [
    ...new Set(model.variants.map((v) => v.diameterIn).filter(Boolean)),
  ];
  const widthMm = model.variants
    .map((v) => v.widthMm)
    .filter((n): n is number => !!n);
  const widthIn = model.variants
    .map((v) => Number(v.widthIn))
    .filter((n) => Number.isFinite(n) && n > 0);
  const weights = model.variants
    .map((v) => v.weightG)
    .filter((n): n is number => !!n);

  const diameter =
    diaMm.length > 0
      ? diaMm.map((d) => (d === 622 ? "700C" : d === 584 ? "650B" : `${d}`)).join(" · ")
      : diaIn.map((d) => `${d}″`).join(" · ");
  const width =
    widthMm.length > 0
      ? `${range(widthMm)} mm`
      : widthIn.length > 0
        ? `${range(widthIn)?.replace("–", "–")}″`
        : null;

  return {
    diameter,
    width,
    weight: range(weights),
    count: model.variants.length,
  };
}

export function CatalogueClient({ models }: { models: CatalogueModel[] }) {
  const [category, setCategory] = useState("Tous");
  const [tubelessOnly, setTubelessOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      if (category !== "Tous" && m.category !== category) return false;
      if (tubelessOnly && !m.tubeless) return false;
      if (q && !`${m.name} ${m.range}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [models, category, tubelessOnly, query]);

  const countFor = (cat: string) =>
    cat === "Tous"
      ? models.length
      : models.filter((m) => m.category === cat).length;

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-col gap-4 border-b border-bordure pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-pill px-4 py-2 text-sm font-bold transition ${
                category === cat
                  ? "bg-bleu-fonce text-white"
                  : "bg-carte text-encre-2 ring-1 ring-bordure hover:bg-bleu-leger"
              }`}
            >
              {cat}
              <span className="ml-1.5 opacity-60">{countFor(cat)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un modèle…"
            className="h-11 w-full max-w-xs rounded-xl border border-bordure bg-carte px-4 text-[15px] text-encre placeholder:text-encre-3 focus:border-bleu focus:outline-none focus:ring-4 focus:ring-bleu/10"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-encre-2">
            <input
              type="checkbox"
              checked={tubelessOnly}
              onChange={(e) => setTubelessOnly(e.target.checked)}
              className="h-4 w-4 accent-bleu"
            />
            Tubeless ready uniquement
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-encre-3">
        {filtered.length} modèle{filtered.length > 1 ? "s" : ""}
      </p>

      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((model) => {
          const s = sizes(model);
          return (
            <li
              key={`${model.range}-${model.segment}`}
              className="flex flex-col rounded-3xl border border-bordure bg-carte p-6 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[12px] font-bold tracking-[0.12em] text-bleu uppercase">
                  {SEGMENT_SHORT[model.segment] ?? model.segment}
                </span>
                <Picto name="bicycle-tire" className="h-6 w-6 text-bleu-leger" />
              </div>

              <h3 className="mt-2 text-lg leading-[1.2] font-extrabold tracking-[-0.01em] text-bleu-fonce">
                {model.name.replace(/^MICHELIN /, "")}
              </h3>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-pill bg-bleu-leger px-2.5 py-0.5 text-[12px] font-bold text-bleu">
                  {model.category}
                </span>
                {model.tubeless && (
                  <span className="rounded-pill bg-succes-fond px-2.5 py-0.5 text-[12px] font-bold text-succes">
                    Tubeless ready
                  </span>
                )}
                {model.ebike && (
                  <span className="rounded-pill bg-jaune px-2.5 py-0.5 text-[12px] font-bold text-bleu-fonce">
                    E-bike
                  </span>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                {s.diameter && (
                  <Spec label="Roue" value={s.diameter} />
                )}
                {s.width && <Spec label="Largeurs" value={s.width} />}
                {s.weight && <Spec label="Poids" value={`${s.weight} g`} />}
                <Spec label="Tailles" value={`${s.count}`} />
              </dl>

              {model.technologies.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {model.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-card-sm bg-fond px-2 py-1 text-[11px] font-semibold text-encre-2"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <a
                href="/revendeurs"
                className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-bleu-fonce hover:text-bleu"
              >
                Où l’acheter
                <Picto name="find-a-dealer" className="h-4 w-4" />
              </a>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-encre-2">
          Aucun modèle ne correspond à ces critères.
        </p>
      )}
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.08em] text-encre-3 uppercase">
        {label}
      </dt>
      <dd className="font-bold text-bleu-fonce">{value}</dd>
    </div>
  );
}
