"use client";

import { useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip, formatChartAxis, type ChartFormat } from "@/components/charts/chart-tooltip";
import { formatAxisDate } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
  dashed?: boolean;
  /** Optional per-series geometry when kind="mixed" */
  type?: "line" | "area" | "bar";
  /** Optional secondary axis for mixed-unit charts */
  yAxisId?: "left" | "right";
  /** Optional per-series value format for tooltip & secondary axis */
  format?: ChartFormat;
  /** Optional stack group key */
  stackId?: string;
}

export const CHART_PALETTE = [
  "rgb(var(--chart-1))",
  "rgb(var(--chart-2))",
  "rgb(var(--chart-3))",
  "rgb(var(--chart-4))",
  "rgb(var(--chart-5))",
  "rgb(var(--chart-6))",
];

export type TimeSeriesKind = "line" | "area" | "stacked-area" | "bar" | "stacked-bar" | "mixed";

export function TimeSeriesChart({
  data,
  xKey,
  series,
  kind = "area",
  height = 280,
  format = "number",
  rightFormat,
  range = "1Y",
  labelType = "date",
  showGrid = true,
  showLegend,
  yWidth = 48,
  rightYWidth = 44,
  className,
  zeroLine,
  digits = 0,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  kind?: TimeSeriesKind;
  height?: number;
  format?: ChartFormat;
  rightFormat?: ChartFormat;
  range?: string;
  labelType?: "date" | "year" | "category";
  showGrid?: boolean;
  showLegend?: boolean;
  yWidth?: number;
  rightYWidth?: number;
  className?: string;
  zeroLine?: boolean;
  digits?: number;
}) {
  const reduced = useReducedMotion();
  const animation = !reduced;
  const uid = useId().replace(/:/g, "");
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const visibleSeries = useMemo(
    () => series.filter((s) => !hiddenKeys.includes(s.key)),
    [series, hiddenKeys],
  );

  const toggleSeries = (key: string) => {
    setHiddenKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      // Prevent hiding the very last visible series
      if (series.length - prev.length <= 1) return prev;
      return [...prev, key];
    });
  };

  const labels = useMemo(
    () => Object.fromEntries(series.map((entry) => [entry.key, entry.label])),
    [series],
  );

  const seriesFormats = useMemo(
    () =>
      Object.fromEntries(
        series.filter((entry) => entry.format).map((entry) => [entry.key, entry.format!]),
      ),
    [series],
  );

  const hasRightAxis = useMemo(
    () => visibleSeries.some((entry) => entry.yAxisId === "right"),
    [visibleSeries],
  );

  const resolvedRightFormat = useMemo(
    () => rightFormat ?? visibleSeries.find((s) => s.yAxisId === "right")?.format ?? "percent",
    [rightFormat, visibleSeries],
  );

  const hasNegative = useMemo(() => {
    return data.some((row) =>
      visibleSeries.some((s) => {
        const val = Number(row[s.key]);
        return Number.isFinite(val) && val < 0;
      }),
    );
  }, [data, visibleSeries]);

  const shouldShowZeroLine = zeroLine ?? hasNegative;
  const shouldShowLegend = showLegend ?? series.length > 1;

  if (!data.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-line bg-surface-2/20 text-xs text-muted",
          className,
        )}
        style={{ height }}
      >
        No observations in this range.
      </div>
    );
  }

  const common = {
    data,
    margin: { top: 8, right: hasRightAxis ? 4 : 10, left: 0, bottom: 2 },
  };

  const gradientDefs = (
    <defs>
      {series.map((entry, index) => {
        const color = entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
        return (
          <linearGradient key={entry.key} id={`grad-${uid}-${entry.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={series.length > 1 ? 0.16 : 0.22} />
            <stop offset="85%" stopColor={color} stopOpacity={0.02} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        );
      })}
    </defs>
  );

  const axis = (
    <>
      {gradientDefs}
      <CartesianGrid
        strokeDasharray="2 4"
        stroke="rgb(var(--chart-grid))"
        vertical={false}
        horizontal={showGrid}
      />
      <XAxis
        dataKey={xKey}
        tickLine={false}
        axisLine={false}
        minTickGap={38}
        interval="preserveStartEnd"
        tick={{ fill: "rgb(var(--chart-axis))", fontSize: 10, fontFamily: "JetBrains Mono Variable, monospace" }}
        tickFormatter={(value) =>
          labelType === "date" && String(value).length >= 10 ? formatAxisDate(String(value), range) : String(value)
        }
        dy={8}
      />
      <YAxis
        yAxisId="left"
        tickLine={false}
        axisLine={false}
        width={yWidth}
        tick={{ fill: "rgb(var(--chart-axis))", fontSize: 10, fontFamily: "JetBrains Mono Variable, monospace" }}
        tickFormatter={(value) => formatChartAxis(Number(value), format)}
        domain={
          (kind === "bar" || kind === "stacked-bar") && !hasNegative
            ? [0, "auto"]
            : ["auto", "auto"]
        }
      />
      {hasRightAxis ? (
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={rightYWidth}
          tick={{ fill: "rgb(var(--chart-axis))", fontSize: 10, fontFamily: "JetBrains Mono Variable, monospace" }}
          tickFormatter={(value) => formatChartAxis(Number(value), resolvedRightFormat)}
          domain={["auto", "auto"]}
        />
      ) : null}
      {shouldShowZeroLine ? (
        <ReferenceLine
          yAxisId="left"
          y={0}
          stroke="rgb(var(--border-strong))"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ) : null}
      <Tooltip
        content={
          <ChartTooltip
            format={format}
            labelType={labelType}
            seriesLabels={labels}
            seriesFormats={seriesFormats}
            digits={digits}
          />
        }
        cursor={
          kind === "bar" || kind === "stacked-bar"
            ? { fill: "rgb(var(--border) / 0.28)" }
            : { stroke: "rgb(var(--border-strong))", strokeWidth: 1, strokeDasharray: "3 3" }
        }
        wrapperStyle={{ outline: "none", zIndex: 20 }}
      />
    </>
  );

  const seriesOpacity = (key: string) => (hoveredKey && hoveredKey !== key ? 0.35 : 1);

  return (
    <div className={cn("flex flex-col", className)}>
      {shouldShowLegend ? (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 px-1">
          {series.map((entry, index) => {
            const color = entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
            const hidden = hiddenKeys.includes(entry.key);
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => toggleSeries(entry.key)}
                onMouseEnter={() => setHoveredKey(entry.key)}
                onMouseLeave={() => setHoveredKey(null)}
                aria-pressed={!hidden}
                title={series.length > 1 ? `Click to ${hidden ? "show" : "hide"} ${entry.label}` : entry.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10.5px] font-medium transition-all",
                  hidden
                    ? "border-line/60 bg-transparent text-faint opacity-60 line-through"
                    : "border-line bg-surface-2/60 text-ink hover:border-line-strong",
                )}
              >
                <span
                  className="h-2 w-2 rounded-[2px] transition-opacity"
                  style={{ backgroundColor: color, opacity: hidden ? 0.35 : 1 }}
                />
                <span>{entry.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {kind === "mixed" ? (
            <ComposedChart {...common}>
              {axis}
              {visibleSeries.map((entry) => {
                const index = series.findIndex((s) => s.key === entry.key);
                const color = entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
                const geom = entry.type ?? (index === 0 ? "bar" : "line");
                const axisId = entry.yAxisId ?? "left";
                const opacity = seriesOpacity(entry.key);

                if (geom === "bar") {
                  return (
                    <Bar
                      key={entry.key}
                      yAxisId={axisId}
                      dataKey={entry.key}
                      name={entry.label}
                      stackId={entry.stackId}
                      fill={color}
                      fillOpacity={opacity * 0.88}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={26}
                      isAnimationActive={animation}
                      animationDuration={420}
                    />
                  );
                }
                if (geom === "area") {
                  return (
                    <Area
                      key={entry.key}
                      yAxisId={axisId}
                      type="monotone"
                      dataKey={entry.key}
                      name={entry.label}
                      stroke={color}
                      strokeOpacity={opacity}
                      strokeWidth={1.85}
                      fill={`url(#grad-${uid}-${entry.key})`}
                      fillOpacity={opacity}
                      dot={false}
                      activeDot={{ r: 3.5, strokeWidth: 1.5, stroke: "rgb(var(--surface))", fill: color }}
                      connectNulls={false}
                      isAnimationActive={animation}
                      animationDuration={460}
                    />
                  );
                }
                return (
                  <Line
                    key={entry.key}
                    yAxisId={axisId}
                    type="monotone"
                    dataKey={entry.key}
                    name={entry.label}
                    stroke={color}
                    strokeOpacity={opacity}
                    strokeWidth={2}
                    strokeDasharray={entry.dashed ? "4 3" : undefined}
                    dot={false}
                    activeDot={{ r: 3.5, strokeWidth: 1.5, stroke: "rgb(var(--surface))", fill: color }}
                    connectNulls={false}
                    isAnimationActive={animation}
                    animationDuration={460}
                  />
                );
              })}
            </ComposedChart>
          ) : kind === "bar" || kind === "stacked-bar" ? (
            <BarChart {...common} barGap={series.length > 1 ? 3 : 4}>
              {axis}
              {visibleSeries.map((entry) => {
                const index = series.findIndex((s) => s.key === entry.key);
                const color = entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
                return (
                  <Bar
                    key={entry.key}
                    yAxisId={entry.yAxisId ?? "left"}
                    dataKey={entry.key}
                    name={entry.label}
                    stackId={kind === "stacked-bar" ? entry.stackId ?? "stack" : entry.stackId}
                    fill={color}
                    fillOpacity={seriesOpacity(entry.key) * 0.9}
                    radius={kind === "stacked-bar" ? [2, 2, 0, 0] : [3, 3, 0, 0]}
                    maxBarSize={series.length > 1 ? 20 : 28}
                    isAnimationActive={animation}
                    animationDuration={420}
                  />
                );
              })}
            </BarChart>
          ) : kind === "line" ? (
            <LineChart {...common}>
              {axis}
              {visibleSeries.map((entry) => {
                const index = series.findIndex((s) => s.key === entry.key);
                const color = entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
                return (
                  <Line
                    key={entry.key}
                    yAxisId={entry.yAxisId ?? "left"}
                    type="monotone"
                    dataKey={entry.key}
                    name={entry.label}
                    stroke={color}
                    strokeOpacity={seriesOpacity(entry.key)}
                    strokeWidth={1.9}
                    strokeDasharray={entry.dashed ? "4 3" : undefined}
                    dot={data.length <= 18 ? { r: 2, fill: color, strokeWidth: 0 } : false}
                    activeDot={{ r: 4, strokeWidth: 1.5, stroke: "rgb(var(--surface))", fill: color }}
                    connectNulls={false}
                    isAnimationActive={animation}
                    animationDuration={460}
                  />
                );
              })}
            </LineChart>
          ) : (
            <AreaChart {...common}>
              {axis}
              {visibleSeries.map((entry) => {
                const index = series.findIndex((s) => s.key === entry.key);
                const color = entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
                return (
                  <Area
                    key={entry.key}
                    yAxisId={entry.yAxisId ?? "left"}
                    type="monotone"
                    dataKey={entry.key}
                    name={entry.label}
                    stackId={kind === "stacked-area" ? entry.stackId ?? "stack" : entry.stackId}
                    stroke={color}
                    strokeOpacity={seriesOpacity(entry.key)}
                    strokeWidth={1.85}
                    fill={`url(#grad-${uid}-${entry.key})`}
                    fillOpacity={seriesOpacity(entry.key)}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 1.5, stroke: "rgb(var(--surface))", fill: color }}
                    connectNulls={false}
                    isAnimationActive={animation}
                    animationDuration={460}
                  />
                );
              })}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChartLegend({ series }: { series: ChartSeries[] }) {
  if (series.length < 2) return null;
  return (
    <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {series.map((entry, index) => (
        <span key={entry.key} className="inline-flex items-center gap-1.5 text-[10.5px] text-muted">
          <span
            className="h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length] }}
          />
          {entry.label}
        </span>
      ))}
    </div>
  );
}
