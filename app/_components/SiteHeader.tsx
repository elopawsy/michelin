"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink, Wordmark } from "./ui";

const LINKS = [
  { href: "#connecte", label: "Le pneu connecté" },
  { href: "#gamme", label: "La gamme" },
  { href: "#heritage", label: "Héritage" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding,box-shadow] duration-300 ${
        scrolled
          ? "border-b border-bordure bg-carte/85 py-3 shadow-[0_4px_20px_rgba(0,12,52,0.05)] backdrop-blur-md"
          : "border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 lg:px-10">
        <Link href="/" aria-label="Michelin Ride — accueil">
          <Wordmark />
        </Link>

        <nav
          className="hidden items-center gap-9 md:flex"
          aria-label="Navigation principale"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-encre-2 transition-colors hover:text-encre"
            >
              {l.label}
            </a>
          ))}
          <ButtonLink href="/pneu">Trouver votre pneu</ButtonLink>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-bleu-fonce md:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="menu-mobile"
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
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-0 z-50 flex flex-col bg-carte md:hidden"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Wordmark />
          <button
            type="button"
            onClick={() => setOpen(false)}
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
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-bordure py-5 text-2xl font-extrabold text-encre"
            >
              {l.label}
            </a>
          ))}
          <ButtonLink
            href="/pneu"
            className="mt-8 w-full"
          >
            Trouver votre pneu
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
