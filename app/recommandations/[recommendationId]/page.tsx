import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MichelinHeader } from "@/app/_components/MichelinHeader";
import { ArrowLeft, ArrowRight, Badge } from "@/app/_components/ui";
import { getCurrentAuthSession } from "@/lib/current-session";
import { prisma } from "@/lib/prisma";
import { toRecommendationCardData } from "../_lib/recommendation-view";

type RecommendationDetailPageProps = {
  params: Promise<{
    recommendationId: string;
  }>;
};

export default async function RecommendationDetailPage({
  params,
}: RecommendationDetailPageProps) {
  const { recommendationId } = await params;
  const recommendationIdNumber = Number(recommendationId);

  if (!Number.isInteger(recommendationIdNumber) || recommendationIdNumber <= 0) {
    notFound();
  }

  const session = await getCurrentAuthSession();

  if (!session) {
    redirect(`/login?next=/recommandations/${recommendationId}`);
  }

  const recommendation = await prisma.wheelRecommendation.findFirst({
    include: {
      wheel: {
        include: {
          wheelType: true,
        },
      },
    },
    where: {
      id: recommendationIdNumber,
      userId: session.userId,
    },
  });

  if (!recommendation) {
    notFound();
  }

  const detail = toRecommendationCardData(recommendation);

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-7 px-6 py-10 lg:px-10 lg:py-12">
        <Link
          href="/recommandations"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-bleu transition-colors hover:text-bleu-fonce"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les recommandations
        </Link>

        <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="overflow-hidden rounded-card border border-bordure bg-carte shadow-card">
            <div className="relative h-[260px] bg-bleu-leger sm:h-[340px]">
              <Image
                src={detail.product.imageSrc}
                alt={detail.product.imageAlt}
                width={800}
                height={488}
                priority
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-4 left-4 rounded-pill bg-white px-3 py-1 text-xs font-extrabold text-bleu-fonce shadow-cta">
                {detail.wheel.wheelTypeTitle}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="premium">Recommandation Michelin Ride</Badge>
                <span className="rounded-pill bg-bleu-fonce px-3 py-1 text-sm font-extrabold text-white">
                  Score {detail.score.toFixed(1)}
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.03] text-bleu-fonce">
                {detail.wheel.model}
              </h1>
              <p className="mt-3 text-base font-medium text-encre-2">
                {detail.wheel.wheelSize} ·{" "}
                {detail.wheel.tubelessReady
                  ? "Tubeless ready"
                  : "Chambre à air"}
              </p>

              {detail.wheel.description && (
                <p className="mt-5 max-w-3xl text-sm leading-[1.7] text-encre-2">
                  {detail.wheel.description}
                </p>
              )}

              <p className="mt-6 rounded-card-sm bg-bleu-leger px-4 py-3 text-sm leading-[1.6] text-bleu-fonce">
                {detail.reason}
              </p>

              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Vitesse" value={`${detail.wheel.speedScore}/10`} />
                <Metric
                  label="Confort"
                  value={`${detail.wheel.comfortScore}/10`}
                />
                <Metric
                  label="Durabilité"
                  value={`${detail.wheel.durabilityScore}/10`}
                />
                <Metric label="Prix" value={`${detail.wheel.price} €`} />
              </dl>
            </div>
          </div>

          <aside className="lg:pt-2">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-bleu">
              Magasins partenaires
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-bleu-fonce">
              Comparer les offres
            </h2>

            <div className="mt-5 grid gap-3">
              {detail.product.partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-card-sm border border-bordure bg-white px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-bleu hover:shadow-card"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-sm font-extrabold text-bleu-fonce">
                        {partner.name}
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-[1.45] text-encre-2">
                        {partner.availability} · {partner.shipping}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-pill bg-jaune px-3 py-1 text-xs font-extrabold text-bleu-fonce">
                      {partner.price}
                    </span>
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-bleu">
                    Ouvrir la boutique
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </a>
              ))}
            </div>
          </aside>
        </section>
      </main>
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
