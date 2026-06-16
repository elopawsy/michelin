import Image from "next/image";
import Link from "next/link";
import { MichelinHeader } from "./_components/MichelinHeader";
import { ArrowRight } from "./_components/ui";

const HERO_ALT =
  "Bibendum, la mascotte Michelin, salue de la main à côté d'un vélo de route bleu sur une route de montagne";

export default function Home() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white text-encre">
      {/* Fond paysage pleine largeur — Bibendum + montagnes, fondu blanc intégré */}
      <Image
        src="/hero-home.png"
        alt={HERO_ALT}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-top"
      />

      {/* Voile blanc à gauche : lisibilité du texte (n'affecte pas Bibendum, à droite) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 24%, rgba(255,255,255,0) 48%)",
        }}
      />

      <MichelinHeader />

      <main className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-6 pb-[14vh] lg:px-12">
        <div className="max-w-[34rem]">
          <h1 className="text-[clamp(2.75rem,5.4vw,4.5rem)] leading-[1.02] font-extrabold tracking-[-0.025em] text-bleu-fonce">
            La vie est
            <br />
            meilleure en
            <br />
            mouvement.
          </h1>

          <p className="mt-7 max-w-sm text-[19px] leading-[1.5] font-medium text-bleu-fonce/80">
            Trouvez le pneu idéal pour profiter de chaque kilomètre.
          </p>

          <div className="mt-10">
            <Link
              href="/heritage"
              className="group inline-flex h-[60px] min-w-[17rem] items-center justify-center gap-3 rounded-full bg-jaune px-8 text-[17px] font-bold text-bleu-fonce shadow-[0_16px_32px_rgba(252,229,0,0.4)] transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
            >
              Commencer
              <ArrowRight className="h-[22px] w-[22px] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
