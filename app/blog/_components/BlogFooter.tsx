import Link from "next/link";
import { Wordmark } from "../../_components/ui";
import { CATEGORIES } from "../_data/categories";
import { getArticlesByCategory } from "../_data/articles";

/* Pied de page éditorial — décliné du footer du design system (bleu-nuit).
   Riche en liens internes (catégories + articles) pour le maillage SEO. */
export function BlogFooter() {
  return (
    <footer className="mt-24 bg-bleu-nuit text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link
              href="/"
              aria-label="Michelin Ride — accueil"
              className="inline-flex rounded-2xl bg-white px-5 py-3"
            >
              <Wordmark className="h-9" />
            </Link>
            <p className="mt-5 max-w-sm text-base leading-[1.7] text-white/60">
              Le Mag — conseils, technologies et culture gravel par les
              équipes Michelin Ride. Pour rouler plus loin, mieux équipé.
            </p>
            <Link
              href="/pneu"
              className="mt-7 inline-flex h-12 items-center rounded-pill bg-jaune px-6 text-[15px] font-bold text-bleu-fonce transition hover:-translate-y-px hover:bg-jaune-hover"
            >
              Trouver votre pneu
            </Link>
          </div>

          {CATEGORIES.map((category) => (
            <nav
              key={category.id}
              aria-label={category.label}
              className="md:col-span-3"
            >
              <h2 className="text-[13px] leading-[18px] font-bold tracking-[0.16em] text-white/45 uppercase">
                {category.label}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {getArticlesByCategory(category.id)
                  .slice(0, 4)
                  .map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-sm text-white/75 transition-colors hover:text-white"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Michelin — LB 2 Wheels. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/blog" className="transition-colors hover:text-white">
              Le Mag
            </Link>
            <Link href="/a-propos" className="transition-colors hover:text-white">
              À propos
            </Link>
            <Link href="/faq" className="transition-colors hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
