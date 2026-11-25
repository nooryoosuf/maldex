"use client";

import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";

export type ChartFormat = "number" | "currency" | "compactCurrency" | "percent" | "index" | "volume" | "usdMillions";

export function formatChartValue(value: number | string | null | undefined, format: ChartFormat, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const numeric = Number(value);
  switch (format) {
    case "currency":
      return formatMvr(numeric, { digits: digits || 2 });
    case "compactCurrency":
      return formatMvr(numeric, { compact: true });
    case "usdMillions":
      return `US$ ${formatNumber(numeric, digits || 1)}M`;
    case "percent":
      return formatPercent(numeric, digits || 1);
    case "index":
      return formatNumber(numeric, 2);
    case "volume":
      return formatNumber(numeric, 0);
    default:
      return formatNumber(numeric, digits);
  }
}

export function formatChartAxis(value: number, format: ChartFormat): string {
  switch (format) {
    case "currency":
    case "compactCurrency":
      return formatMvr(value, { compact: true }).replace(/^MVR\s*/, "");
    case "usdMillions":
      return `$${formatNumber(value, 0)}m`;
    case "percent":
      return formatPercent(value, Math.abs(value) < 10 && value % 1 !== 0 ? 1 : 0);
    case "index":
      return formatNumber(value, 0);
    case "volume":
    case "number":
    default:
      if (Math.abs(value) >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)}m`;
      if (Math.abs(value) >= 10_000) return `${formatNumber(value / 1_000, 0)}k`;
      return formatNumber(value, 0);
  }
}

export function ChartTooltip({
  active,
  payload,
  label,
  format,
  labelType = "date",
  seriesLabels,
  seriesFormats,
  digits = 0,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; stroke?: string; fill?: string; dataKey?: string }[];
  label?: string | number;
  format: ChartFormat;
  labelType?: "date" | "year" | "category";
  seriesLabels?: Record<string, string>;
  seriesFormats?: Record<string, ChartFormat>;
  digits?: number;
}) {
  if (!active || !payload?.length) return null;

  const formattedLabel =
    labelType === "date" && String(label).length >= 10
      ? formatDate(String(label), "long")
      : String(label ?? "");

  return (
    <div className="min-w-[172px] rounded-lg border border-line bg-surface/95 px-3 py-2.5 shadow-pop backdrop-blur-md dark:shadow-pop-dark">
      <div className="mb-1.5 flex items-center justify-between gap-3 border-b border-line/70 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
        <span>{formattedLabel}</span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "");
          const itemFormat = seriesFormats?.[key] ?? format;
          const swatch = entry.color || entry.stroke || entry.fill || "rgb(var(--accent))";
          return (
            <div key={key} className="flex items-center justify-between gap-5">
              <span className="flex items-center gap-2 text-[11.5px] text-muted">
                <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: swatch }} />
                <span className="truncate max-w-[150px]">{seriesLabels?.[key] ?? entry.name}</span>
              </span>
              <span className="num font-mono text-[11.5px] font-semibold text-ink">
                {formatChartValue(entry.value, itemFormat, digits)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
