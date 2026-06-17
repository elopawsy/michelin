import { getWheelProductMock } from "@/lib/recommendation-partners";
import type { WheelPartner } from "@/lib/recommendation-partners";

export type RecommendationCardData = {
  id: number;
  product: {
    imageAlt: string;
    imageSrc: string;
    partners: WheelPartner[];
  };
  reason: string;
  score: number;
  wheel: {
    comfortScore: number;
    description: string | null;
    durabilityScore: number;
    model: string;
    price: string;
    speedScore: number;
    tubelessReady: boolean;
    wheelSize: string;
    wheelTypeTitle: string;
  };
};

type RecommendationSource = {
  id: number;
  reason: string;
  score: number;
  wheel: {
    comfortScore: number;
    description: string | null;
    durabilityScore: number;
    model: string;
    price: { toString(): string } | number | string;
    speedScore: number;
    tubelessReady: boolean;
    wheelType: {
      title: string;
      wheelSize: string;
    };
  };
};

export function toRecommendationCardData(
  recommendation: RecommendationSource,
): RecommendationCardData {
  const price = recommendation.wheel.price?.toString() ?? "0";

  return {
    id: recommendation.id,
    product: getWheelProductMock(recommendation.wheel.model, price),
    reason: recommendation.reason,
    score: recommendation.score,
    wheel: {
      comfortScore: recommendation.wheel.comfortScore,
      description: recommendation.wheel.description,
      durabilityScore: recommendation.wheel.durabilityScore,
      model: recommendation.wheel.model,
      price: formatPrice(price),
      speedScore: recommendation.wheel.speedScore,
      tubelessReady: recommendation.wheel.tubelessReady,
      wheelSize: recommendation.wheel.wheelType.wheelSize,
      wheelTypeTitle: recommendation.wheel.wheelType.title,
    },
  };
}

function formatPrice(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed.toFixed(2) : value;
}
