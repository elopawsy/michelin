import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./_components/ui";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-carte text-encre">
      {/* Décor de fond très discret, dans l'esprit du design system */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 82% 95%, rgba(39,80,155,0.07) 0%, rgba(39,80,155,0) 70%), radial-gradient(38% 32% at 4% 100%, rgba(252,229,0,0.09) 0%, rgba(252,229,0,0) 70%)",
        }}
      />

      <Header />

      <main className="relative mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 items-stretch gap-4 px-6 lg:grid-cols-2 lg:gap-8 lg:px-12">
        {/* Colonne texte */}
        <div className="flex flex-col justify-center py-12 lg:py-0 lg:pb-20 lg:pr-6">
          <h1 className="text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            La vie est
            <br />
            meilleure en
            <br />
            mouvement.
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-bleu-fonce/75">
            Trouvez le pneu idéal pour profiter de chaque kilomètre.
          </p>

          <div className="mt-10">
            <Link
              href="/pneu"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-pill bg-jaune px-8 text-base font-bold text-bleu-fonce shadow-cta transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
            >
              Commencer
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Colonne visuel — Bibendum + vélo sur route de montagne */}
        <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-0">
          <Image
            src="/hero-bibendum.png"
            alt="Bibendum, la mascotte Michelin, salue de la main à côté d'un vélo de route bleu sur une route de montagne"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain object-bottom"
          />
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-6 lg:px-12 lg:py-8">
        <Link
          href="/"
          aria-label="Michelin — accueil"
          className="inline-flex flex-col items-start"
        >
          <span className="text-2xl leading-none font-extrabold tracking-tight text-bleu-fonce uppercase">
            Michelin
          </span>
          <span
            aria-hidden="true"
            className="mt-1.5 h-[5px] w-full rounded-full bg-jaune"
          />
        </Link>

        <nav
          className="flex items-center gap-6 text-[15px] font-semibold text-bleu-fonce sm:gap-9"
          aria-label="Navigation principale"
        >
          <a href="#a-propos" className="transition-colors hover:text-bleu">
            À propos
          </a>
          <a href="#faq" className="transition-colors hover:text-bleu">
            FAQ
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-bleu"
          >
            FR
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
