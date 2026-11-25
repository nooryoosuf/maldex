"use client";

import { ArrowDownRight, ArrowUpRight, Download, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Sparkline } from "@/components/ui/sparkline";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { DetailDrawer, WhatDoesThisMean } from "@/components/ui/disclosure-panel";
import type { EconomicIndicator } from "@/lib/types";
import {
  buildObservation,
  freshnessLabel,
  getFreshness,
  getIndicatorChange,
  getPreviousObservation,
  getPulseSeries,
} from "@/lib/data/economy";
import { downloadCsv, formatDate, formatNumber, formatPercent, formatUnitValue, toCsv } from "@/lib/format";
import { cn } from "@/lib/cn";

const INVERTED_SEMANTICS = new Set(["inflation", "unemployment", "govDebt"]);

export function IndicatorCard({
  indicator,
  updatedAt,
}: {
  indicator: EconomicIndicator;
  updatedAt?: string;
}) {
  const freshness = getFreshness(indicator);
  const change = getIndicatorChange(indicator);
  const previous = getPreviousObservation(indicator);
  const observation = buildObservation(indicator);
  const sparkData = getPulseSeries(indicator.key, 14);

  const isPp =
    indicator.unit === "% annual" ||
    indicator.unit === "% of GDP" ||
    indicator.unit === "% of labour force";

  const invert = INVERTED_SEMANTICS.has(indicator.key);
  const deltaRaw = isPp ? change.absolute : change.percent;
  const isUp = (change.absolute ?? 0) > 0;
  const isDown = (change.absolute ?? 0) < 0;
  const favorable = deltaRaw === null || deltaRaw === 0 ? null : invert ? isDown : isUp;

  const DeltaIcon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;

  const handleExport = () => {
    downloadCsv(
      `maldex-${indicator.key}.csv`,
      toCsv(
        [
          { key: "period", label: "Period" },
          { key: "value", label: `${indicator.name} (${indicator.unit})` },
        ],
        indicator.observations.map((o) => ({ period: o.period, value: o.value })),
      ),
    );
  };

  return (
    <article
      id={indicator.key}
      className="group surface-interactive relative flex flex-col justify-between p-4 scroll-mt-24"
    >
      {/* Header: Name, Unit & Status Badges */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
              {indicator.name}
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono text-[9.5px] text-faint">
              <span>{indicator.unit}</span>
              <span>·</span>
              <span>Period {indicator.latest?.period ?? "—"}</span>
              {updatedAt ? (
                <span className="hidden opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:inline">
                  · Retrieved {formatDate(updatedAt)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              variant={
                freshness === "fresh"
                  ? "positive"
                  : freshness === "lagging"
                    ? "warning"
                    : "default"
              }
            >
              {indicator.latest?.period ?? freshnessLabel(freshness)}
            </Badge>
          </div>
        </div>

        {/* Primary Metric + Change + Sparkline */}
        <div className="mt-3.5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <AnimatedNumber
                value={indicator.latest?.value ?? null}
                format={(val) => formatUnitValue(val, indicator.unit)}
                className="text-[23px] font-semibold leading-7 tracking-[-0.03em] text-ink"
              />
              {deltaRaw !== null ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-xs border px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums",
                    favorable === null
                      ? "border-line bg-surface-2 text-muted"
                      : favorable
                        ? "border-positive/20 bg-positive/10 text-positive"
                        : "border-negative/20 bg-negative/10 text-negative",
                  )}
                >
                  <DeltaIcon className="h-2.5 w-2.5" strokeWidth={2.2} />
                  {isPp
                    ? `${formatNumber(Math.abs(change.absolute ?? 0), 1)} pp`
                    : formatPercent(Math.abs(change.percent ?? 0), 1)}
                </span>
              ) : null}
            </div>

            {previous ? (
              <p className="mt-1 font-mono text-[10px] text-muted">
                Prior {formatUnitValue(previous.value, indicator.unit)} ({previous.period})
              </p>
            ) : (
              <p className="mt-1 font-mono text-[10px] text-faint">Single observation in series</p>
            )}
          </div>

          <Sparkline
            data={sparkData}
            width={84}
            height={28}
            positive={favorable ?? true}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Progressive Disclosure Layer: "What does this mean?" + "View detailed data" */}
      <div className="mt-3.5 space-y-2 border-t border-line/70 pt-2.5">
        <WhatDoesThisMean compact>
          <p className="text-ink/90">{observation.simple}</p>
          {indicator.description ? (
            <p className="mt-1 text-[11px] text-muted">{indicator.description}</p>
          ) : null}
        </WhatDoesThisMean>

        {indicator.observations.length > 1 ? (
          <DetailDrawer
            label={`View detailed data (${indicator.observations.length} yrs)`}
            badge={
              <span className="advanced-only font-mono text-[9px] text-faint">
                {indicator.id}
              </span>
            }
          >
            <div className="rounded-md border border-line bg-surface-2/40 p-2.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <DataBadge status="official-reported" />
                  <span className="font-mono text-[9.5px] text-muted">
                    Series {indicator.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1 font-mono text-[9.5px] font-medium text-accent hover:underline"
                >
                  <Download className="h-2.5 w-2.5" /> CSV
                </button>
              </div>
              <div className="max-h-44 overflow-auto scrollbar-thin">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-surface-2">
                    <tr className="border-b border-line text-faint">
                      <th className="py-1 text-left font-mono text-[9px] uppercase tracking-[0.08em]">Year</th>
                      <th className="py-1 text-right font-mono text-[9px] uppercase tracking-[0.08em]">Reported Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...indicator.observations].reverse().map((obs) => (
                      <tr key={obs.period} className="border-b border-line/40 last:border-0">
                        <td className="py-1 font-mono text-muted">{obs.period}</td>
                        <td className="py-1 text-right num font-mono font-medium text-ink">
                          {formatUnitValue(obs.value, indicator.unit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DetailDrawer>
        ) : null}
      </div>
    </article>
  );
}
