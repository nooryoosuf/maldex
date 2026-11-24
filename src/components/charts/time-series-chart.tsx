"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
}

const PALETTE = [
  "rgb(var(--accent))",
  "rgb(var(--positive))",
  "rgb(var(--warning))",
  "rgb(var(--negative))",
  "rgb(120 132 145)",
  "rgb(160 120 200)",
];

export function TimeSeriesChart({
  data,
  xKey,
  series,
  kind = "area",
  height = 280,
  format = "number",
  range = "1Y",
  labelType = "date",
  showGrid = true,
  yWidth = 48,
  className,
  zeroLine = false,
  digits = 0,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  kind?: "line" | "area" | "bar";
  height?: number;
  format?: ChartFormat;
  range?: string;
  labelType?: "date" | "year" | "category";
  showGrid?: boolean;
  yWidth?: number;
  className?: string;
  zeroLine?: boolean;
  digits?: number;
}) {
  const reduced = useReducedMotion();
  const animation = !reduced;
  const labels = Object.fromEntries(series.map((entry) => [entry.key, entry.label]));

  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center rounded-sm border border-dashed border-line text-xs text-muted", className)} style={{ height }}>
        No observations in this range.
      </div>
    );
  }

  const common = {
    data,
    margin: { top: 6, right: 10, left: 0, bottom: 0 },
  };

  const axis = (
    <>
      <CartesianGrid
        strokeDasharray="3 4"
        stroke="rgb(var(--chart-grid))"
        vertical={false}
        horizontal={showGrid}
      />
      <XAxis
        dataKey={xKey}
        tickLine={false}
        axisLine={false}
        minTickGap={42}
        interval="preserveStartEnd"
        tick={{ fill: "rgb(var(--chart-axis))", fontSize: 10, fontFamily: "JetBrains Mono Variable, monospace" }}
        tickFormatter={(value) =>
          labelType === "date" ? formatAxisDate(String(value), range) : String(value)
        }
        dy={8}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={yWidth}
        tick={{ fill: "rgb(var(--chart-axis))", fontSize: 10, fontFamily: "JetBrains Mono Variable, monospace" }}
        tickFormatter={(value) => formatChartAxis(Number(value), format)}
        domain={kind === "bar" ? [0, "auto"] : ["auto", "auto"]}
      />
      <Tooltip
        content={<ChartTooltip format={format} labelType={labelType} seriesLabels={labels} />}
        cursor={{ stroke: "rgb(var(--line-strong))", strokeWidth: 1, strokeDasharray: "3 3" }}
        wrapperStyle={{ outline: "none" }}
      />
    </>
  );

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === "bar" ? (
          <BarChart {...common}>
            {axis}
            {series.map((entry, index) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.label}
                fill={entry.color ?? PALETTE[index % PALETTE.length]}
                radius={[2, 2, 0, 0]}
                maxBarSize={22}
                isAnimationActive={animation}
                animationDuration={420}
              />
            ))}
          </BarChart>
        ) : kind === "line" ? (
          <LineChart {...common}>
            {axis}
            {series.map((entry, index) => (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={entry.color ?? PALETTE[index % PALETTE.length]}
                strokeWidth={1.7}
                strokeDasharray={entry.dashed ? "4 3" : undefined}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={animation}
                animationDuration={480}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart {...common}>
            {axis}
            {series.map((entry, index) => (
              <Area
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={entry.color ?? PALETTE[index % PALETTE.length]}
                strokeWidth={1.6}
                fill={entry.color ?? PALETTE[index % PALETTE.length]}
                fillOpacity={series.length > 1 ? 0.03 : 0.07}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={animation}
                animationDuration={480}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
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
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: entry.color ?? PALETTE[index % PALETTE.length] }}
          />
          {entry.label}
        </span>
      ))}
    </div>
  );
}
