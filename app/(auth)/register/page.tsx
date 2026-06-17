import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/lib/current-session";
import { AuthForm } from "../_components/AuthForm";
import { AuthShell } from "../_components/AuthShell";

export const metadata: Metadata = {
  title: "Inscription — Michelin Ride",
  description: "Création d'un compte Michelin Ride.",
};

type AuthPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: AuthPageProps) {
  const session = await getCurrentAuthSession();
  const redirectTo = getSafeRedirect((await searchParams).next);

  if (session) {
    redirect(redirectTo);
  }

  return (
    <AuthShell
      eyebrow="Nouveau compte"
      title="Inscription"
      description="Créez votre accès pour connecter vos vélos et suivre les données de vos pneus."
    >
      <AuthForm mode="register" redirectTo={redirectTo} />
    </AuthShell>
  );
}

function getSafeRedirect(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;

  return next?.startsWith("/") && !next.startsWith("//") ? next : "/pneu";
}
