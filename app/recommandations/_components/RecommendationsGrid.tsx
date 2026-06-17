import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Badge } from "@/app/_components/ui";
import type { RecommendationCardData } from "../_lib/recommendation-view";

type RecommendationsGridProps = {
  recommendations: RecommendationCardData[];
};

export function RecommendationsGrid({
  recommendations,
}: RecommendationsGridProps) {
  return (
    <section
      aria-label="Liste des recommandations"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {recommendations.map((recommendation, index) => (
        <article key={recommendation.id} className="min-h-full">
          <Link
            href={`/recommandations/${recommendation.id}`}
            className="group flex h-full min-h-[292px] flex-col overflow-hidden rounded-card border border-bordure bg-carte p-3 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-bleu hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bleu"
          >
            <div className="relative h-28 overflow-hidden rounded-card-sm bg-bleu-leger sm:h-32">
              <Image
                src={recommendation.product.imageSrc}
                alt={recommendation.product.imageAlt}
                width={800}
                height={488}
                loading={index < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 rounded-pill bg-white px-2.5 py-1 text-[11px] font-extrabold text-bleu-fonce shadow-cta">
                {recommendation.wheel.wheelTypeTitle}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <Badge
                variant={index === 0 ? "premium" : "neutre"}
                className="shrink-0"
              >
                {index === 0 ? "Meilleur choix" : `Option ${index + 1}`}
              </Badge>
              <span className="rounded-pill bg-bleu-fonce px-2.5 py-1 text-xs font-extrabold text-white">
                {recommendation.score.toFixed(1)}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-extrabold leading-tight text-bleu-fonce">
              {recommendation.wheel.model}
            </h2>
            <p className="mt-2 text-sm font-medium text-encre-2">
              {recommendation.wheel.wheelSize} ·{" "}
              {recommendation.wheel.tubelessReady
                ? "Tubeless ready"
                : "Chambre à air"}
            </p>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-bordure pt-4">
              <span className="text-sm font-extrabold text-bleu-fonce">
                {recommendation.wheel.price} €
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-bleu transition-colors group-hover:text-bleu-fonce">
                Voir les partenaires
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </article>
      ))}
    </section>
  );
}
