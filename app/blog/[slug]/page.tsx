import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MichelinHeader } from "../../_components/MichelinHeader";
import { Picto } from "../../_components/ui";
import { ArticleBody } from "../_components/ArticleBody";
import { BlogCard } from "../_components/BlogCard";
import { BlogFooter } from "../_components/BlogFooter";
import { Breadcrumbs } from "../_components/Breadcrumbs";
import { stripInline } from "../_components/inline";
import {
  getAllArticles,
  getArticle,
  getRelatedArticles,
} from "../_data/articles";
import { getCategory } from "../_data/categories";
import { formatDate } from "../_data/format";
import type { Article } from "../_data/types";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const url = `/blog/${article.slug}`;
  const image = { url: article.heroImage, alt: article.heroAlt };

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.keywords,
    authors: [{ name: article.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.published,
      modifiedTime: article.updated ?? article.published,
      authors: [article.author],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.heroImage],
    },
  };
}

/* Données structurées : Article + BreadcrumbList (+ FAQPage si pertinent). */
function buildJsonLd(article: Article) {
  const url = absoluteUrl(`/blog/${article.slug}`);
  const category = getCategory(article.category);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      image: absoluteUrl(article.heroImage),
      datePublished: article.published,
      dateModified: article.updated ?? article.published,
      author: { "@type": "Organization", name: article.author },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo-left.webp"),
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: category.label,
      keywords: article.keywords.join(", "),
      inLanguage: "fr-FR",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Le Mag", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  const faq = article.content.find((b) => b.type === "faq");
  if (faq && faq.type === "faq") {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.items.map((item) => ({
        "@type": "Question",
        name: stripInline(item.q),
        acceptedAnswer: { "@type": "Answer", text: stripInline(item.a) },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const related = getRelatedArticles(article);
  const jsonLd = buildJsonLd(article);

  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="flex-1 pb-4">
        <article>
          {/* En-tête */}
          <header className="mx-auto w-full max-w-[820px] px-6 pt-2 lg:px-8 lg:pt-4">
            <Breadcrumbs
              items={[
                { label: "Accueil", href: "/" },
                { label: "Le Mag", href: "/blog" },
                { label: article.title },
              ]}
            />

            <p className="mt-6 text-sm font-bold tracking-[0.14em] text-bleu uppercase">
              {category.label}
            </p>
            <h1 className="mt-3 text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.02em] text-bleu-fonce">
              {article.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed font-medium text-bleu-fonce/75">
              {article.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-encre-3">
              <span className="font-semibold text-encre-2">{article.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.published}>
                {formatDate(article.published)}
              </time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Picto name="mobility" className="h-4 w-4 text-bleu" />
                {article.readingMinutes} min de lecture
              </span>
            </div>
          </header>

          {/* Visuel d'ouverture */}
          <div className="mx-auto mt-8 w-full max-w-[1080px] px-6 lg:mt-10 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-card sm:aspect-[2/1]">
              <Image
                src={article.heroImage}
                alt={article.heroAlt}
                fill
                priority
                unoptimized
                sizes="(max-width: 1080px) 100vw, 1080px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Corps */}
          <div className="mx-auto mt-12 w-full max-w-[760px] px-6 lg:px-8">
            <ArticleBody content={article.content} />
          </div>
        </article>

        {/* À lire ensuite */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-title"
            className="mx-auto mt-20 w-full max-w-[1200px] px-6 lg:px-10"
          >
            <h2
              id="related-title"
              className="text-[clamp(1.4rem,2.8vw,1.9rem)] font-extrabold tracking-[-0.02em] text-bleu-fonce"
            >
              À lire ensuite
            </h2>
            <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} className="flex">
                  <BlogCard article={item} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <BlogFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
