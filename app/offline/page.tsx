import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ButtonLink, Wordmark } from "@/app/_components/ui";

export const metadata: Metadata = {
  title: "Hors ligne — Michelin Ride",
  description: "Page hors ligne de l'application Michelin Ride.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col bg-fond text-encre">
      <header className="border-b border-bordure bg-carte/85">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" aria-label="Michelin Ride — accueil">
            <Wordmark />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <Badge variant="warning">Connexion indisponible</Badge>
        <h1 className="mt-5 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.04] text-bleu-fonce">
          Michelin Ride est hors ligne
        </h1>
        <p className="mt-5 max-w-xl text-base leading-[1.65] text-encre-2">
          Les données déjà chargées peuvent rester visibles, mais les nouvelles
          mesures du capteur et les recommandations nécessitent une connexion.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary">
            Retour à l&apos;accueil
          </ButtonLink>
          <Link
            href="/pneu"
            className="inline-flex h-12 items-center justify-center rounded-pill border border-bleu px-6 text-[15px] font-bold leading-[18px] text-bleu-fonce transition duration-200 hover:-translate-y-px hover:bg-bleu-leger active:scale-[0.98]"
          >
            Réessayer le capteur
          </Link>
        </div>
        <section className="mt-10 border-t border-bordure pt-6">
          <h2 className="text-sm font-bold tracking-[0.14em] text-bleu uppercase">
            Disponible hors ligne
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/jeu"
              className="inline-flex h-11 items-center justify-center rounded-pill bg-bleu-fonce px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-px hover:bg-bleu-nuit active:scale-[0.98]"
            >
              Le jeu
            </Link>
            <Link
              href="/blog"
              className="inline-flex h-11 items-center justify-center rounded-pill border border-bleu px-5 text-sm font-bold text-bleu-fonce transition duration-200 hover:-translate-y-px hover:bg-bleu-leger active:scale-[0.98]"
            >
              Le Mag
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex h-11 items-center justify-center rounded-pill border border-bleu px-5 text-sm font-bold text-bleu-fonce transition duration-200 hover:-translate-y-px hover:bg-bleu-leger active:scale-[0.98]"
            >
              Catalogue
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
