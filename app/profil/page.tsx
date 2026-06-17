import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeaderUserBadge } from "@/app/_components/HeaderUserBadge";
import { Badge, ButtonLink, Wordmark } from "@/app/_components/ui";
import {
  getCurrentAuthSession,
  getCurrentUserSummary,
} from "@/lib/current-session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./_components/ProfileForm";

export const metadata: Metadata = {
  title: "Profil — Michelin Ride",
  description: "Gérez vos informations personnelles Michelin Ride.",
};

export default async function ProfilePage() {
  const [session, userSummary] = await Promise.all([
    getCurrentAuthSession(),
    getCurrentUserSummary(),
  ]);

  // Temporary public-access mode: do not redirect anonymous visitors.
  // if (!session) {
  //   redirect("/login?next=/profil");
  // }

  const user = session
    ? await prisma.user.findUnique({
        select: {
          createdAt: true,
          email: true,
          firstName: true,
          id: true,
          lastName: true,
          updatedAt: true,
        },
        where: { id: session.userId },
      })
    : null;

  if (session && !user) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <header className="sticky top-0 z-40 border-b border-bordure bg-carte/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" aria-label="Michelin Ride — accueil">
            <Wordmark />
          </Link>
          <nav
            className="flex items-center gap-5 sm:gap-7"
            aria-label="Navigation"
          >
            <Link
              href="/configurateur"
              className="hidden text-sm font-medium text-encre-2 transition-colors hover:text-encre sm:block"
            >
              Configurateur
            </Link>
            <Link
              href="/pneu"
              className="hidden text-sm font-medium text-encre-2 transition-colors hover:text-encre sm:block"
            >
              Capteur
            </Link>
            <Link
              href="/recommandations"
              className="text-sm font-medium text-encre-2 transition-colors hover:text-encre"
            >
              Recommandations
            </Link>
            {userSummary && (
              <HeaderUserBadge user={userSummary} variant="app" />
            )}
          </nav>
        </div>
      </header>

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
          {user ? (
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-encre-2">
              <div>
                <dt className="inline font-semibold text-encre">Créé le </dt>
                <dd className="inline">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-encre">
                  Mis à jour le{" "}
                </dt>
                <dd className="inline">{formatDate(user.updatedAt)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 max-w-2xl text-sm leading-[1.6] text-encre-2">
              Cette page est temporairement accessible sans connexion. Connectez-vous
              pour modifier vos informations personnelles.
            </p>
          )}
        </section>

        {user ? (
          <ProfileForm
            user={{
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            }}
          />
        ) : (
          <section className="rounded-card border border-bordure bg-carte p-6 shadow-card sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-bleu">
              Session
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-bleu-fonce">
              Profil non connecté
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-[1.6] text-encre-2">
              Les champs de profil restent liés à un compte utilisateur. La
              protection de page est désactivée temporairement, mais la mise à
              jour du profil demande toujours une session active.
            </p>
            <ButtonLink href="/login" className="mt-6">
              Se connecter
            </ButtonLink>
          </section>
        )}
      </main>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(value);
}
