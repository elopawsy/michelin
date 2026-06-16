"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Reveal } from "../_components/motion";
import { ArrowRight } from "../_components/ui";

type QA = { q: string; a: string };
type Section = { category: string; items: QA[] };

/* Contenu illustratif — questions / réponses autour des pneus vélo Michelin. */
const FAQ: Section[] = [
  {
    category: "Choisir ses pneus",
    items: [
      {
        q: "Comment choisir la bonne largeur de pneu pour mon vélo ?",
        a: "La largeur dépend de votre pratique et de la largeur interne de votre jante. Sur route, les sections de 25 à 32 mm offrent le meilleur compromis confort/rendement ; en gravel, privilégiez 38 à 45 mm pour l’adhérence sur chemins. Vérifiez toujours le passage maximal autorisé par votre cadre et vos freins.",
      },
      {
        q: "Comment connaître la taille de mes pneus actuels ?",
        a: "La dimension est inscrite sur le flanc du pneu, au format ETRTO (ex. 28-622) ou en pouces (ex. 700x28C). Le premier chiffre correspond à la largeur, le second au diamètre. Reportez exactement ces valeurs pour garantir la compatibilité.",
      },
      {
        q: "Quelle différence entre Tube Type, Tubeless et Tubeless Ready ?",
        a: "Un pneu Tube Type fonctionne avec une chambre à air classique. Le Tubeless Ready se monte sans chambre, avec du liquide préventif, sur une jante compatible. Le Tubeless intègre une étanchéité renforcée. Le sans-chambre réduit le risque de crevaison par pincement et autorise des pressions plus basses.",
      },
    ],
  },
  {
    category: "Performance & usage",
    items: [
      {
        q: "À quelle pression dois-je gonfler mes pneus Michelin ?",
        a: "La pression recommandée figure sur le flanc (valeurs min/max en bar et psi). Elle s’ajuste selon votre poids, la largeur du pneu et le terrain : plus le pneu est large, plus la pression peut être basse. Un gonflage bien réglé améliore le confort, l’adhérence et le rendement.",
      },
      {
        q: "Les pneus Michelin conviennent-ils au gravel et au tout-chemin ?",
        a: "Oui. La gamme propose des sculptures mixtes pensées pour rouler vite sur l’asphalte tout en accrochant sur les chemins. Choisissez un profil à crampons légers pour le gravel roulant, ou plus marqués pour les terrains gras.",
      },
      {
        q: "Qu’apporte la technologie « Wide premium » ?",
        a: "Elle associe une gomme à haute densité et une carcasse souple optimisée pour les pneus larges : meilleure absorption des vibrations, rendement préservé et longévité accrue, sans sacrifier le grip dans les courbes.",
      },
    ],
  },
  {
    category: "Entretien & durée de vie",
    items: [
      {
        q: "Quelle est la durée de vie moyenne d’un pneu vélo Michelin ?",
        a: "Tout dépend de l’usage, mais un pneu route dure en moyenne entre 4 000 et 8 000 km. Les témoins d’usure (petits repères sur la bande de roulement) indiquent quand le remplacer. Le pneu arrière s’use généralement plus vite que l’avant.",
      },
      {
        q: "Comment prolonger la durée de vie de mes pneus ?",
        a: "Maintenez la bonne pression, évitez les surfaces tranchantes, nettoyez régulièrement la bande de roulement et stockez vos pneus à l’abri de la lumière et de la chaleur. Permuter avant/arrière permet aussi d’égaliser l’usure.",
      },
      {
        q: "Que faire en cas de crevaison ?",
        a: "Avec chambre à air, remplacez ou réparez la chambre et inspectez l’intérieur du pneu. En Tubeless, le liquide préventif colmate la plupart des petites perforations ; pour les coupures plus larges, utilisez une mèche de réparation puis regonflez.",
      },
    ],
  },
  {
    category: "Garantie & innovation",
    items: [
      {
        q: "Mes pneus sont-ils couverts par une garantie ?",
        a: "Tous les pneus Michelin bénéficient d’une garantie contre les défauts de fabrication. Conservez votre preuve d’achat : un défaut avéré donne droit à un échange. L’usure normale et les dommages liés à un usage inadapté ne sont pas couverts.",
      },
      {
        q: "Comment fonctionne le pneu connecté Michelin ?",
        a: "Un capteur intégré mesure en temps réel la pression et la température, puis transmet les données à l’application mobile. Vous recevez des alertes en cas de sous-gonflage et un suivi de l’usure, pour rouler en toute sérénité.",
      },
    ],
  },
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
        open
          ? "border-bleu bg-bleu text-white"
          : "border-bordure bg-carte text-bleu-fonce"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function FaqClient() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState(0);
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(FAQ[0].items[0].q);

  const q = normalize(query.trim());
  const isSearching = q.length > 0;

  const sections = useMemo(() => {
    if (!isSearching) return [FAQ[activeCat]];
    return FAQ.map((s) => ({
      ...s,
      items: s.items.filter((it) => normalize(it.q + " " + it.a).includes(q)),
    })).filter((s) => s.items.length > 0);
  }, [isSearching, q, activeCat]);

  const resultCount = sections.reduce((n, s) => n + s.items.length, 0);

  const pickCategory = (i: number) => {
    setActiveCat(i);
    setQuery("");
    setOpenKey(FAQ[i].items[0].q);
  };

  return (
    <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 pb-20 lg:px-8">
        {/* Retour */}
        <button
          type="button"
          onClick={() => router.back()}
          className="group mt-1 inline-flex items-center gap-2 rounded-pill border border-bordure bg-carte py-2 pr-4 pl-3 text-sm font-semibold text-bleu-fonce shadow-cta transition-colors hover:bg-bleu-leger"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            aria-hidden="true"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>

        {/* En-tête */}
        <Reveal as="header" className="mt-6 lg:mt-8">
          <p className="flex items-center gap-2 text-[13px] font-bold tracking-[0.16em] text-bleu uppercase">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-jaune" />
            Aide &amp; support
          </p>
          <h1 className="mt-3 text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.05] font-extrabold tracking-[-0.025em] text-bleu-fonce">
            Comment pouvons-nous
            <br className="hidden sm:block" /> vous aider&nbsp;?
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed font-medium text-encre-2 lg:text-lg">
            Tout ce qu’il faut savoir pour choisir, gonfler et entretenir vos
            pneus vélo Michelin.
          </p>
        </Reveal>

        <Reveal
          delay={80}
          className="mt-10 grid items-start gap-8 lg:grid-cols-[240px_1fr] lg:gap-12"
        >
          {/* Catégories — sidebar desktop */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <p className="mb-4 px-3 text-[12px] font-bold tracking-[0.1em] text-encre-3 uppercase">
              Catégories
            </p>
            <nav className="flex flex-col gap-1">
              {FAQ.map((s, i) => {
                const active = !isSearching && activeCat === i;
                return (
                  <button
                    key={s.category}
                    type="button"
                    onClick={() => pickCategory(i)}
                    aria-current={active}
                    className={`group flex items-center justify-between gap-3 rounded-card px-3 py-2.5 text-left text-[15px] font-semibold transition-colors ${
                      active
                        ? "bg-bleu-leger text-bleu-fonce"
                        : "text-encre-2 hover:bg-bleu-leger/60 hover:text-bleu-fonce"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-5 w-1 rounded-full transition-colors ${
                          active ? "bg-jaune" : "bg-transparent"
                        }`}
                      />
                      {s.category}
                    </span>
                    <span className="text-[12px] font-bold text-encre-3">
                      {s.items.length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Colonne droite : recherche + résultats */}
          <div>
            {/* Recherche */}
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-encre-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une question…"
                aria-label="Rechercher dans la FAQ"
                className="h-13 w-full rounded-pill border border-bordure bg-carte py-3.5 pr-4 pl-12 text-[15px] font-medium text-bleu-fonce shadow-card placeholder:text-encre-3 focus:border-bleu focus:outline-none"
              />
            </div>

            {/* Catégories — pills mobile */}
            <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {FAQ.map((s, i) => {
                const active = !isSearching && activeCat === i;
                return (
                  <button
                    key={s.category}
                    type="button"
                    onClick={() => pickCategory(i)}
                    className={`shrink-0 rounded-pill border px-4 py-2 text-[13px] font-semibold transition-colors ${
                      active
                        ? "border-bleu-fonce bg-bleu-fonce text-white"
                        : "border-bordure bg-carte text-encre-2"
                    }`}
                  >
                    {s.category}
                  </button>
                );
              })}
            </div>

            {/* Bandeau d'état */}
            <p className="mt-6 mb-3 px-1 text-[13px] font-medium text-encre-3">
              {isSearching
                ? `${resultCount} résultat${resultCount > 1 ? "s" : ""} pour « ${query.trim()} »`
                : FAQ[activeCat].category}
            </p>

            {/* Accordéon */}
            {resultCount === 0 ? (
              <div className="rounded-card border border-dashed border-bordure bg-carte px-6 py-12 text-center">
                <p className="text-base font-bold text-bleu-fonce">
                  Aucun résultat
                </p>
                <p className="mt-1 text-sm text-encre-3">
                  Essayez un autre mot-clé ou parcourez les catégories.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {sections.map((section) => (
                  <section key={section.category}>
                    {isSearching && (
                      <h2 className="mb-3 px-1 text-[12px] font-bold tracking-[0.08em] text-encre-3 uppercase">
                        {section.category}
                      </h2>
                    )}
                    <div className="overflow-hidden rounded-card border border-bordure bg-carte shadow-card">
                      {section.items.map((item) => {
                        const isOpen = openKey === item.q;
                        return (
                          <div
                            key={item.q}
                            className="border-b border-bordure last:border-0"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenKey(isOpen ? null : item.q)}
                              aria-expanded={isOpen}
                              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-bleu-leger/50 sm:px-6"
                            >
                              <span
                                className={`text-[15px] font-bold transition-colors sm:text-base ${
                                  isOpen ? "text-bleu" : "text-bleu-fonce"
                                }`}
                              >
                                {item.q}
                              </span>
                              <Chevron open={isOpen} />
                            </button>
                            <div
                              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="overflow-hidden">
                                <p className="px-5 pb-5 text-[14px] leading-relaxed text-encre-2 sm:px-6 sm:text-[15px]">
                                  {item.a}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Encart contact */}
        <Reveal
          delay={120}
          className="mt-14 flex flex-col items-start gap-5 rounded-panel bg-bleu-fonce px-7 py-8 text-white shadow-panel sm:flex-row sm:items-center sm:justify-between sm:px-9"
        >
          <div>
            <h2 className="text-lg font-extrabold sm:text-xl">
              Vous ne trouvez pas votre réponse&nbsp;?
            </h2>
            <p className="mt-1 text-sm text-white/75">
              Laissez-vous guider et configurez le pneu idéal en quelques clics.
            </p>
          </div>
          <a
            href="/configurateur"
            className="group inline-flex h-[52px] shrink-0 items-center gap-3 rounded-pill bg-jaune px-7 text-base font-bold text-bleu-fonce shadow-cta transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
          >
            Configurer mon pneu
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </Reveal>
    </main>
  );
}
