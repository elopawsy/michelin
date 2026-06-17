import Link from "next/link";
import { redirect } from "next/navigation";
import { HeaderUserBadge } from "@/app/_components/HeaderUserBadge";
import { Badge, ButtonLink, Picto, Wordmark } from "@/app/_components/ui";
import {
  getCurrentAuthSession,
  getCurrentUserSummary,
} from "@/lib/current-session";
import { loadDashboard } from "@/lib/dashboard";

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
  const recommendations = dashboard.recommendations;

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
              className="text-sm font-medium text-encre-2 transition-colors hover:text-encre"
            >
              Capteur
            </Link>
            {user && <HeaderUserBadge user={user} variant="app" />}
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
          </div>
        </section>

        {recommendations.length > 0 ? (
          <section
            aria-label="Liste des recommandations"
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {recommendations.map((recommendation, index) => (
              <article
                key={recommendation.id}
                className="relative flex min-h-[360px] flex-col overflow-hidden rounded-card border border-bordure bg-carte p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-bleu hover:shadow-card-hover"
              >
                <Picto
                  name="bicycle-tire"
                  className="pointer-events-none absolute -right-12 -bottom-12 h-52 w-52 text-bleu/10"
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <Badge variant={index === 0 ? "premium" : "neutre"}>
                      {index === 0 ? "Meilleur choix" : `Option ${index + 1}`}
                    </Badge>
                    <span className="rounded-pill bg-bleu-fonce px-3 py-1 text-sm font-extrabold text-white">
                      {recommendation.score.toFixed(1)}
                    </span>
                  </div>

                  <p className="mt-6 text-sm font-semibold text-bleu">
                    {recommendation.wheel.wheelType.title}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold leading-tight text-bleu-fonce">
                    {recommendation.wheel.model}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-encre-2">
                    {recommendation.wheel.wheelType.wheelSize} ·{" "}
                    {recommendation.wheel.tubelessReady
                      ? "Tubeless ready"
                      : "Chambre à air"}
                  </p>
                  {recommendation.wheel.description && (
                    <p className="mt-4 text-sm leading-[1.6] text-encre-2">
                      {recommendation.wheel.description}
                    </p>
                  )}
                </div>

                <div className="relative mt-auto pt-6">
                  <p className="rounded-card-sm bg-bleu-leger px-4 py-3 text-sm leading-[1.55] text-bleu-fonce">
                    {recommendation.reason}
                  </p>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <Metric label="Vitesse" value={`${recommendation.wheel.speedScore}/10`} />
                    <Metric label="Confort" value={`${recommendation.wheel.comfortScore}/10`} />
                    <Metric
                      label="Durabilité"
                      value={`${recommendation.wheel.durabilityScore}/10`}
                    />
                    <Metric
                      label="Prix"
                      value={`${recommendation.wheel.price.toString()} €`}
                    />
                  </dl>
                </div>
              </article>
            ))}
          </section>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card-sm border border-bordure bg-white px-3 py-2">
      <dt className="text-xs font-semibold text-encre-3">{label}</dt>
      <dd className="mt-1 font-extrabold text-bleu-fonce">{value}</dd>
    </div>
  );
}
