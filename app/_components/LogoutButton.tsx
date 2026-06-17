"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  redirectTo?: string;
  variant?: "app" | "marketing";
};

const variantClasses = {
  app: "border-bordure text-encre-2 hover:border-bleu hover:bg-bleu-leger hover:text-bleu-fonce",
  marketing:
    "border-bleu-fonce/20 text-bleu-fonce hover:border-bleu hover:bg-bleu-leger hover:text-bleu",
} as const;

export function LogoutButton({
  className = "",
  redirectTo = "/login",
  variant = "marketing",
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function logout() {
    setFailed(false);
    setPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to logout");
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      aria-label={failed ? "Réessayer la déconnexion" : "Se déconnecter"}
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-pill border px-3 text-xs font-bold transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
    >
      {pending ? "Déconnexion…" : failed ? "Réessayer" : "Déconnexion"}
    </button>
  );
}
