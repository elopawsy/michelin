"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HeaderUserBadge,
  type HeaderUserBadgeUser,
} from "./HeaderUserBadge";
import { Wordmark } from "./ui";

type NavLink = { href: string; label: string; public?: boolean };

/* Sous-menu « Nos pneus » : catalogue, revendeurs et recommandations
   regroupés. `public: true` → visible sans connexion ; sinon réservé aux
   utilisateurs connectés. */
const PRODUITS: { label: string; items: NavLink[] } = {
  label: "Nos pneus",
  items: [
    { href: "/catalogue", label: "Catalogue", public: true },
    { href: "/revendeurs", label: "Revendeurs", public: true },
    { href: "/recommandations", label: "Recommandations" },
  ],
};

const NAV: NavLink[] = [
  { href: "/blog", label: "Le Mag", public: true },
  { href: "/jeu", label: "Le jeu", public: true },
  { href: "/a-propos", label: "À propos" },
  { href: "/faq", label: "FAQ" },
];

type MichelinHeaderClientProps = {
  user: HeaderUserBadgeUser | null;
};

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MichelinHeaderClient({ user }: MichelinHeaderClientProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = (item: NavLink) => item.public || Boolean(user);
  const produits = PRODUITS.items.filter(visible);
  const navItems = NAV.filter(visible);

  return (
    <header className="relative z-20">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-7 lg:px-12 lg:py-8">
        <Link href="/" aria-label="Michelin — accueil" className="inline-flex">
          <Wordmark className="h-9 sm:h-11" />
        </Link>

        {/* Navigation desktop — liens identiques sur toutes les pages, quel
            que soit l'état de connexion (cohérence inter-pages). */}
        <nav
          className="hidden items-center gap-7 text-[15px] font-semibold text-bleu-fonce sm:gap-9 md:flex"
          aria-label="Navigation principale"
        >
          {produits.length > 0 && (
            <div className="group relative">
              <button
                type="button"
                aria-haspopup="menu"
                className="inline-flex items-center gap-1 transition-colors hover:text-bleu group-hover:text-bleu group-focus-within:text-bleu"
              >
                {PRODUITS.label}
                <Chevron className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>
              {/* Le pt-2 fait le pont de survol entre le bouton et le panneau. */}
              <div className="invisible absolute left-0 top-full z-30 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="min-w-[210px] rounded-card border border-bordure bg-carte p-2 shadow-card">
                  {produits.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xs px-3 py-2 text-sm font-semibold text-encre-2 transition-colors hover:bg-bleu-leger hover:text-bleu-fonce"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-bleu"
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <HeaderUserBadge user={user} />
            </div>
          ) : (
            <Link href="/login" className="transition-colors hover:text-bleu">
              Connexion
            </Link>
          )}
        </nav>

        {/* Bouton burger (mobile) */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-bleu-fonce md:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="menu-mobile-heritage"
        >
          <span className="relative block h-3 w-6">
            <span className="absolute inset-x-0 top-0 h-0.5 rounded bg-current" />
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-current" />
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-current" />
          </span>
        </button>
      </div>

      {/* Menu plein écran (mobile) */}
      <div
        id="menu-mobile-heritage"
        aria-hidden={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-fond transition-[opacity,transform] duration-300 ease-out md:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-7">
          <Wordmark className="h-9" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center text-bleu-fonce"
            aria-label="Fermer le menu"
          >
            <span className="relative block h-5 w-5">
              <span className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 rotate-45 rounded bg-current" />
              <span className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 -rotate-45 rounded bg-current" />
            </span>
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col justify-center gap-1 px-6 pb-24"
          aria-label="Navigation mobile"
        >
          {/* Groupe « Nos pneus » */}
          {produits.length > 0 && (
            <p className="pb-1 text-[13px] font-bold tracking-[0.16em] text-bleu uppercase">
              {PRODUITS.label}
            </p>
          )}
          {produits.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="border-b border-bleu-fonce/10 py-4 text-xl font-extrabold text-bleu-fonce"
            >
              {item.label}
            </Link>
          ))}

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="border-b border-bleu-fonce/10 py-4 text-xl font-extrabold text-bleu-fonce"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-7">
            {user ? (
              <div className="flex flex-col items-start gap-4">
                <HeaderUserBadge user={user} />
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="inline-flex text-2xl font-extrabold text-bleu-fonce"
              >
                Connexion
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
