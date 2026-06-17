import Image from "next/image";
import { Counter, Reveal } from "../../_components/motion";
import { ArrowRight, Picto } from "../../_components/ui";
import type { ContentBlock } from "../_data/types";
import { renderInline } from "./inline";

/* Rendu d'un article : un tableau de ContentBlock → JSX charté.
   Chaque bloc structurant est révélé au scroll (DA §13). Composant serveur
   qui compose des sous-composants client (Reveal/Counter). */

const calloutStyles = {
  info: "border-bleu/15 bg-bleu-leger",
  tip: "border-succes/20 bg-succes-fond",
  warning: "border-warning/40 bg-warning-fond",
} as const;

const calloutAccent = {
  info: "text-bleu",
  tip: "text-succes",
  warning: "text-warning-texte",
} as const;

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "lead":
      return (
        <p className="text-xl leading-[1.6] font-medium text-bleu-fonce/85 lg:text-[22px]">
          {renderInline(block.text)}
        </p>
      );

    case "paragraph":
      return (
        <p className="text-[17px] leading-[1.75] text-encre-2">
          {renderInline(block.text)}
        </p>
      );

    case "heading":
      return (
        <Reveal className="mt-4">
          <h2
            id={block.id}
            className="scroll-mt-28 text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-extrabold tracking-[-0.02em] text-bleu-fonce"
          >
            {renderInline(block.text)}
          </h2>
        </Reveal>
      );

    case "subheading":
      return (
        <h3 className="mt-3 text-xl font-bold tracking-[-0.01em] text-bleu-fonce">
          {renderInline(block.text)}
        </h3>
      );

    case "image":
      return (
        <Reveal as="figure" className="my-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-card">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-encre-3">
              {block.caption}
            </figcaption>
          )}
        </Reveal>
      );

    case "quote":
      return (
        <Reveal
          as="figure"
          className="my-2 border-l-4 border-jaune pl-6 lg:pl-8"
        >
          <blockquote className="text-xl leading-snug font-bold tracking-[-0.01em] text-bleu-fonce italic lg:text-2xl">
            « {block.text} »
          </blockquote>
          {block.author && (
            <figcaption className="mt-3 text-sm font-semibold text-encre-3 not-italic">
              — {block.author}
            </figcaption>
          )}
        </Reveal>
      );

    case "stats":
      return (
        <Reveal>
          <dl
            className={`grid gap-px overflow-hidden rounded-3xl border border-bordure bg-bordure shadow-card ${
              block.items.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {block.items.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center bg-carte px-4 py-7 text-center"
              >
                <dd className="order-1 text-3xl font-extrabold tracking-[-0.02em] text-bleu-fonce lg:text-4xl">
                  <Counter
                    to={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                </dd>
                <dt className="order-2 mt-2 text-[13px] leading-snug font-medium text-bleu-fonce/60">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      );

    case "features":
      return (
        <Reveal>
          <ul
            className={`grid gap-5 ${
              block.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {block.items.map((feat) => (
              <li
                key={feat.title}
                className="rounded-3xl border border-bordure bg-carte p-6 shadow-card"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-bleu-leger text-bleu">
                  <Picto name={feat.picto} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-bleu-fonce">
                  {feat.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-encre-2">
                  {renderInline(feat.text)}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      );

    case "callout": {
      const variant = block.variant ?? "info";
      return (
        <Reveal
          as="aside"
          className={`rounded-3xl border p-6 lg:p-7 ${calloutStyles[variant]}`}
        >
          {block.title && (
            <p
              className={`text-[13px] font-bold tracking-[0.12em] uppercase ${calloutAccent[variant]}`}
            >
              {block.title}
            </p>
          )}
          <p className="mt-2 text-[16px] leading-relaxed text-encre-2 first:mt-0">
            {renderInline(block.text)}
          </p>
        </Reveal>
      );
    }

    case "steps":
      return (
        <Reveal>
          <ol className="border-l-2 border-bleu-leger">
            {block.items.map((step) => (
              <li key={step.title} className="relative pb-8 pl-7 last:pb-0">
                <span className="absolute top-1 -left-[7px] h-3 w-3 rounded-full bg-bleu ring-4 ring-fond" />
                <p className="text-sm font-extrabold tracking-[0.04em] text-bleu">
                  {step.label}
                </p>
                <p className="mt-1 text-base font-bold text-bleu-fonce">
                  {step.title}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-encre-2">
                  {renderInline(step.text)}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`flex flex-col gap-3 pl-1 ${
            block.ordered ? "[counter-reset:item]" : ""
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[17px] leading-[1.6] text-encre-2">
              {block.ordered ? (
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bleu-leger text-[13px] font-bold text-bleu">
                  {i + 1}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-jaune"
                />
              )}
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </Tag>
      );
    }

    case "comparison":
      return (
        <Reveal>
          <div
            className={`grid gap-5 ${
              block.columns.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
            }`}
          >
            {block.columns.map((col) => (
              <div
                key={col.title}
                className="flex flex-col rounded-3xl border border-bordure bg-carte p-6 shadow-card"
              >
                <h3 className="text-lg font-extrabold text-bleu-fonce">
                  {col.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[15px] leading-relaxed text-encre-2"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-bleu"
                      />
                      <span>{renderInline(point)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      );

    case "faq":
      return (
        <Reveal as="section" className="mt-4">
          {block.title && (
            <h2 className="mb-5 text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-extrabold tracking-[-0.02em] text-bleu-fonce">
              {block.title}
            </h2>
          )}
          <div className="flex flex-col gap-3">
            {block.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-3xl border border-bordure bg-carte px-6 py-5 shadow-card [&[open]]:bg-bleu-leger/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-bleu-fonce marker:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bleu-leger text-bleu transition-transform duration-200 group-open:rotate-45"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-[16px] leading-relaxed text-encre-2">
                  {renderInline(item.a)}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      );

    case "cta":
      return (
        <Reveal>
          <div className="flex flex-col items-start gap-5 rounded-3xl bg-bleu-fonce px-7 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-extrabold sm:text-xl">{block.title}</p>
              {block.text && (
                <p className="mt-1 text-sm text-white/75">{block.text}</p>
              )}
            </div>
            <a
              href={block.href}
              className="group inline-flex h-[52px] shrink-0 items-center gap-3 rounded-full bg-jaune px-7 text-base font-bold text-bleu-fonce shadow-[0_14px_30px_rgba(252,229,0,0.35)] transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
            >
              {block.label}
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      );
  }
}

export function ArticleBody({ content }: { content: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {content.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
