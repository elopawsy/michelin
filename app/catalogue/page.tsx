import type { Metadata } from "next";
import { MichelinHeader } from "../_components/MichelinHeader";
import { CatalogueClient } from "./_components/CatalogueClient";
import { CATALOGUE } from "./_data/catalogue.generated";

export const metadata: Metadata = {
  title: "Catalogue — la gamme de pneus vélo Michelin",
  description:
    "Toute la gamme de pneus vélo Michelin : route, gravel, VTT et ville. Filtrez par pratique, tubeless et largeur, puis trouvez votre revendeur.",
};

export default function CataloguePage() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-20 pt-2 lg:px-10 lg:pt-6">
        <header className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.14em] text-bleu uppercase">
            Catalogue
          </p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3.4rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            Toute la gamme vélo.
          </h1>
          <p className="mt-5 text-base leading-relaxed font-medium text-bleu-fonce/75 lg:text-lg">
            Route, gravel, VTT, ville : explorez les pneus Michelin et leurs
            tailles. Filtrez selon votre pratique, puis trouvez où les acheter.
          </p>
        </header>

        <div className="mt-10">
          <CatalogueClient models={CATALOGUE} />
        </div>
      </main>
    </div>
  );
}
