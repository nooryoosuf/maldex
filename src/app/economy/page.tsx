import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, DollarSign, ShieldAlert, TrendingUp, Building2 } from "lucide-react";
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
import { CompanyMark } from "@/components/ui/company-mark";
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
import {
  MMA_EXCHANGE_RATES,
  MMA_GROSS_RESERVES,
  MMA_MONETARY_AGGREGATES,
  MMA_MONTHLY_TOURISM,
  MMA_TREASURY_BILLS,
  MMA_USABLE_RESERVES,
  getLatestGrossReserves,
  getLatestUsableReserves,
  getReserveSeries,
} from "@/lib/data/mma";

import { formatDate, formatNumber, formatUnitValue, formatPercent, formatCompact } from "@/lib/format";

export const metadata: Metadata = {
  title: "Economy & Monetary Authority",
  description:
    "Maldivian macroeconomic intelligence and Maldives Monetary Authority (MMA) central bank statistics: official reserves, usable reserves, currency peg, T-bill yield curve, and World Bank indicators.",
};

const FOCUS = ["gdpGrowth", "inflation", "reserves", "currentAccount"];

export default async function EconomyPage() {
  const stats = getEconomyStats();
  const latestGross = getLatestGrossReserves();
  const latestUsable = getLatestUsableReserves();
  const reserveChartData = getReserveSeries();
  const latestMonetary = MMA_MONETARY_AGGREGATES.at(-1)!;
  const latestTourism = MMA_MONTHLY_TOURISM.at(-1)!;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Macro & Monetary Intelligence"
        title="Economic fundamentals & Central Bank indicators"
        description={
          <>
            Integrated macroeconomic indicators combining Maldives Monetary Authority (MMA) central bank statistics—foreign reserves, currency peg, Treasury bills, and money aggregates—with official World Bank national accounts.
          </>
        }
        meta={
          <>
            <SourceLabel sourceId="mma-statistics" />
            <span className="h-3 w-px bg-line-strong" />
            <SourceLabel sourceId="worldbank" />
            <span className="h-3 w-px bg-line-strong" />
            <span>Usable Reserves: US$ {latestUsable.value}M</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>USD Peg: 15.42 MVR</span>
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-4">
          <Stat
            label="Gross Reserves"
            value={`US$ ${latestGross.value}M`}
            sub={`Official reserves (${latestGross.period})`}
            badge={<DataBadge status="official-reported" />}
          />
          <Stat
            label="Usable Reserves"
            value={`US$ ${latestUsable.value}M`}
            sub={`Buffer for essential imports (${latestUsable.period})`}
            badge={<DataBadge status="official-reported" />}
          />
          <Stat
            label="USD Exchange Peg"
            value="15.42 MVR"
            sub="Official MMA fixed peg regime"
            badge={<DataBadge status="official-reported" />}
          />
          <Stat
            label="364-Day T-Bill"
            value="4.60%"
            sub="Government Treasury Bill auction yield"
            badge={<DataBadge status="official-reported" />}
          />
        </StatGrid>
      </div>

      {/* MMA Central Bank Intelligence Section */}
      <section className="mt-10 rounded-lg border border-line bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <CompanyMark code="MMA" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">
                  Maldives Monetary Authority (MMA) Analytics
                </h2>
                <Badge variant="accent">Central Bank</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Official monetary policy, foreign reserve buffers, and sovereign debt yield benchmarks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SourceLabel sourceId="mma-statistics" />
            <Link
              href="/data-explorer?dataset=mma-reserves"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
            >
              Reserve Explorer <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* MMA Reserves & T-Bills Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Reserves Trajectory */}
          <div className="rounded-md border border-line bg-surface-2/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mono-label text-[10px]">Official Buffer</p>
                <h3 className="text-sm font-semibold text-ink">Gross vs. Usable Reserves</h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-accent">
                  US$ {latestUsable.value}M Usable
                </span>
                <p className="font-mono text-[9px] text-faint">of US$ {latestGross.value}M Gross</p>
              </div>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Usable reserves represent foreign currency assets immediately available for essential import financing and foreign debt service, excluding short-term foreign currency swap liabilities.
            </p>
            <div className="mt-4">
              <TimeSeriesChart
                data={reserveChartData as unknown as Record<string, unknown>[]}
                xKey="period"
                series={[
                  { key: "gross", label: "Gross Reserves (US$ m)" },
                  { key: "usable", label: "Usable Reserves (US$ m)" },
                ]}
                kind="line"
                format="number"
                labelType="date"
                height={200}
                yWidth={46}
              />
            </div>
          </div>

          {/* Treasury Bills Yield Curve */}
          <div className="rounded-md border border-line bg-surface-2/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mono-label text-[10px]">Sovereign Yield Curve</p>
                <h3 className="text-sm font-semibold text-ink">MMA Government T-Bills</h3>
              </div>
              <Badge variant="default">Conventional & Islamic</Badge>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Government Treasury bills issued through weekly MMA auctions to manage state cash flow and establish short-term money market benchmark rates.
            </p>
            <div className="mt-4 divide-y divide-line rounded border border-line bg-surface">
              {MMA_TREASURY_BILLS.map((tbill) => (
                <div key={tbill.tenor} className="flex items-center justify-between px-3 py-2.5">
                  <div>
                    <span className="font-mono text-xs font-medium text-ink">{tbill.tenor}</span>
                    <span className="ml-2 font-mono text-[10px] text-faint">{tbill.days} days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="num font-mono text-sm font-semibold text-accent">
                      {tbill.rate.toFixed(2)}%
                    </span>
                    <span className="font-mono text-[10px] text-faint">{tbill.currency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded bg-surface p-2.5 border border-line">
              <div className="text-[11px] text-muted">
                <span className="font-medium text-ink">Broad Money (M2):</span>{" "}
                <span className="font-mono font-semibold text-ink">
                  MVR {formatCompact(latestMonetary.broadMoneyM2, 1)}M
                </span>
              </div>
              <div className="text-[11px] text-muted">
                <span className="font-medium text-ink">Private Credit:</span>{" "}
                <span className="font-mono font-semibold text-ink">
                  MVR {formatCompact(latestMonetary.privateCredit, 1)}M
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Peg & Foreign Exchange Table */}
        <div className="mt-6 border-t border-line pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-semibold text-ink">Official Central Bank Exchange Rates</h4>
              <p className="text-[11px] text-muted">Indicative mid rates published by MMA against Maldivian Rufiyaa (MVR)</p>
            </div>
            <Badge variant="outline">USD Peg: 15.42 MVR</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {MMA_EXCHANGE_RATES.map((rate) => (
              <div key={rate.currency} className="rounded border border-line bg-surface p-2.5 text-center">
                <p className="font-mono text-[10px] font-semibold text-faint">{rate.currency}</p>
                <p className="num mt-1 font-mono text-sm font-semibold text-ink">
                  {rate.rate.toFixed(rate.currency === "INR" || rate.currency === "JPY" ? 4 : 2)}
                </p>
                <p className="mt-0.5 text-[9px] text-muted truncate">{rate.regime}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Bank Economic Focus */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">World Bank Series</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">National Accounts & Development</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Official annual series from World Bank Open Data. Hover any point for exact values.
            </p>
          </div>
          <Link href="/data-explorer" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
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
                  <>
                    <span className="simple-only">{buildObservation(indicator).simple}</span>
                    <span className="advanced-only">{indicator.id} · {indicator.unit}</span>
                  </>
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

      {/* Indicator Categories */}
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

                    <p className="simple-only mt-3 text-[11.5px] leading-5 text-muted">{observation.simple}</p>
                    <p className="advanced-only mt-3 text-[11.5px] leading-5 text-muted">{observation.advanced}</p>

                    <div className="advanced-only">
                      {indicator.observations.length > 1 ? (
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
                    </div>
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
            <p className="mono-label mb-1">Official Methodology</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Central Bank & Multilateral Verification</h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted">
              <li>MMA reserve figures reflect official central bank balance sheets and monthly statistical releases.</li>
              <li>Foreign currency peg is maintained at 15.42 MVR per USD under MMA monetary regulations.</li>
              <li>World Bank observations provide standardized historical cross-country comparisons.</li>
              <li>All economic datasets are strictly sourced from verified regulatory disclosures.</li>
            </ul>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SourceLabel sourceId="mma-statistics" />
            <Link href="/sources" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
              All sources & metadata <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
