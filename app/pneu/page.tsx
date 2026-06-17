import { getCurrentAuthSession } from "@/lib/current-session";
import { loadDashboard } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { MichelinHeader } from "../_components/MichelinHeader";
import { type PneuSensorHistoryPoint } from "./_components/PneuHistoryCharts";
import { PneuClient, type PneuRecommendationSummary } from "./PneuClient";

type PneuSensorData = {
  espDeviceId: number | null;
  history: PneuSensorHistoryPoint[];
};

export default async function PneuPage() {
  const session = await getCurrentAuthSession();
  const [recommendation, sensorData] = session
    ? await Promise.all([
        loadLatestRecommendation(session).catch(() => null),
        loadPneuSensorData(session),
      ])
    : [null, { espDeviceId: null, history: [] }];

  return (
    <div className="flex min-h-full flex-col bg-fond text-encre">
      <MichelinHeader />

      <PneuClient
        espDeviceId={sensorData.espDeviceId}
        initialHistory={sensorData.history}
        recommendation={recommendation}
      />
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

async function loadPneuSensorData(
  session: NonNullable<Awaited<ReturnType<typeof getCurrentAuthSession>>>,
): Promise<PneuSensorData> {
  const device = await prisma.espDevice.findFirst({
    orderBy: [{ lastSeenAt: "desc" }, { id: "desc" }],
    select: { id: true },
    where: { userId: session.userId },
  });

  if (!device) {
    return { espDeviceId: null, history: [] };
  }

  const readings = await prisma.wheelSensorReading.findMany({
    orderBy: { recordedAt: "desc" },
    select: {
      batteryPercent: true,
      distanceKm: true,
      frontPressureBar: true,
      frontWearPercent: true,
      id: true,
      pressureBar: true,
      rearPressureBar: true,
      rearWearPercent: true,
      recordedAt: true,
      speedKmh: true,
      wearPercent: true,
    },
    take: 120,
    where: {
      espDeviceId: device.id,
      espDevice: { userId: session.userId },
    },
  });

  return {
    espDeviceId: device.id,
    history: [...readings].reverse().map((reading) => ({
      batteryPercent: reading.batteryPercent,
      distanceKm: reading.distanceKm,
      frontPressureBar: reading.frontPressureBar,
      frontWearPercent: reading.frontWearPercent,
      id: reading.id,
      pressureBar: reading.pressureBar,
      rearPressureBar: reading.rearPressureBar,
      rearWearPercent: reading.rearWearPercent,
      recordedAt: reading.recordedAt.toISOString(),
      speedKmh: reading.speedKmh,
      wearPercent: reading.wearPercent,
    })),
  };
}
