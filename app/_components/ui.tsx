import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* Boutons — DA §6. Hauteur 48px, radius pill, texte 15/18/700,
   hover translateY(-1px), active scale(0.98), transition 220ms. */
const buttonBase =
  "inline-flex h-12 items-center justify-center rounded-pill px-6 text-[15px] font-bold leading-[18px] transition duration-200 active:translate-y-0 active:scale-[0.98]";

const buttonVariants = {
  primary:
    "bg-jaune text-bleu-fonce shadow-cta hover:-translate-y-px hover:bg-jaune-hover",
  secondary:
    "bg-bleu-fonce text-white hover:-translate-y-px hover:bg-bleu-nuit",
  outline:
    "border border-bleu bg-transparent text-bleu-fonce hover:-translate-y-px hover:bg-bleu-leger",
} as const;

const disabledClass = "cursor-not-allowed bg-disabled text-disabled-texte";

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof buttonVariants;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  variant?: keyof typeof buttonVariants;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${buttonBase} ${props.disabled ? disabledClass : buttonVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* Badges — DA §9. */
const badgeVariants = {
  connecte: "rounded-pill bg-succes-fond text-succes",
  premium: "rounded-pill bg-jaune text-bleu-fonce",
  warning:
    "rounded-card-sm border border-warning bg-warning-fond text-warning-texte",
  danger: "rounded-pill bg-danger-fond text-danger",
  neutre: "rounded-pill bg-bleu-leger text-bleu",
} as const;

export function Badge({
  variant = "premium",
  className = "",
  children,
}: {
  variant?: keyof typeof badgeVariants;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-[13px] font-bold ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/* Signature de marque — réutilisée dans l'en-tête du site et de /pneu. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-sm font-extrabold tracking-[0.24em] text-bleu-fonce uppercase">
        Michelin
      </span>
      <span className="text-lg leading-none font-bold text-bleu">Ride</span>
      <span
        className="h-1.5 w-1.5 self-end rounded-full bg-jaune"
        aria-hidden="true"
      />
    </span>
  );
}

/* Petite flèche éditoriale pour les liens "Explorer". */
export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
