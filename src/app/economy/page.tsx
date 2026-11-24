import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, Info } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Trend } from "@/components/ui/trend";
import { Sparkline } from "@/components/ui/sparkline";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { ChartCard } from "@/components/charts/chart-card";
import {
  ECONOMY_CATEGORIES,
  ECONOMIC_INDICATORS,
  getEconomyStats,
  getFreshness,
  freshnessLabel,
  getIndicator,
  getIndicatorChange,
  getPulseSeries,
  buildObservation,
} from "@/lib/data/economy";
import { getViewingMode } from "@/lib/preferences";
import { formatDate, formatNumber, formatUnitValue, formatPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "Economy",
  description:
    "Maldivian economic indicators from World Bank Open Data: output, prices, tourism, trade, reserves, debt and people — with plain-language explanations.",
};

const FOCUS = ["gdpGrowth", "inflation", "reserves", "currentAccount"];

export default async function EconomyPage() {
  const mode = await getViewingMode();
  const stats = getEconomyStats();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Economy"
        title="The economy behind the market"
        description={
          <>
            {stats.indicators} annual indicators from World Bank Open Data, grouped by topic. Every figure is shown with
            its reporting period, direction and source. Annual data lag current conditions, and some series are years old.
          </>
        }
        meta={
          <>
            <SourceLabel sourceId="worldbank" />
            <span className="h-3 w-px bg-line-strong" />
            <span>{stats.fresh} current series (within 2 years)</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>Latest year {stats.latestYear}</span>
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-4">
          <Stat
            label="Indicators"
            value={formatNumber(stats.indicators)}
            sub="Connected World Bank series"
            badge={<DataBadge status="official-reported" />}
          />
          <Stat
            label="Current (≤2 yrs)"
            value={formatNumber(stats.fresh)}
            sub="Freshness based on 2026"
          />
          <Stat
            label="Categories"
            value={formatNumber(stats.categories)}
            sub="Economic topics"
          />
          <Stat
            label="Latest year"
            value={formatNumber(stats.latestYear)}
            sub="Most recent observation"
          />
        </StatGrid>
      </div>

      <div className="mt-6">
        <Notice variant="warning" title="Annual data, published with a lag">
          These are the latest available annual observations from the World Bank. They are not monthly or real-time
          indicators and may not reflect conditions today. Where a current series is missing, the page says so rather
          than showing a stale figure.
        </Notice>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Focus</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Four indicators that frame the economy</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Full history is shown. Hover a point for the exact value and year.
            </p>
          </div>
          <Link href="/data-explorer?dataset=gdp-growth" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
            All datasets <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FOCUS.map((key) => {
            const indicator = getIndicator(key)!;
            const change = getIndicatorChange(indicator);
            const chartData = indicator.observations.map((obs) => ({ period: obs.period, value: obs.value }));
            const rising = (indicator.observations.at(-2)?.value ?? 0) <= (indicator.latest?.value ?? 0);
            return (
              <ChartCard
                key={key}
                eyebrow={indicator.category}
                title={indicator.name}
                description={
                  mode === "simple"
                    ? buildObservation(indicator).simple
                    : `${indicator.id} · ${indicator.unit}`
                }
                footer={
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[9px] text-faint">
                      {freshnessLabel(getFreshness(indicator))} · {indicator.latest?.period}
                    </span>
                    <SourceLabel sourceId="worldbank" showDate={false} />
                  </div>
                }
              >
                <div className="mb-2 flex items-end justify-between gap-2 px-1">
                  <div>
                    <span className="num font-mono text-xl font-medium tracking-[-0.02em] text-ink">
                      {formatUnitValue(indicator.latest?.value ?? null, indicator.unit)}
                    </span>
                    {change.absolute !== null ? (
                      <span className="ml-2">
                        <Trend value={change.percent} size="sm" />
                      </span>
                    ) : null}
                  </div>
                  <Sparkline data={getPulseSeries(key, 12)} width={72} height={22} className="shrink-0" positive={rising} />
                </div>
                <TimeSeriesChart
                  data={chartData as unknown as Record<string, unknown>[]}
                  xKey="period"
                  series={[{ key: "value", label: indicator.name }]}
                  kind="line"
                  format={indicator.unit === "% annual" || indicator.unit === "% of GDP" ? "percent" : indicator.unit === "US$" ? "compactCurrency" : "number"}
                  labelType="year"
                  height={200}
                  yWidth={52}
                />
              </ChartCard>
            );
          })}
        </div>
      </section>

      <div className="mt-10 space-y-10">
        {ECONOMY_CATEGORIES.map((category) => (
          <section key={category.id} id={category.id} aria-labelledby={`economy-${category.id}`}>
            <div className="mb-4 border-b border-line pb-3">
              <p className="mono-label mb-1">{category.eyebrow}</p>
              <h2 id={`economy-${category.id}`} className="text-lg font-semibold tracking-[-0.015em] text-ink">
                {category.title}
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">{category.description}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {category.keys.map((key) => {
                const indicator = getIndicator(key);
                if (!indicator) return null;
                const freshness = getFreshness(indicator);
                const change = getIndicatorChange(indicator);
                const observation = buildObservation(indicator);
                return (
                  <Link
                    key={key}
                    href={`/economy#${key}`}
                    id={key}
                    className="group rounded-md border border-line bg-surface p-4 transition-colors hover:bg-surface-2/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-medium text-ink group-hover:text-accent">{indicator.name}</h3>
                        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                          {indicator.id} · {indicator.unit}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={freshness === "fresh" ? "positive" : freshness === "lagging" ? "warning" : "default"}>
                          {freshnessLabel(freshness)}
                        </Badge>
                        <DataBadge status="official-reported" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <div className="num font-mono text-2xl font-medium tracking-[-0.025em] text-ink">
                          {formatUnitValue(indicator.latest?.value ?? null, indicator.unit)}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          {change.absolute !== null ? (
                            <>
                              <Trend value={change.percent} size="sm" />
                              <span className="font-mono text-[9.5px] text-faint">
                                {indicator.latest?.period} vs {indicator.observations.at(-2)?.period}
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-[9.5px] text-faint">{indicator.latest?.period}</span>
                          )}
                        </div>
                      </div>
                      <Sparkline data={getPulseSeries(key, 12)} width={72} height={26} className="shrink-0" />
                    </div>

                    <p className="mt-3 text-[11.5px] leading-5 text-muted">
                      {mode === "simple" ? observation.simple : observation.advanced}
                    </p>

                    {mode === "advanced" && indicator.observations.length > 1 ? (
                      <details className="mt-3 border-t border-line pt-2">
                        <summary className="cursor-pointer font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint hover:text-ink">
                          {indicator.observations.length} observations
                        </summary>
                        <div className="mt-2 max-h-48 overflow-auto scrollbar-thin">
                          <table className="w-full text-[10.5px]">
                            <thead>
                              <tr className="border-b border-line text-faint">
                                <th className="py-1 text-left font-mono uppercase tracking-[0.08em]">Period</th>
                                <th className="py-1 text-right font-mono uppercase tracking-[0.08em]">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...indicator.observations].reverse().map((obs) => (
                                <tr key={obs.period} className="border-b border-line/50 last:border-0">
                                  <td className="py-1 font-mono text-muted">{obs.period}</td>
                                  <td className="py-1 text-right num font-mono text-ink">
                                    {formatUnitValue(obs.value, indicator.unit)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            {category.unavailable?.length ? (
              <div className="mt-4 space-y-2">
                {category.unavailable.map((item) => (
                  <Notice key={item.title} variant="info" compact title={item.title}>
                    {item.description}{" "}
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      {item.source}
                    </a>
                  </Notice>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-md border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mono-label mb-1">Data principles</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">What these indicators can and cannot say</h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted">
              <li>Annual observations describe a whole year, not a point in time.</li>
              <li>Each indicator has its own latest year; “latest” is not the same year across series.</li>
              <li>Stale series are marked as reference only and are not presented as current.</li>
              <li>Missing series are listed as unavailable rather than imputed.</li>
            </ul>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SourceLabel sourceId="worldbank" />
            <Link href="/sources" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
              Sources & methodology <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
