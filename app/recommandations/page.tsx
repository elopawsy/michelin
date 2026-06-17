import Link from "next/link";
import { redirect } from "next/navigation";
import { HeaderUserBadge } from "@/app/_components/HeaderUserBadge";
import { Badge, ButtonLink, Picto, Wordmark } from "@/app/_components/ui";
import {
  getCurrentAuthSession,
  getCurrentUserSummary,
} from "@/lib/current-session";
import { loadDashboard } from "@/lib/dashboard";
import { RecommendationsGrid } from "./_components/RecommendationsGrid";
import { toRecommendationCardData } from "./_lib/recommendation-view";

export default async function RecommandationsPage() {
  const [session, user] = await Promise.all([
    getCurrentAuthSession(),
    getCurrentUserSummary(),
  ]);

  if (!session) {
    redirect("/login?next=/recommandations");
  }

  const dashboard = await loadDashboard(session);
  const latestBicycle = dashboard.bicycles[0] ?? null;
  const latestPreference = dashboard.preferences[0] ?? null;
  const recommendations = dashboard.recommendations.map(toRecommendationCardData);

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <header className="sticky top-0 z-40 border-b border-bordure bg-carte/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" aria-label="Michelin Ride — accueil">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-5 sm:gap-7" aria-label="Navigation">
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
            {user && (
              <div className="flex items-center gap-3">
                <HeaderUserBadge user={user} variant="app" />
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-6 py-10 lg:px-10 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <Badge variant="premium">Michelin Ride</Badge>
            <h1 className="mt-5 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.01em] text-bleu-fonce">
              Vos recommandations pneus
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-[1.65] text-encre-2">
              Retrouvez les pneus calculés à partir de votre vélo, de votre
              terrain, de vos priorités et de votre kilométrage hebdomadaire.
            </p>
          </div>

          <div className="rounded-card border border-bordure bg-carte p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-bleu">
              Dernière configuration
            </p>
            {latestBicycle || latestPreference ? (
              <dl className="mt-5 grid gap-4 text-sm">
                {latestBicycle && (
                  <>
                    <SummaryRow label="Vélo" value={latestBicycle.name} />
                    <SummaryRow
                      label="Type"
                      value={latestBicycle.bicycleModel.bicycleType.title}
                    />
                    <SummaryRow
                      label="Roues"
                      value={`${latestBicycle.wheelSize}, ${latestBicycle.tireWidthMm} mm`}
                    />
                  </>
                )}
                {latestPreference && (
                  <>
                    <SummaryRow label="Terrain" value={latestPreference.roadSurface.title} />
                    <SummaryRow label="Objectif" value={latestPreference.goal.title} />
                    <SummaryRow
                      label="Distance"
                      value={`${latestPreference.weeklyDistanceKm.toFixed(0)} km / semaine`}
                    />
                  </>
                )}
              </dl>
            ) : (
              <p className="mt-4 text-sm leading-[1.6] text-encre-2">
                Aucune configuration enregistrée pour le moment.
              </p>
            )}
            <div className="mt-5 border-t border-bordure pt-5">
              <p className="text-sm leading-[1.55] text-encre-2">
                Votre profil a changé&nbsp;? Reprenez le questionnaire pour
                mettre à jour vos recommandations.
              </p>
              <ButtonLink
                href="/configurateur"
                variant="outline"
                className="mt-4 w-full"
              >
                Refaire le questionnaire
              </ButtonLink>
            </div>
          </div>
        </section>

        {recommendations.length > 0 ? (
          <RecommendationsGrid recommendations={recommendations} />
        ) : (
          <section className="rounded-card border border-bordure bg-carte p-8 text-center shadow-card">
            <Picto
              name="bicycle-tire"
              className="mx-auto h-20 w-20 text-bleu/20"
            />
            <h2 className="mt-5 text-2xl font-extrabold text-bleu-fonce">
              Aucune recommandation disponible
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.6] text-encre-2">
              Complétez le configurateur pour enregistrer vos réponses et
              générer une sélection de pneus adaptée à votre profil.
            </p>
            <ButtonLink href="/configurateur" className="mt-6">
              Lancer le configurateur
            </ButtonLink>
          </section>
        )}
      </main>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-bordure pb-3 last:border-b-0 last:pb-0">
      <dt className="font-semibold text-encre-2">{label}</dt>
      <dd className="text-right font-bold text-bleu-fonce">{value}</dd>
    </div>
  );
}
