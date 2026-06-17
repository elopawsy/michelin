import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "../../_components/ui";
import { getCategory } from "../_data/categories";
import type { Article } from "../_data/types";

/* Carte d'article — utilisée sur le hub et dans « À lire ensuite ».
   `featured` produit une variante large (image à gauche, texte à droite). */
export function BlogCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  const category = getCategory(article.category);
  const href = `/blog/${article.slug}`;

  if (featured) {
    return (
      <Link
        href={href}
        className="group grid overflow-hidden rounded-3xl border border-bordure bg-carte shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover md:grid-cols-2"
      >
        <div className="relative aspect-[16/10] md:aspect-auto">
          <Image
            src={article.heroImage}
            alt={article.heroAlt}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-col justify-center p-7 lg:p-10">
          <span className="text-[13px] font-bold tracking-[0.14em] text-bleu uppercase">
            {category.label}
          </span>
          <h3 className="mt-3 text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            {article.title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-encre-2">
            {article.excerpt}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-bleu-fonce">
            Lire l&rsquo;article
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl border border-bordure bg-carte shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={article.heroImage}
          alt={article.heroAlt}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-[12px] font-bold tracking-[0.14em] text-bleu uppercase">
          {category.label}
        </span>
        <h3 className="mt-2.5 text-lg leading-[1.25] font-extrabold tracking-[-0.01em] text-bleu-fonce">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-encre-2">
          {article.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-bleu-fonce">
          Lire l&rsquo;article
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
        <span className="mt-3 text-[12px] font-medium text-encre-3">
          {article.readingMinutes} min de lecture
        </span>
      </div>
    </Link>
  );
}
