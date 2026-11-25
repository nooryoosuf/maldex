"use client";

import { useMemo } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SourceLabel } from "@/components/ui/source-label";
import { Trend } from "@/components/ui/trend";
import { Badge } from "@/components/ui/badge";
import { getIndicator, getIndicatorChange } from "@/lib/data/economy";
import { formatUnitValue } from "@/lib/format";

function mergeIndicatorsByYear(keys: string[]): Record<string, unknown>[] {
  const yearMap = new Map<string, Record<string, unknown>>();
  for (const key of keys) {
    const ind = getIndicator(key);
    if (!ind) continue;
    for (const obs of ind.observations) {
      const entry = yearMap.get(obs.period) ?? { period: obs.period };
      entry[key] = obs.value;
      yearMap.set(obs.period, entry);
    }
  }
  return [...yearMap.values()].sort((a, b) => String(a.period).localeCompare(String(b.period)));
}

export function MacroChartsGrid() {
  const gdp = getIndicator("gdpGrowth");
  const inflation = getIndicator("inflation");
  const arrivals = getIndicator("touristArrivals");
  const govDebt = getIndicator("govDebt");

  const fiscalComparison = useMemo(
    () => mergeIndicatorsByYear(["taxRevenue", "govExpense"]).slice(-14),
    [],
  );

  const tradeComparison = useMemo(
    () => mergeIndicatorsByYear(["exports", "imports"]).slice(-16),
    [],
  );

  const gdpChange = gdp ? getIndicatorChange(gdp) : null;
  const infChange = inflation ? getIndicatorChange(inflation) : null;
  const arrChange = arrivals ? getIndicatorChange(arrivals) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* 1. Real GDP Growth — Line Chart with Zero Baseline */}
      {gdp ? (
        <ChartCard
          eyebrow="Output · Line Series"
          title="Real GDP Growth"
          description="Annual percentage change in inflation-adjusted economic output."
          explanation="Real GDP growth measures how fast the Maldivian economy is expanding after stripping out inflation. Notice the sharp contraction in 2020 when borders closed, followed by the rapid tourism-led rebound."
          tableData={gdp.observations as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "period", label: "Year" },
            { key: "value", label: "GDP Growth (%)", format: "percent", digits: 1 },
          ]}
          csvFilename="maldex-gdp-growth.csv"
          expandable
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] text-faint">Latest: {gdp.latest?.period}</span>
              <SourceLabel sourceId="worldbank" showDate={false} />
            </div>
          }
        >
          <div className="mb-2 flex items-baseline gap-2 px-1">
            <span className="num font-mono text-xl font-semibold tracking-[-0.025em] text-ink">
              {formatUnitValue(gdp.latest?.value ?? null, gdp.unit)}
            </span>
            {gdpChange?.percent !== null && gdpChange?.percent !== undefined ? (
              <Trend value={gdpChange.percent} size="sm" />
            ) : null}
          </div>
          <TimeSeriesChart
            data={gdp.observations as unknown as Record<string, unknown>[]}
            xKey="period"
            series={[{ key: "value", label: "Real GDP Growth (%)", color: "rgb(var(--chart-1))" }]}
            kind="line"
            format="percent"
            labelType="year"
            zeroLine
            height={215}
            yWidth={46}
            digits={1}
          />
        </ChartCard>
      ) : null}

      {/* 2. Inflation — Line Chart */}
      {inflation ? (
        <ChartCard
          eyebrow="Prices · Line Series"
          title="Consumer Price Inflation"
          description="Annual percentage change in the Consumer Price Index (CPI)."
          explanation="Inflation measures how quickly everyday consumer prices are rising or falling. Values above zero indicate rising living costs; negative values represent mild annual deflation."
          tableData={inflation.observations as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "period", label: "Year" },
            { key: "value", label: "Inflation (%)", format: "percent", digits: 1 },
          ]}
          csvFilename="maldex-inflation.csv"
          expandable
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] text-faint">Latest: {inflation.latest?.period}</span>
              <SourceLabel sourceId="worldbank" showDate={false} />
            </div>
          }
        >
          <div className="mb-2 flex items-baseline gap-2 px-1">
            <span className="num font-mono text-xl font-semibold tracking-[-0.025em] text-ink">
              {formatUnitValue(inflation.latest?.value ?? null, inflation.unit)}
            </span>
            {infChange?.percent !== null && infChange?.percent !== undefined ? (
              <Trend value={infChange.percent} size="sm" invert />
            ) : null}
          </div>
          <TimeSeriesChart
            data={inflation.observations as unknown as Record<string, unknown>[]}
            xKey="period"
            series={[{ key: "value", label: "Annual CPI Inflation (%)", color: "rgb(var(--chart-3))" }]}
            kind="line"
            format="percent"
            labelType="year"
            zeroLine
            height={215}
            yWidth={46}
            digits={1}
          />
        </ChartCard>
      ) : null}

      {/* 3. Annual Tourism Arrivals — Bar Chart */}
      {arrivals ? (
        <ChartCard
          eyebrow="Visitor Economy · Bar Series"
          title="International Tourist Arrivals"
          description="Annual international visitor arrivals recorded across the Maldives."
          explanation="Each bar represents total annual visitor arrivals. Tourism drives foreign exchange earnings, resort employment, and government tax receipts (TGST and Green Tax)."
          tableData={arrivals.observations as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "period", label: "Year" },
            { key: "value", label: "Arrivals", format: "number", digits: 0 },
          ]}
          csvFilename="maldex-annual-tourism-arrivals.csv"
          expandable
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] text-faint">Latest: {arrivals.latest?.period}</span>
              <SourceLabel sourceId="worldbank" showDate={false} />
            </div>
          }
        >
          <div className="mb-2 flex items-baseline gap-2 px-1">
            <span className="num font-mono text-xl font-semibold tracking-[-0.025em] text-ink">
              {formatUnitValue(arrivals.latest?.value ?? null, arrivals.unit, { compact: true })}
            </span>
            {arrChange?.percent !== null && arrChange?.percent !== undefined ? (
              <Trend value={arrChange.percent} size="sm" />
            ) : null}
          </div>
          <TimeSeriesChart
            data={arrivals.observations.slice(-18) as unknown as Record<string, unknown>[]}
            xKey="period"
            series={[{ key: "value", label: "Visitor Arrivals", color: "rgb(var(--chart-5))" }]}
            kind="bar"
            format="number"
            labelType="year"
            height={215}
            yWidth={46}
          />
        </ChartCard>
      ) : null}

      {/* 4. Tax Revenue vs Government Expense — Grouped Bar Chart */}
      {fiscalComparison.length ? (
        <ChartCard
          eyebrow="Fiscal · Grouped Bar Comparison"
          title="Tax Revenue vs. Government Expense"
          description="Central government tax revenue compared side-by-side with operating expense (% of GDP)."
          explanation="Comparing tax revenue against government spending as a percentage of GDP illustrates the structural fiscal gap that must be financed through domestic T-bills, bonds, or external borrowing."
          tableData={fiscalComparison}
          tableColumns={[
            { key: "period", label: "Year" },
            { key: "taxRevenue", label: "Tax Revenue (% GDP)", format: "percent", digits: 1 },
            { key: "govExpense", label: "Gov Expense (% GDP)", format: "percent", digits: 1 },
          ]}
          csvFilename="maldex-revenue-vs-expense.csv"
          expandable
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] text-faint">Share of GDP (%) · Click legend to filter</span>
              <SourceLabel sourceId="worldbank" showDate={false} />
            </div>
          }
        >
          <TimeSeriesChart
            data={fiscalComparison}
            xKey="period"
            series={[
              { key: "taxRevenue", label: "Tax Revenue (% GDP)", color: "rgb(var(--chart-2))" },
              { key: "govExpense", label: "Gov Expense (% GDP)", color: "rgb(var(--chart-6))" },
            ]}
            kind="bar"
            format="percent"
            labelType="year"
            height={235}
            yWidth={46}
            digits={1}
          />
        </ChartCard>
      ) : null}

      {/* 5. Exports vs Imports — Comparative Bar Chart */}
      {tradeComparison.length ? (
        <ChartCard
          eyebrow="External Balance · Comparative Bars"
          title="Exports vs. Imports of Goods & Services"
          description="Side-by-side comparison of total exports (including tourism services) and imports (% of GDP)."
          explanation="As an island nation importing fuel, food, and construction materials while exporting high-value tourism services, both exports and imports represent unusually large shares of Maldivian GDP."
          tableData={tradeComparison}
          tableColumns={[
            { key: "period", label: "Year" },
            { key: "exports", label: "Exports (% GDP)", format: "percent", digits: 1 },
            { key: "imports", label: "Imports (% GDP)", format: "percent", digits: 1 },
          ]}
          csvFilename="maldex-exports-vs-imports.csv"
          expandable
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] text-faint">Goods & services (% of GDP)</span>
              <SourceLabel sourceId="worldbank" showDate={false} />
            </div>
          }
        >
          <TimeSeriesChart
            data={tradeComparison}
            xKey="period"
            series={[
              { key: "exports", label: "Exports (% GDP)", color: "rgb(var(--chart-1))" },
              { key: "imports", label: "Imports (% GDP)", color: "rgb(var(--chart-4))" },
            ]}
            kind="bar"
            format="percent"
            labelType="year"
            height={235}
            yWidth={46}
            digits={1}
          />
        </ChartCard>
      ) : null}

      {/* 6. Historical Central Government Debt — Area Chart */}
      {govDebt && govDebt.observations.length > 1 ? (
        <ChartCard
          eyebrow="Public Debt · Historical Area Series"
          title="Central Government Debt (% of GDP)"
          description="Historical World Bank central government debt observations retained for long-run context."
          explanation="Shows recorded central government debt relative to economic output in the connected World Bank archive. Because the World Bank series stops earlier than current fiscal years, always treat this chart as historical reference only."
          tableData={govDebt.observations as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "period", label: "Year" },
            { key: "value", label: "Gov Debt (% GDP)", format: "percent", digits: 1 },
          ]}
          csvFilename="maldex-historical-gov-debt.csv"
          expandable
          footer={
            <div className="flex items-center justify-between">
              <Badge variant="warning">Historical reference through {govDebt.latest?.period}</Badge>
              <SourceLabel sourceId="worldbank" showDate={false} />
            </div>
          }
        >
          <TimeSeriesChart
            data={govDebt.observations as unknown as Record<string, unknown>[]}
            xKey="period"
            series={[{ key: "value", label: "Central Gov Debt (% GDP)", color: "rgb(var(--chart-4))" }]}
            kind="area"
            format="percent"
            labelType="year"
            height={235}
            yWidth={46}
            digits={1}
          />
        </ChartCard>
      ) : null}
    </div>
  );
}
