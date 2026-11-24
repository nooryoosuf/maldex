"use client";

import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";

export type ChartFormat = "number" | "currency" | "compactCurrency" | "percent" | "index" | "volume";

export function formatChartValue(value: number | string | null | undefined, format: ChartFormat, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const numeric = Number(value);
  switch (format) {
    case "currency":
      return formatMvr(numeric, { digits });
    case "compactCurrency":
      return formatMvr(numeric, { compact: true });
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
      return formatMvr(value, { compact: true });
    case "percent":
      return formatPercent(value, 1);
    case "index":
      return formatNumber(value, 0);
    case "volume":
    case "number":
    default:
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
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; dataKey?: string }[];
  label?: string | number;
  format: ChartFormat;
  labelType?: "date" | "year" | "category";
  seriesLabels?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-md border border-line bg-surface px-3 py-2 shadow-pop dark:shadow-pop-dark">
      <div className="mb-1.5 border-b border-line/70 pb-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
        {labelType === "date" ? formatDate(String(label), "long") : String(label)}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {seriesLabels?.[String(entry.dataKey)] ?? entry.name}
            </span>
            <span className="num font-mono text-[11px] font-medium text-ink">{formatChartValue(entry.value, format)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
