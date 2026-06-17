import type { Metadata } from "next";
import { MichelinHeader } from "../_components/MichelinHeader";
import { Reveal } from "../_components/motion";
import { BlogCard } from "./_components/BlogCard";
import { BlogFooter } from "./_components/BlogFooter";
import {
  getArticlesByCategory,
  getFeaturedArticle,
  getNonEmptyCategories,
} from "./_data/articles";
import { SITE_NAME } from "@/lib/site";

const TITLE = "Le Mag — conseils, innovation & culture gravel";
const DESCRIPTION =
  "Le Mag Michelin Ride : nos articles sur le pneu vélo connecté, le choix et l'entretien de vos pneus gravel, et les technologies qui font avancer le cyclisme.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/blog",
  },
};

export default function BlogHub() {
  const featured = getFeaturedArticle();
  const categories = getNonEmptyCategories();

  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-[1200px] px-6 pt-2 lg:px-10 lg:pt-6">
          <Reveal>
            <p className="text-sm font-bold tracking-[0.16em] text-bleu uppercase">
              Le Mag
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-3 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-bleu-fonce">
              Rouler plus loin, mieux équipé.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed font-medium text-bleu-fonce/75 lg:text-lg">
              Conseils d&rsquo;entretien, choix de vos pneus et coulisses de
              l&rsquo;innovation : le savoir-faire Michelin au service de chaque
              sortie gravel.
            </p>
          </Reveal>
        </section>

        {/* Article à la une */}
        <section className="mx-auto mt-10 w-full max-w-[1200px] px-6 lg:mt-12 lg:px-10">
          <Reveal>
            <BlogCard article={featured} featured />
          </Reveal>
        </section>

        {/* Articles par catégorie */}
        {categories.map((category) => {
          const articles = getArticlesByCategory(category.id).filter(
            (a) => a.slug !== featured.slug,
          );
          if (articles.length === 0) return null;

          return (
            <section
              key={category.id}
              aria-labelledby={`cat-${category.id}`}
              className="mx-auto mt-16 w-full max-w-[1200px] px-6 lg:mt-20 lg:px-10"
            >
              <div className="flex flex-col gap-1 border-b border-bordure pb-5">
                <h2
                  id={`cat-${category.id}`}
                  className="text-[clamp(1.4rem,2.8vw,1.9rem)] font-extrabold tracking-[-0.02em] text-bleu-fonce"
                >
                  {category.label}
                </h2>
                <p className="text-[15px] text-encre-2">{category.tagline}</p>
              </div>

              <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <li key={article.slug} className="flex">
                    <BlogCard article={article} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>

      <BlogFooter />
    </div>
  );
}
