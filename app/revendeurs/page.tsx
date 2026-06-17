import type { Metadata } from "next";
import { MichelinHeader } from "../_components/MichelinHeader";
import { ArrowRight, Picto } from "../_components/ui";
import { DealerMap } from "./_components/DealerMap";
import {
  COUNTRIES,
  dealersByRegion,
  regionsWithDealers,
} from "./_data/dealers";

export const metadata: Metadata = {
  title: "Revendeurs — où acheter vos pneus Michelin Ride",
  description:
    "Trouvez où acheter vos pneus vélo Michelin : nos revendeurs en ligne par pays, sur une carte interactive. Tracez aussi votre prochain parcours gravel.",
};

function hostOf(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export default function RevendeursPage() {
  const regions = regionsWithDealers();

  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="flex-1 pb-20">
        {/* Hero */}
        <section className="mx-auto w-full max-w-[1100px] px-6 pt-2 lg:px-8 lg:pt-6">
          <p className="text-sm font-bold tracking-[0.14em] text-bleu uppercase">
            Revendeurs
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            Où acheter vos pneus Michelin.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed font-medium text-bleu-fonce/75 lg:text-lg">
            Nos revendeurs en ligne livrent partout en Europe. Repérez-les sur la
            carte — et profitez-en pour tracer votre prochain parcours gravel.
          </p>
        </section>

        {/* Carte */}
        <section className="mx-auto mt-8 w-full max-w-[1100px] px-6 lg:mt-10 lg:px-8">
          <DealerMap />
        </section>

        {/* Liste par région / pays */}
        {regions.map((region) => {
          const dealers = dealersByRegion(region.id);
          const countries = [...new Set(dealers.map((d) => d.country))];

          return (
            <section
              key={region.id}
              aria-labelledby={`region-${region.id}`}
              className="mx-auto mt-14 w-full max-w-[1100px] px-6 lg:px-8"
            >
              <h2
                id={`region-${region.id}`}
                className="border-b border-bordure pb-4 text-[clamp(1.4rem,2.8vw,1.9rem)] font-extrabold tracking-[-0.02em] text-bleu-fonce"
              >
                {region.label}
              </h2>

              {countries.map((code) => (
                <div key={code} className="mt-7">
                  <h3 className="flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-bleu uppercase">
                    <Picto name="find-a-dealer" className="h-4 w-4" />
                    {COUNTRIES[code]?.label ?? code}
                  </h3>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dealers
                      .filter((d) => d.country === code)
                      .map((dealer) => (
                        <li key={dealer.url}>
                          <a
                            href={dealer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-3 rounded-3xl border border-bordure bg-carte p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                          >
                            <span>
                              <span className="block font-extrabold text-bleu-fonce">
                                {dealer.name}
                              </span>
                              <span className="mt-0.5 block text-[13px] text-encre-3">
                                {hostOf(dealer.url)}
                              </span>
                            </span>
                            <ArrowRight className="h-5 w-5 shrink-0 text-bleu transition-transform duration-200 group-hover:translate-x-1" />
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </section>
          );
        })}

        {/* CTA */}
        <section className="mx-auto mt-16 w-full max-w-[1100px] px-6 lg:px-8">
          <div className="flex flex-col items-start gap-5 rounded-3xl bg-bleu-fonce px-7 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold sm:text-xl">
                Pas sûr du modèle ?
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Trouvez le pneu idéal en quelques questions, puis commandez chez
                le revendeur de votre choix.
              </p>
            </div>
            <a
              href="/pneu"
              className="group inline-flex h-[52px] shrink-0 items-center gap-3 rounded-full bg-jaune px-7 text-base font-bold text-bleu-fonce shadow-[0_14px_30px_rgba(252,229,0,0.35)] transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
            >
              Trouver mon pneu
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
