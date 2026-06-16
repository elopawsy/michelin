"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "./ui";

const NAV = [
  { href: "/a-propos", label: "À propos" },
  { href: "/faq", label: "FAQ" },
];

/* En-tête marketing partagé : logo Michelin officiel + navigation. */
export function MichelinHeader() {
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

  return (
    <header className="relative z-20">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-7 lg:px-12 lg:py-8">
        <Link href="/" aria-label="Michelin — accueil" className="inline-flex">
          <Wordmark className="h-9 sm:h-11" />
        </Link>

        {/* Navigation desktop */}
        <nav
          className="hidden items-center gap-7 text-[15px] font-semibold text-bleu-fonce sm:gap-10 md:flex"
          aria-label="Navigation principale"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-bleu"
            >
              {item.label}
            </Link>
          ))}
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
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${100 + i * 70}ms` : "0ms" }}
              className={`border-b border-bleu-fonce/10 py-5 text-2xl font-extrabold text-bleu-fonce transition-[opacity,transform] duration-300 ease-out ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
