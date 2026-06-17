"use client";

import { useMemo } from "react";
import { Badge } from "@/app/_components/ui";

export type PneuSensorHistoryPoint = {
  batteryPercent: number;
  distanceKm: number;
  frontPressureBar: number | null;
  frontWearPercent: number | null;
  id: number;
  pressureBar: number;
  rearPressureBar: number | null;
  rearWearPercent: number | null;
  recordedAt: string;
  speedKmh: number;
  wearPercent: number;
};

type ChartSeries = {
  color: string;
  getValue: (point: PneuSensorHistoryPoint) => number | null;
  label: string;
};

type ChartConfig = {
  series: ChartSeries[];
  title: string;
  unit: string;
};

type ChartPoint = {
  x: number;
  y: number;
};

type BuiltChart = {
  max: number;
  min: number;
  series: Array<
    ChartSeries & { latest: number | null; path: string; points: ChartPoint[] }
  >;
};

const chartWidth = 640;
const chartHeight = 220;
const chartPadding = {
  bottom: 38,
  left: 44,
  right: 24,
  top: 28,
};

const chartConfigs: ChartConfig[] = [
  {
    series: [
      {
        color: "#27509b",
        getValue: (point) => point.frontPressureBar ?? point.pressureBar,
        label: "Avant",
      },
      {
        color: "#f9a825",
        getValue: (point) => point.rearPressureBar ?? point.pressureBar,
        label: "Arrière",
      },
    ],
    title: "Pression",
    unit: "bar",
  },
  {
    series: [
      {
        color: "#00205b",
        getValue: (point) => point.frontWearPercent ?? point.wearPercent,
        label: "Avant",
      },
      {
        color: "#b45309",
        getValue: (point) => point.rearWearPercent ?? point.wearPercent,
        label: "Arrière",
      },
    ],
    title: "Usure",
    unit: "%",
  },
  {
    series: [
      {
        color: "#2e7d32",
        getValue: (point) => point.speedKmh,
        label: "Vitesse",
      },
    ],
    title: "Vitesse",
    unit: "km/h",
  },
  {
    series: [
      {
        color: "#000c34",
        getValue: (point) => point.distanceKm,
        label: "Distance",
      },
    ],
    title: "Distance",
    unit: "km",
  },
  {
    series: [
      {
        color: "#b71c1c",
        getValue: (point) => point.batteryPercent,
        label: "Batterie",
      },
    ],
    title: "Batterie",
    unit: "%",
  },
];

export function PneuHistoryCharts({
  history,
}: {
  history: PneuSensorHistoryPoint[];
}) {
  return (
    <section className="mt-10" aria-label="Historique du capteur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-extrabold leading-tight text-bleu-fonce">
          Historique du capteur
        </h2>
        <Badge variant="neutre">{history.length} points</Badge>
      </div>

      {history.length === 0 ? (
        <p className="mt-5 rounded-card-sm border border-bordure bg-carte px-4 py-4 text-sm font-medium text-encre-2">
          Aucune mesure enregistrée pour le moment.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {chartConfigs.map((config) => (
            <MetricChart config={config} key={config.title} readings={history} />
          ))}
        </div>
      )}
    </section>
  );
}

function MetricChart({
  config,
  readings,
}: {
  config: ChartConfig;
  readings: PneuSensorHistoryPoint[];
}) {
  const chart = useMemo(() => buildChart(config, readings), [config, readings]);
  const firstReading = readings[0];
  const lastReading = readings[readings.length - 1];

  return (
    <article className="rounded-card border border-bordure bg-carte p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-extrabold text-encre">{config.title}</h3>
        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
          {chart.series.map((series) => (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold text-encre-2"
              key={series.label}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </span>
          ))}
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="mt-4 h-[220px] w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 640 220"
      >
        <line x1="44" x2="616" y1="28" y2="28" stroke="#e5eaf2" />
        <line x1="44" x2="616" y1="105" y2="105" stroke="#eef4ff" />
        <line x1="44" x2="616" y1="182" y2="182" stroke="#e5eaf2" />
        <text x="0" y="34" fill="#6b7280" fontSize="18" fontWeight="700">
          {formatAxisValue(chart.max, config.unit)}
        </text>
        <text x="0" y="188" fill="#6b7280" fontSize="18" fontWeight="700">
          {formatAxisValue(chart.min, config.unit)}
        </text>
        {chart.series.map((series) => (
          <g key={series.label}>
            {series.path && (
              <path
                d={series.path}
                fill="none"
                stroke={series.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            )}
            {series.points.map((point, index) => (
              <circle
                cx={point.x}
                cy={point.y}
                fill={series.color}
                key={`${series.label}-${index}`}
                r={
                  series.points.length > 24 && index < series.points.length - 1
                    ? 0
                    : 4
                }
              />
            ))}
          </g>
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs font-semibold text-encre-3">
        <span>{firstReading ? formatChartDate(firstReading.recordedAt) : ""}</span>
        <span>{lastReading ? formatChartDate(lastReading.recordedAt) : ""}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {chart.series.map((series) => (
          <span
            className="rounded-card-sm bg-bleu-leger px-3 py-2 text-xs font-bold text-bleu-fonce"
            key={series.label}
          >
            {series.label} {formatMetricValue(series.latest, config.unit)}
          </span>
        ))}
      </div>
    </article>
  );
}

function buildChart(
  config: ChartConfig,
  readings: PneuSensorHistoryPoint[],
): BuiltChart {
  const values = config.series.flatMap((series) =>
    readings
      .map((point) => series.getValue(point))
      .filter(
        (value): value is number => value !== null && Number.isFinite(value),
      ),
  );
  const { max, min } = getChartRange(values);
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  return {
    max,
    min,
    series: config.series.map((series) => {
      const points = readings
        .map((reading, index) => {
          const value = series.getValue(reading);

          if (value === null || !Number.isFinite(value)) {
            return null;
          }

          const x =
            chartPadding.left +
            (index / Math.max(1, readings.length - 1)) * plotWidth;
          const y =
            chartPadding.top + ((max - value) / (max - min)) * plotHeight;

          return { x, y };
        })
        .filter((point): point is ChartPoint => point !== null);

      return {
        ...series,
        latest: getLatestValue(readings, series),
        path: pointsToPath(points),
        points,
      };
    }),
  };
}

function getChartRange(values: number[]) {
  if (values.length === 0) {
    return { max: 1, min: 0 };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    min -= 1;
    max += 1;
  } else {
    const padding = (max - min) * 0.12;

    min -= padding;
    max += padding;
  }

  return { max, min };
}

function pointsToPath(points: ChartPoint[]) {
  if (points.length < 2) {
    return "";
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function getLatestValue(readings: PneuSensorHistoryPoint[], series: ChartSeries) {
  for (let index = readings.length - 1; index >= 0; index -= 1) {
    const value = series.getValue(readings[index]);

    if (value !== null && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function formatMetricValue(value: number | null, unit: string) {
  if (value === null) {
    return "—";
  }

  const fractionDigits = unit === "bar" ? 2 : unit === "km/h" ? 1 : 0;

  return `${value.toLocaleString("fr-FR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: unit === "bar" ? 2 : 0,
  })} ${unit}`;
}

function formatAxisValue(value: number, unit: string) {
  const fractionDigits = unit === "bar" || unit === "km/h" ? 1 : 0;

  return value.toLocaleString("fr-FR", {
    maximumFractionDigits: fractionDigits,
  });
}

function formatChartDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}
