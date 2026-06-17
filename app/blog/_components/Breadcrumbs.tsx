import Link from "next/link";

export type Crumb = { label: string; href?: string };

/* Fil d'Ariane charté. Le JSON-LD BreadcrumbList est émis séparément
   par la page article (lib SEO). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-[13px] font-medium">
      <ol className="flex flex-wrap items-center gap-1.5 text-encre-3">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-bleu"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={last ? "text-encre-2" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-bordure">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
