import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/lib/current-session";
import { AuthForm } from "../_components/AuthForm";
import { AuthShell } from "../_components/AuthShell";

export const metadata: Metadata = {
  title: "Connexion — Michelin Ride",
  description: "Connexion à l'espace Michelin Ride.",
};

export default async function LoginPage() {
  const session = await getCurrentAuthSession();

  if (session) {
    redirect("/pneu");
  }

  return (
    <AuthShell
      eyebrow="Espace rider"
      title="Connexion"
      description="Retrouvez vos vélos, vos capteurs et vos recommandations Michelin Ride."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
