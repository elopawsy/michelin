import Link from "next/link";
import { Wordmark } from "./ui";

/* En-tête marketing partagé : logo Michelin officiel + navigation. */
export function MichelinHeader() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-7 lg:px-12 lg:py-8">
        <Link href="/" aria-label="Michelin — accueil" className="inline-flex">
          <Wordmark className="h-9 sm:h-11" />
        </Link>

        <nav
          className="flex items-center gap-7 text-[15px] font-semibold text-bleu-fonce sm:gap-10"
          aria-label="Navigation principale"
        >
          <Link href="/jeu" className="transition-colors hover:text-bleu">
            Le jeu
          </Link>
          <a href="#a-propos" className="transition-colors hover:text-bleu">
            À propos
          </a>
          <a href="#faq" className="transition-colors hover:text-bleu">
            FAQ
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-bleu"
          >
            FR
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
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
