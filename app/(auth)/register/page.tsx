import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/lib/current-session";
import { AuthForm } from "../_components/AuthForm";
import { AuthShell } from "../_components/AuthShell";

export const metadata: Metadata = {
  title: "Inscription — Michelin Ride",
  description: "Création d'un compte Michelin Ride.",
};

export default async function RegisterPage() {
  const session = await getCurrentAuthSession();

  if (session) {
    redirect("/pneu");
  }

  return (
    <AuthShell
      eyebrow="Nouveau compte"
      title="Inscription"
      description="Créez votre accès pour connecter vos vélos et suivre les données de vos pneus."
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
