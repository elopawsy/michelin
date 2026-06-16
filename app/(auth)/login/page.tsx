import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/lib/current-session";
import { AuthForm } from "../_components/AuthForm";
import { AuthShell } from "../_components/AuthShell";

export const metadata: Metadata = {
  title: "Connexion — Michelin Ride",
  description: "Connexion à l'espace Michelin Ride.",
};

type AuthPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: AuthPageProps) {
  const session = await getCurrentAuthSession();
  const redirectTo = getSafeRedirect((await searchParams).next);

  if (session) {
    redirect(redirectTo);
  }

  return (
    <AuthShell
      eyebrow="Espace rider"
      title="Connexion"
      description="Retrouvez vos vélos, vos capteurs et vos recommandations Michelin Ride."
    >
      <AuthForm mode="login" redirectTo={redirectTo} />
    </AuthShell>
  );
}

function getSafeRedirect(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;

  return next?.startsWith("/") && !next.startsWith("//") ? next : "/pneu";
}
