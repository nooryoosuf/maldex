import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { CompanyMark } from "@/components/ui/company-mark";
import { IndicatorCard } from "@/components/economy/indicator-card";
import { MacroChartsGrid } from "@/components/economy/macro-charts";
import { WhatDoesThisMean } from "@/components/ui/disclosure-panel";
import {
  ECONOMY_CATEGORIES,
  WORLD_BANK_META,
  getEconomyStats,
  getIndicator,
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
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "Economy & Monetary Authority",
  description:
    "Maldivian macroeconomic intelligence and Maldives Monetary Authority (MMA) central bank statistics: official reserves, usable reserves, currency peg, T-bill yield curve, and World Bank indicators.",
};

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
            Integrated macroeconomic intelligence combining Maldives Monetary Authority (MMA) central bank series—foreign
            reserves, currency peg, Treasury bills, and money supply—with standardized World Bank national accounts.
          </>
        }
        actions={
          <Link
            href="/data-explorer?dataset=mma-reserves"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Explore datasets <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
        meta={
          <>
            <SourceLabel sourceId="mma-statistics" />
            <span className="h-3 w-px bg-line-strong" />
            <SourceLabel sourceId="worldbank" />
            <span className="h-3 w-px bg-line-strong" />
            <span>{stats.indicators} World Bank series · {stats.fresh} current (≤2 yrs)</span>
          </>
        }
      />

      {/* Sticky Section Navigation Bar */}
      <nav
        aria-label="Economy section navigation"
        className="sticky top-14 z-30 -mx-4 border-b border-line bg-bg/88 px-4 py-2 backdrop-blur-md sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6"
      >
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          <a
            href="#mma"
            className="shrink-0 rounded-md border border-accent/25 bg-accent-soft px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:border-accent/50"
          >
            MMA Central Bank
          </a>
          <a
            href="#charts"
            className="shrink-0 rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Macro Charts
          </a>
          {ECONOMY_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="shrink-0 rounded-md border border-transparent px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.07em] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {cat.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Level 1 — Headline Monetary & Macro Strip */}
      <div className="mt-6">
        <StatGrid columns="grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Gross Reserves"
            value={`US$ ${latestGross.value}M`}
            sub={`Official MMA assets (${latestGross.period})`}
            sparkline={MMA_GROSS_RESERVES.map((r) => r.value)}
            badge={<DataBadge status="official-reported" />}
            href="#mma"
          />
          <Stat
            label="Usable Reserves"
            value={`US$ ${latestUsable.value}M`}
            sub={`Net import buffer (${latestUsable.period})`}
            sparkline={MMA_USABLE_RESERVES.map((r) => r.value)}
            badge={<DataBadge status="official-reported" />}
            href="#mma"
          />
          <Stat
            label="USD Exchange Peg"
            value="15.42 MVR"
            sub="Fixed central bank peg band"
            trendLabel="Maintained by MMA"
            badge={<Badge variant="outline">Pegged</Badge>}
          />
          <Stat
            label="364-Day T-Bill"
            value="4.60%"
            sub="Sovereign auction benchmark yield"
            sparkline={MMA_TREASURY_BILLS.map((t) => t.rate)}
            badge={<DataBadge status="official-reported" />}
          />
        </StatGrid>
      </div>

      {/* Level 2 — Maldives Monetary Authority (MMA) Visual Workbench */}
      <section id="mma" className="mt-10 scroll-mt-28">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CompanyMark code="MMA" size="md" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">
                  Maldives Monetary Authority (MMA)
                </h2>
                <Badge variant="accent">Central Bank</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Foreign currency buffers, monthly tourism inflows, money supply, and sovereign Treasury bill benchmarks.
              </p>
            </div>
          </div>
          <SourceLabel sourceId="mma-statistics" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* 1. Gross vs Usable Reserves */}
          <ChartCard
            eyebrow="Official Reserve Assets"
            title="Gross vs. Usable Foreign Reserves"
            description="Central bank foreign currency assets vs. net usable liquidity after short-term foreign currency drains."
            explanation="Usable reserves measure how much foreign currency the central bank has immediately available to finance essential imports (fuel, food, medicine) and external debt service, after subtracting predetermined short-term swaps and liabilities."
            tableData={reserveChartData as unknown as Record<string, unknown>[]}
            tableColumns={[
              { key: "period", label: "Period" },
              { key: "gross", label: "Gross Reserves (US$ m)", format: "usdMillions", digits: 1 },
              { key: "usable", label: "Usable Reserves (US$ m)", format: "usdMillions", digits: 1 },
            ]}
            csvFilename="maldex-mma-reserves.csv"
            expandable
          >
            <TimeSeriesChart
              data={reserveChartData as unknown as Record<string, unknown>[]}
              xKey="period"
              series={[
                { key: "gross", label: "Gross Reserves (US$ m)", color: "rgb(var(--chart-1))" },
                { key: "usable", label: "Usable Reserves (US$ m)", color: "rgb(var(--chart-2))" },
              ]}
              kind="area"
              format="usdMillions"
              labelType="category"
              height={230}
              yWidth={52}
              digits={1}
            />
          </ChartCard>

          {/* 2. Monthly Tourism Arrivals & Occupancy Mixed Chart */}
          <ChartCard
            eyebrow="High-Frequency Visitor Inflows"
            title="Monthly Tourist Arrivals & Bed Occupancy"
            description="Monthly visitor arrivals (bars, left axis) paired with resort & hotel occupancy rate (line, right axis)."
            explanation="Unlike annual national accounts, MMA publishes monthly tourism statistics that track foreign-exchange-earning visitor inflows in near real time. Peak European winter months lift both arrivals and resort bed occupancy above 75%."
            tableData={MMA_MONTHLY_TOURISM as unknown as Record<string, unknown>[]}
            tableColumns={[
              { key: "period", label: "Month" },
              { key: "arrivals", label: "Arrivals", format: "number", digits: 0 },
              { key: "occupancyRate", label: "Occupancy (%)", format: "percent", digits: 1 },
            ]}
            csvFilename="maldex-mma-monthly-tourism.csv"
            expandable
          >
            <div className="mb-2 flex flex-wrap items-baseline gap-2 px-1">
              <span className="num font-mono text-lg font-semibold text-ink">
                {formatNumber(latestTourism.arrivals)} arrivals
              </span>
              <Badge variant="positive">{formatPercent(latestTourism.occupancyRate, 1)} occupancy · {latestTourism.period}</Badge>
            </div>
            <TimeSeriesChart
              data={MMA_MONTHLY_TOURISM as unknown as Record<string, unknown>[]}
              xKey="period"
              series={[
                {
                  key: "arrivals",
                  label: "Monthly Arrivals",
                  type: "bar",
                  yAxisId: "left",
                  format: "number",
                  color: "rgb(var(--chart-5))",
                },
                {
                  key: "occupancyRate",
                  label: "Bed Occupancy (%)",
                  type: "line",
                  yAxisId: "right",
                  format: "percent",
                  color: "rgb(var(--chart-3))",
                },
              ]}
              kind="mixed"
              format="number"
              rightFormat="percent"
              labelType="category"
              height={205}
              yWidth={46}
              rightYWidth={40}
            />
          </ChartCard>

          {/* 3. Broad Money M2 & Domestic Credit */}
          <ChartCard
            eyebrow="Monetary Aggregates"
            title="Broad Money (M2) & Domestic Credit"
            description="System liquidity (Broad Money M2), total domestic credit, and credit extended to the private sector (MVR millions)."
            explanation="When domestic credit grows much faster than private-sector credit, the difference reflects commercial bank lending to the government and state-owned enterprises (primarily via Treasury bills and bonds)."
            tableData={MMA_MONETARY_AGGREGATES as unknown as Record<string, unknown>[]}
            tableColumns={[
              { key: "period", label: "Period" },
              { key: "broadMoneyM2", label: "Broad Money M2 (MVR m)", format: "number", digits: 0 },
              { key: "domesticCredit", label: "Domestic Credit (MVR m)", format: "number", digits: 0 },
              { key: "privateCredit", label: "Private Credit (MVR m)", format: "number", digits: 0 },
            ]}
            csvFilename="maldex-mma-monetary-aggregates.csv"
            expandable
          >
            <div className="mb-2 flex flex-wrap items-center gap-4 px-1 text-xs text-muted">
              <span>
                M2: <strong className="num font-mono text-ink">MVR {formatCompact(latestMonetary.broadMoneyM2, 1)}M</strong>
              </span>
              <span>
                Private Credit: <strong className="num font-mono text-ink">MVR {formatCompact(latestMonetary.privateCredit, 1)}M</strong>
              </span>
            </div>
            <TimeSeriesChart
              data={MMA_MONETARY_AGGREGATES as unknown as Record<string, unknown>[]}
              xKey="period"
              series={[
                { key: "domesticCredit", label: "Domestic Credit", color: "rgb(var(--chart-1))" },
                { key: "broadMoneyM2", label: "Broad Money (M2)", color: "rgb(var(--chart-2))" },
                { key: "privateCredit", label: "Private Credit", color: "rgb(var(--chart-4))" },
              ]}
              kind="line"
              format="number"
              labelType="category"
              height={205}
              yWidth={50}
            />
          </ChartCard>

          {/* 4. Sovereign Treasury Bill Yield Curve & FX Rates */}
          <ChartCard
            eyebrow="Sovereign Money Market"
            title="Government Treasury Bill Yield Curve"
            description="MMA auction rates across 28-day to 364-day MVR Treasury bill maturities."
            explanation="Government Treasury bills set the domestic short-term benchmark return for banks and institutional investors in the Maldives. Longer maturities compensate holders with higher annualised yields."
            tableData={MMA_TREASURY_BILLS as unknown as Record<string, unknown>[]}
            tableColumns={[
              { key: "tenor", label: "Tenor" },
              { key: "days", label: "Days", format: "number", digits: 0 },
              { key: "rate", label: "Yield (% p.a.)", format: "percent", digits: 2 },
            ]}
            csvFilename="maldex-mma-tbills.csv"
          >
            <TimeSeriesChart
              data={MMA_TREASURY_BILLS as unknown as Record<string, unknown>[]}
              xKey="tenor"
              series={[{ key: "rate", label: "Auction Yield (% p.a.)", color: "rgb(var(--chart-2))" }]}
              kind="bar"
              format="percent"
              labelType="category"
              height={165}
              yWidth={44}
              digits={2}
              showLegend={false}
            />

            {/* Compact Official FX Rates Strip */}
            <div className="mt-3 border-t border-line/70 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="mono-label text-[9.5px]">Official MMA Indicative FX Rates (MVR)</span>
                <Badge variant="outline">USD Peg 15.42</Badge>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                {MMA_EXCHANGE_RATES.map((rate) => (
                  <div key={rate.currency} className="rounded-md border border-line bg-surface-2/45 px-2 py-1.5 text-center">
                    <p className="font-mono text-[9.5px] font-semibold text-muted">{rate.currency}</p>
                    <p className="num mt-0.5 font-mono text-xs font-semibold text-ink">
                      {rate.rate.toFixed(rate.currency === "INR" || rate.currency === "JPY" ? 4 : 2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* Level 2 — Structural Macroeconomic Visualisations */}
      <section id="charts" className="mt-12 scroll-mt-28">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
          <div>
            <p className="mono-label mb-1">Structural Trends · World Bank</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">
              Key Macroeconomic Comparisons
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Each indicator group is paired with a chart form matched to its underlying structure—lines for growth & inflation, bars for arrivals, and grouped bars for fiscal & trade balances.
            </p>
          </div>
          <Link href="/data-explorer?dataset=gdp-growth" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            Open in Data Explorer <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <MacroChartsGrid />
      </section>

      {/* Level 3 — Progressive Disclosure Indicator Directory */}
      <div className="mt-12 space-y-10">
        {ECONOMY_CATEGORIES.map((category) => (
          <section key={category.id} id={category.id} aria-labelledby={`economy-${category.id}`} className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-2.5">
              <div>
                <p className="mono-label mb-0.5">{category.eyebrow}</p>
                <h2 id={`economy-${category.id}`} className="text-base font-semibold tracking-[-0.015em] text-ink">
                  {category.title}
                </h2>
                <p className="mt-0.5 max-w-3xl text-xs leading-5 text-muted">{category.description}</p>
              </div>
              <Badge variant="outline">{category.keys.length} series</Badge>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              {category.keys.map((key) => {
                const indicator = getIndicator(key);
                if (!indicator) return null;
                return (
                  <IndicatorCard
                    key={key}
                    indicator={indicator}
                    updatedAt={WORLD_BANK_META.retrievedAt}
                  />
                );
              })}
            </div>

            {category.unavailable?.length ? (
              <div className="mt-3 space-y-2">
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

      {/* Compact Progressive Methodology Note */}
      <section className="mt-12 surface-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mono-label mb-1">Data Governance</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">
              How Central Bank & World Bank series complement each other
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <SourceLabel sourceId="mma-statistics" showDate={false} />
            <SourceLabel sourceId="worldbank" showDate={false} />
            <Link href="/sources" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Methodology <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <WhatDoesThisMean title="Read caveats on reporting lags, units, and staleness">
            <ul className="list-disc space-y-1 pl-4">
              <li>MMA series provide high-frequency monthly and quarterly monetary, reserve, and tourism readings.</li>
              <li>World Bank observations represent standardized calendar-year national accounts and may lag current conditions by 1–2 years.</li>
              <li>Each series displays its exact latest reporting year; stale historical series are flagged rather than extrapolated.</li>
            </ul>
          </WhatDoesThisMean>
        </div>
      </section>
    </PageContainer>
  );
}
