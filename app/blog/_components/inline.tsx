import Link from "next/link";
import type { ReactNode } from "react";

/* Rendu d'un balisage inline minimal et sûr (pas de dangerouslySetInnerHTML) :
     **gras**            → <strong>
     [libellé](/chemin)  → <Link> si interne, <a target=_blank> sinon

   Volontairement non imbriqué (un gras ne contient pas de lien et vice-versa) :
   suffisant pour du contenu éditorial et trivial à raisonner. */

const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

function isInternal(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

/** Version texte brut (pour le JSON-LD, les <title>, etc.). */
export function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }

    const [, bold, linkLabel, linkHref] = match;
    if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-bold text-bleu-fonce">
          {bold}
        </strong>,
      );
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      const className =
        "font-semibold text-bleu underline decoration-bleu/30 underline-offset-2 transition-colors hover:decoration-bleu";
      nodes.push(
        isInternal(linkHref) ? (
          <Link key={key++} href={linkHref} className={className}>
            {linkLabel}
          </Link>
        ) : (
          <a
            key={key++}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {linkLabel}
          </a>
        ),
      );
    }

    last = TOKEN.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
