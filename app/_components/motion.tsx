"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Révèle son contenu en fondu + translation quand il entre dans le viewport.
 * Le contenu reste présent dans le DOM (accessible/SEO) ; seul l'affichage
 * est animé. `prefers-reduced-motion` et l'absence de JS court-circuitent l'effet.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion()) {
      el.dataset.shown = "true";
      return;
    }

    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "true";
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Compteur animé : part de 0 et rejoint `to` lorsque l'élément est visible.
 * Le rendu serveur affiche directement la valeur finale (utile sans JS / pour
 * les lecteurs d'écran et crawlers). Sous reduced-motion, pas d'animation.
 */
export function Counter({
  to,
  duration = 1600,
  decimals = 0,
  grouping = true,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  grouping?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    let raf = 0;
    let started = false;

    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        obs.disconnect();

        const t0 = performance.now();
        setValue(0);
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setValue(to * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
          else setValue(to);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const formatted = value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
