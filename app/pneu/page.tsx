import { getCurrentAuthSession } from "@/lib/current-session";
import { loadDashboard } from "@/lib/dashboard";
import { MichelinHeader } from "../_components/MichelinHeader";
import {
  PneuClient,
  type PneuRecommendationSummary,
} from "./PneuClient";

export default async function PneuPage() {
  const session = await getCurrentAuthSession();
  const recommendation = session
    ? await loadLatestRecommendation(session).catch(() => null)
    : null;

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <MichelinHeader />

      <PneuClient recommendation={recommendation} />
    </div>
  );
}

async function loadLatestRecommendation(
  session: NonNullable<Awaited<ReturnType<typeof getCurrentAuthSession>>>,
): Promise<PneuRecommendationSummary | null> {
  const dashboard = await loadDashboard(session);
  const recommendation = dashboard.recommendations[0];

  if (!recommendation) {
    return null;
  }

  return {
    description: recommendation.wheel.description,
    model: recommendation.wheel.model,
    reason: recommendation.reason,
    score: recommendation.score,
    tubelessReady: recommendation.wheel.tubelessReady,
    wheelSize: recommendation.wheel.wheelType.wheelSize,
    wheelTypeTitle: recommendation.wheel.wheelType.title,
  };
}
