import "server-only";

import type { AuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/user-response";

export async function loadDashboard(session: AuthSession) {
  const [
    user,
    bicycles,
    preferences,
    devices,
    latestReadings,
    recommendations,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.userBicycle.findMany({
      include: {
        bicycleModel: {
          include: {
            bicycleType: true,
            brand: true,
          },
        },
      },
      orderBy: { id: "desc" },
      where: { userId: session.userId },
    }),
    prisma.userPreference.findMany({
      include: {
        goal: true,
        roadSurface: true,
      },
      orderBy: { id: "desc" },
      where: { userId: session.userId },
    }),
    prisma.espDevice.findMany({
      orderBy: { id: "desc" },
      where: { userId: session.userId },
    }),
    prisma.wheelSensorReading.findMany({
      include: {
        roadSurface: true,
        userBicycle: true,
      },
      orderBy: { recordedAt: "desc" },
      take: 10,
      where: {
        userBicycle: {
          userId: session.userId,
        },
      },
    }),
    prisma.wheelRecommendation.findMany({
      include: {
        userBicycle: true,
        wheel: {
          include: {
            wheelType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      where: { userId: session.userId },
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    bicycles,
    devices,
    latestReadings,
    preferences,
    recommendations,
    user: serializeUser(user),
  };
}
