import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/ui/sparkline";
import { SourceLabel } from "@/components/ui/source-label";
import { Trend } from "@/components/ui/trend";
import {
  ECONOMY_PULSE_KEYS,
  buildObservation,
  getIndicator,
  getIndicatorChange,
  getPulseSeries,
} from "@/lib/data/economy";
import { formatNumber, formatPercent, formatUnitValue } from "@/lib/format";
import type { ViewingMode } from "@/lib/types";
import { cn } from "@/lib/cn";

const CONTEXT: Record<string, string> = {
  gdpGrowth: "A growing economy can create jobs and support household incomes.",
  inflation: "When prices rise faster than incomes, households can buy less.",
  reserves: "Reserves help pay for imports and support the currency peg.",
  currentAccount: "A smaller deficit means less pressure to borrow from abroad.",
  population: "Population growth affects demand for housing, services and jobs.",
};

function ChangeIndicator({ keyName }: { keyName: string }) {
  const indicator = getIndicator(keyName);
  if (!indicator) return null;
  const change = getIndicatorChange(indicator);
  if (change.absolute === null) return null;
  const invert = keyName === "inflation";
  const isPp = ["% annual", "% of GDP", "% of labour force"].includes(indicator.unit);
  if (isPp) {
    const good = invert ? change.absolute < 0 : change.absolute > 0;
    return (
      <span
        className={cn(
          "inline-flex items-center font-mono text-[10.5px]",
          change.absolute === 0 ? "text-muted" : good ? "text-positive" : "text-negative",
        )}
      >
        {change.absolute > 0 ? "+" : change.absolute < 0 ? "−" : ""}
        {formatNumber(Math.abs(change.absolute), 1)} pp
      </span>
    );
  }
  return <Trend value={change.percent} size="sm" invert={invert} />;
}

export function EconomicPulse({ mode }: { mode: ViewingMode }) {
  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface" aria-labelledby="economic-pulse-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="mono-label mb-1">Economic pulse</p>
          <h2 id="economic-pulse-heading" className="text-lg font-semibold tracking-[-0.015em] text-ink">
            The economy behind the market
          </h2>
          <p className="mt-1 max-w-xl text-[11px] leading-5 text-muted">
            Latest available annual observations. Each figure is shown with its reporting period, direction and source.
          </p>
        </div>
        <Link href="/economy" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
          All indicators <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-line">
        {ECONOMY_PULSE_KEYS.map((key) => {
          const indicator = getIndicator(key);
          if (!indicator?.latest) return null;
          const observation = buildObservation(indicator);
          const previous = indicator.observations.at(-2);
          const rising = previous ? indicator.latest.value >= previous.value : true;
          const sparklinePositive = key === "inflation" ? !rising : rising;
          return (
            <Link
              key={key}
              href={`/economy#${key}`}
              className="group grid gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/40 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.55fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-medium text-ink group-hover:text-accent">{indicator.name}</span>
                  <Badge variant="outline" className="normal-case tracking-[0.03em]">{indicator.latest.period}</Badge>
                </div>
                <p className="mt-1 text-[10.5px] leading-4 text-faint">{CONTEXT[key]}</p>
              </div>

              <div className="min-w-0">
                <p className="simple-only text-xs leading-5 text-muted">{observation.simple}</p>
                <p className="advanced-only text-xs leading-5 text-muted">{observation.advanced}</p>
                <p className="advanced-only mt-1 font-mono text-[9px] leading-4 text-faint">
                  {indicator.id} · {indicator.unit}
                  {previous ? ` · prior ${formatUnitValue(previous.value, indicator.unit)} (${previous.period})` : ""}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-right">
                  <div className="num font-mono text-[17px] font-medium leading-6 tracking-[-0.02em] text-ink">
                    {formatUnitValue(indicator.latest.value, indicator.unit)}
                  </div>
                  <div className="mt-0.5 flex justify-end">
                    <ChangeIndicator keyName={key} />
                  </div>
                </div>
                <Sparkline data={getPulseSeries(key, 10)} width={64} height={24} className="shrink-0" positive={sparklinePositive} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-4 py-2.5">
        <span className="text-[10px] text-faint">Annual data · latest available year shown · may lag current conditions</span>
        <SourceLabel sourceId="worldbank" />
      </div>
    </section>
  );
}
