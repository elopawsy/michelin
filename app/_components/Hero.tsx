"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "./motion";
import { Badge, ButtonLink } from "./ui";

/* Pneu Michelin Ride : signature « flanc blanc » (placeholder décrit, rendu SVG). */
function TireVisual() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      role="img"
      aria-label="Pneu gravel Michelin Ride à flanc blanc"
    >
      <circle cx="200" cy="200" r="192" fill="#000c34" />
      {/* relief de bande de roulement */}
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="none"
        stroke="#27509b"
        strokeWidth="10"
        strokeDasharray="5 9"
        opacity="0.55"
      />
      {/* flanc blanc — signature de la marque */}
      <circle cx="200" cy="200" r="166" fill="#ffffff" />
      <circle cx="200" cy="200" r="166" fill="none" stroke="#e5eaf2" strokeWidth="1" />
      {/* jante */}
      <circle cx="200" cy="200" r="118" fill="#eef4ff" />
      <circle
        cx="200"
        cy="200"
        r="118"
        fill="none"
        stroke="#27509b"
        strokeWidth="1.5"
        opacity="0.3"
      />
      {/* moyeu */}
      <circle cx="200" cy="200" r="30" fill="#27509b" />
    </svg>
  );
}

export function Hero() {
  const panelRef = useRef<HTMLDivElement>(null);

  // Parallaxe très légère sur le visuel produit. Coupée si reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (panelRef.current) {
          panelRef.current.style.transform = `translate3d(0, ${window.scrollY * -0.04}px, 0)`;
        }
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-fond"
      aria-label="Michelin Ride — accueil"
    >
      {/* Accents lumineux discrets */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 55% at 88% 8%, #eef4ff 0%, rgba(238,244,255,0) 60%), radial-gradient(40% 40% at 0% 100%, rgba(252,229,0,0.10) 0%, rgba(252,229,0,0) 70%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 px-6 pt-32 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10 lg:pt-40 lg:pb-28">
        <div>
          <Reveal>
            <Badge variant="premium">Gravel d&apos;abord</Badge>
          </Reveal>

          <Reveal as="h1" delay={80}>
            <span className="mt-7 block text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-encre">
              Le gravel haut de gamme,
              <br />
              par-delà le bitume.
            </span>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-encre-2">
              Michelin Ride réunit l&apos;héritage du pneu démontable depuis
              1891 et le premier pneu connecté&nbsp;: pression, usure et surface,
              lues en temps réel. Pensé pour les vélos qui ne s&apos;arrêtent pas
              où s&apos;arrête la route.
            </p>
          </Reveal>

          <Reveal
            delay={260}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <ButtonLink href="/pneu">Trouver votre pneu</ButtonLink>
            <ButtonLink href="#connecte" variant="outline">
              Découvrir le pneu connecté
            </ButtonLink>
          </Reveal>

          <Reveal delay={340}>
            <p className="mt-9 text-[13px] leading-[18px] font-medium text-encre-3">
              Europe &amp; Amérique du Nord · Vélos 2 000–12 000 €
            </p>
          </Reveal>
        </div>

        {/* Visuel produit */}
        <Reveal delay={150} className="flex justify-center lg:justify-end">
          <div ref={panelRef} className="w-full max-w-[460px] will-change-transform">
            <div className="relative aspect-square rounded-panel border border-bordure bg-carte p-8 shadow-panel sm:p-10">
              <TireVisual />

              <div className="absolute top-5 right-5">
                <Badge variant="connecte">
                  <span
                    className="pulse-dot h-2 w-2 rounded-full bg-succes"
                    aria-hidden="true"
                  />
                  Connecté
                </Badge>
              </div>

              <div className="absolute bottom-6 left-6 rounded-card-sm border border-bordure bg-carte px-4 py-3 shadow-card">
                <p className="text-[13px] leading-[18px] font-bold text-encre-2">
                  Pression
                </p>
                <p className="text-2xl leading-none font-extrabold text-encre tabular-nums">
                  2,4
                  <span className="ml-1 text-sm font-semibold text-encre-3">
                    bar
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-[11px] tracking-wide text-encre-3">
              Visuel — pneu gravel à flanc blanc, aperçu connecté
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
