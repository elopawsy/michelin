import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MichelinHeader } from "@/app/_components/MichelinHeader";
import { Badge } from "@/app/_components/ui";
import { getCurrentAuthSession } from "@/lib/current-session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./_components/ProfileForm";

export const metadata: Metadata = {
  title: "Profil — Michelin Ride",
  description: "Gérez vos informations personnelles Michelin Ride.",
};

export default async function ProfilePage() {
  const session = await getCurrentAuthSession();

  if (!session) {
    redirect("/login?next=/profil");
  }

  const user = await prisma.user.findUnique({
    select: {
      createdAt: true,
      email: true,
      firstName: true,
      id: true,
      lastName: true,
      updatedAt: true,
    },
    where: { id: session.userId },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-6 py-10 lg:px-10 lg:py-12">
        <section className="max-w-3xl">
          <Badge variant="premium">Compte rider</Badge>
          <h1 className="mt-5 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.04] text-bleu-fonce">
            Votre profil
          </h1>
          <p className="mt-5 text-base leading-[1.65] text-encre-2">
            Modifiez vos informations personnelles et gérez votre session
            Michelin Ride.
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-encre-2">
            <div>
              <dt className="inline font-semibold text-encre">Créé le </dt>
              <dd className="inline">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-encre">Mis à jour le </dt>
              <dd className="inline">{formatDate(user.updatedAt)}</dd>
            </div>
          </dl>
        </section>

        <ProfileForm
          user={{
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }}
        />
      </main>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(value);
}
