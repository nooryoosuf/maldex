"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PALETTE } from "@/components/charts/time-series-chart";
import { formatChartValue, type ChartFormat } from "@/components/charts/chart-tooltip";
import { formatPercent } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
  sub?: string;
}

export function DonutChart({
  data,
  format = "compactCurrency",
  centerLabel = "Total",
  height = 210,
  className,
}: {
  data: DonutSlice[];
  format?: ChartFormat;
  centerLabel?: string;
  height?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const clean = data.filter((d) => Number.isFinite(d.value) && d.value > 0);
  const total = clean.reduce((sum, item) => sum + item.value, 0);

  if (!clean.length || total <= 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-line text-xs text-muted">
        No composition data available.
      </div>
    );
  }

  const active = activeIndex !== null ? clean[activeIndex] : null;
  const activeShare = active ? (active.value / total) * 100 : null;

  return (
    <div className={cn("grid items-center gap-4 sm:grid-cols-[185px_minmax(0,1fr)]", className)}>
      <div className="relative mx-auto w-[185px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={clean}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="64%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={3}
              stroke="rgb(var(--surface))"
              strokeWidth={1.5}
              isAnimationActive={!reduced}
              animationDuration={420}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {clean.map((entry, idx) => {
                const fill = entry.color ?? CHART_PALETTE[idx % CHART_PALETTE.length];
                const dimmed = activeIndex !== null && activeIndex !== idx;
                return (
                  <Cell
                    key={entry.name}
                    fill={fill}
                    opacity={dimmed ? 0.38 : 1}
                    className="cursor-pointer transition-opacity duration-150 focus:outline-none"
                  />
                );
              })}
            </Pie>
            <Tooltip
              content={({ active: isHover, payload }) => {
                if (!isHover || !payload?.length) return null;
                const item = payload[0].payload as DonutSlice;
                const share = (item.value / total) * 100;
                return (
                  <div className="rounded-lg border border-line bg-surface/95 px-3 py-2 shadow-pop backdrop-blur-md dark:shadow-pop-dark">
                    <p className="text-[11.5px] font-semibold text-ink">{item.name}</p>
                    <p className="mt-0.5 num font-mono text-[11px] text-muted">
                      {formatChartValue(item.value, format)} · {formatPercent(share, 1)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <span className="max-w-[104px] truncate font-mono text-[9px] uppercase tracking-[0.09em] text-muted">
            {active ? active.name : centerLabel}
          </span>
          <span className="num mt-0.5 font-mono text-[14px] font-semibold tracking-[-0.02em] text-ink">
            {formatChartValue(active ? active.value : total, format)}
          </span>
          {activeShare !== null ? (
            <span className="num font-mono text-[10px] text-accent">{formatPercent(activeShare, 1)}</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {clean.map((entry, idx) => {
          const share = (entry.value / total) * 100;
          const color = entry.color ?? CHART_PALETTE[idx % CHART_PALETTE.length];
          const isHovered = activeIndex === idx;
          return (
            <div
              key={entry.name}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={cn(
                "group cursor-default rounded-md px-2 py-1.5 transition-colors",
                isHovered ? "bg-surface-2" : "hover:bg-surface-2/60",
              )}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
                  <span className="truncate font-medium text-ink">{entry.name}</span>
                </span>
                <span className="shrink-0 num font-mono text-[11px] text-muted">
                  {formatPercent(share, 1)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(2, share)}%`, backgroundColor: color }}
                  />
                </div>
                <span className="w-20 text-right num font-mono text-[10px] text-faint">
                  {formatChartValue(entry.value, format)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
