import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { MaturityTimeline } from "@/components/charts/maturity-timeline";
import { BondCalculator } from "@/components/bonds/bond-calculator";
import { WhatDoesThisMean } from "@/components/ui/disclosure-panel";
import {
  BONDS,
  getMaturityCalendar,
  getReturnComparison,
  getUpcomingMaturities,
  nominalIssueValue,
} from "@/lib/data/bonds";
import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bonds & Sukuk",
  description:
    "Published terms for bonds and Sukuk listed on the Maldives Stock Exchange: maturity timeline, coupon rates, nominal values and a cash-flow calculator.",
};

export default function BondsPage() {
  const calendar = getMaturityCalendar();
  const upcoming = getUpcomingMaturities("2026-11-24", 30);
  const returns = getReturnComparison();
  const totalNominal = BONDS.reduce((sum, bond) => sum + nominalIssueValue(bond), 0);
  const withRate = BONDS.filter((bond) => bond.returnRate !== null);
  const averageRate =
    withRate.length > 0 ? withRate.reduce((sum, bond) => sum + (bond.returnRate ?? 0), 0) / withRate.length : null;
  const sukuk = BONDS.filter((bond) => bond.instrumentType === "Sukuk").length;
  const government = BONDS.filter((bond) => bond.issuerShort === "Government").length;

  const issuerTypeSlices = [
    {
      name: "Government Bonds",
      value: BONDS.filter((b) => b.issuerShort === "Government").reduce((s, b) => s + nominalIssueValue(b), 0),
      color: "rgb(var(--chart-1))",
    },
    {
      name: "Corporate Bonds",
      value: BONDS.filter((b) => b.issuerShort !== "Government" && b.instrumentType !== "Sukuk").reduce(
        (s, b) => s + nominalIssueValue(b),
        0,
      ),
      color: "rgb(var(--chart-2))",
    },
    {
      name: "Listed Sukuk",
      value: BONDS.filter((b) => b.instrumentType === "Sukuk").reduce((s, b) => s + nominalIssueValue(b), 0),
      color: "rgb(var(--chart-3))",
    },
  ];

  const couponChartRows = returns.map((bond) => ({
    code: bond.code,
    issuer: bond.issuerShort,
    rate: bond.returnRate ?? 0,
  }));

  const maturityRows = calendar.map((year) => ({
    year: year.year,
    count: year.count,
    nominalValue: year.nominalValue,
    issuers: [...new Set(year.instruments.map((bond) => bond.issuerShort))].join(", "),
    earliest: year.instruments[0]?.maturityDate ?? "",
  }));

  const instrumentRows = BONDS.map((bond) => ({
    code: bond.code,
    issuer: bond.issuerShort,
    type: bond.instrumentType,
    rate: bond.returnRate,
    frequency: bond.returnFrequency,
    faceValue: bond.faceValue,
    units: bond.issueSizeUnits,
    nominalValue: nominalIssueValue(bond),
    issued: bond.issueDate,
    maturity: bond.maturityDate,
  }));

  const returnRows = returns.map((bond) => ({
    code: bond.code,
    issuer: bond.issuerShort,
    rate: bond.returnRate,
    frequency: bond.returnFrequency,
    maturity: bond.maturityDate,
    type: bond.instrumentType,
    nominalValue: nominalIssueValue(bond),
  }));

  const upcomingRows = upcoming.map((bond) => ({
    code: bond.code,
    issuer: bond.issuerShort,
    maturity: bond.maturityDate,
    rate: bond.returnRate,
    nominalValue: nominalIssueValue(bond),
    frequency: bond.returnFrequency,
  }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Bonds & Sukuk"
        title="Fixed-income instruments, in their own terms"
        description={
          <>
            Published contractual terms for {BONDS.length} sovereign bonds, corporate bonds, and Sukuk listed on the
            Maldives Stock Exchange—featuring interactive maturity timelines, coupon comparisons, and cash-flow modelling.
          </>
        }
        actions={
          <Link
            href="/data-explorer?dataset=bonds"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Bond dataset <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
        meta={
          <>
            <SourceLabel sourceId="mse-listed" />
            <span className="h-3 w-px bg-line-strong" />
            <Badge variant="outline">{BONDS.length} listed instruments</Badge>
            <span className="h-3 w-px bg-line-strong" />
            <span>Contractual terms · Nominal values calculated</span>
          </>
        }
      />

      {/* Level 1 — Key Fixed-Income Metrics */}
      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            label="Instruments"
            value={formatNumber(BONDS.length)}
            sub={`${government} sovereign · ${sukuk} Sukuk`}
            badge={<ShieldCheck className="h-3 w-3 text-faint" />}
          />
          <Stat
            label="Nominal issued"
            value={formatMvr(totalNominal, { compact: true })}
            sub="Units × face value"
            trendLabel="Contractual par value"
          />
          <Stat
            label="Published rates"
            value={formatNumber(withRate.length)}
            sub={`${formatNumber(BONDS.length - withRate.length)} unrated in directory`}
          />
          <Stat
            label="Average coupon"
            value={formatPercent(averageRate, 2)}
            sub="Simple mean of published rates"
          />
          <Stat
            label="Earliest maturity"
            value={formatDate(BONDS.map((bond) => bond.maturityDate).sort()[0])}
            sub="Nearest redemption"
          />
          <Stat
            label="Longest maturity"
            value={formatDate(BONDS.map((bond) => bond.maturityDate).sort().at(-1) ?? "")}
            sub="Longest listed tenor"
          />
        </StatGrid>
      </div>

      {/* Level 2 — Interactive Maturity Timeline (2027–2035) */}
      <section id="maturities" className="mt-8 scroll-mt-20">
        <ChartCard
          variant="featured"
          eyebrow="Redemption Wall · 2027–2035"
          title="Bonds & Sukuk Maturity Timeline"
          description="Stacked nominal principal coming due by calendar year across Sovereign bonds, Corporate bonds, and Sukuk. Select any year below to inspect the maturing instruments."
          explanation="A maturity timeline shows when issuers must repay principal to bondholders. Large clusters in a single year represent refinancing milestones for government and corporate borrowers."
          tableData={maturityRows as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "year", label: "Year" },
            { key: "count", label: "Instruments", format: "number", digits: 0 },
            { key: "nominalValue", label: "Nominal Value (MVR)", format: "compactCurrency" },
          ]}
          csvFilename="maldex-bond-maturity-timeline.csv"
          expandable
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-faint">{upcoming.length} instruments mature within 30 months</span>
              <SourceLabel sourceId="mse-listed" />
            </div>
          }
        >
          <MaturityTimeline bonds={BONDS} />
        </ChartCard>
      </section>

      {/* Level 2 — Coupon Rate Comparison & Issuer Composition */}
      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <ChartCard
          eyebrow="Coupon Rates"
          title="Published Return Rates by Instrument"
          description="Annualised contractual coupon / profit rate (%) across listed instruments with a published rate."
          explanation="Published coupon rates reflect what the issuer pays on nominal face value—not secondary-market yield-to-maturity, because Maldex does not yet connect a live bond price feed."
          tableData={couponChartRows as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "code", label: "Instrument" },
            { key: "issuer", label: "Issuer" },
            { key: "rate", label: "Rate (%)", format: "percent", digits: 2 },
          ]}
          csvFilename="maldex-bond-coupon-rates.csv"
          expandable
        >
          <TimeSeriesChart
            data={couponChartRows as unknown as Record<string, unknown>[]}
            xKey="code"
            series={[{ key: "rate", label: "Published Rate (% p.a.)", color: "rgb(var(--chart-2))" }]}
            kind="bar"
            format="percent"
            labelType="category"
            height={230}
            yWidth={44}
            digits={2}
            showLegend={false}
          />
        </ChartCard>

        <ChartCard
          eyebrow="Nominal Mix"
          title="Issuance by Instrument Category"
          description="Share of total nominal listed fixed-income value across Sovereign debt, Corporate bonds, and Sukuk."
        >
          <DonutChart
            data={issuerTypeSlices}
            format="compactCurrency"
            centerLabel="Nominal"
            height={220}
          />
        </ChartCard>
      </section>

      {/* Interactive Cash-Flow Calculator */}
      <section className="mt-8">
        <BondCalculator />
      </section>

      {/* Level 3 — Reference Tables */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Reference Directory</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Full terms & schedules</h2>
          </div>
          <WhatDoesThisMean title="Why coupon rate differs from investor yield" compact>
            A bond’s published rate tells you what the issuer pays on par value. Actual investor return depends on purchase price in secondary trading, which is not connected here.
          </WhatDoesThisMean>
        </div>

        <Tabs
          ariaLabel="Bond tables"
          items={[
            {
              id: "all",
              label: "All instruments",
              count: BONDS.length,
              content: (
                <DataTable
                  data={instrumentRows as unknown as Record<string, unknown>[]}
                  idKey="code"
                  initialSort={{ key: "nominalValue", direction: "desc" }}
                  columns={[
                    { key: "code", header: "Code", type: "mono" },
                    { key: "issuer", header: "Issuer" },
                    { key: "type", header: "Type", hideBelow: "md" },
                    { key: "rate", header: "Rate", type: "percent", align: "right", digits: 2 },
                    { key: "frequency", header: "Frequency", hideBelow: "lg" },
                    { key: "faceValue", header: "Face value", type: "currency", align: "right", digits: 0, hideBelow: "md" },
                    { key: "units", header: "Units", type: "number", align: "right", hideBelow: "lg" },
                    { key: "nominalValue", header: "Nominal value", type: "currency", align: "right", compact: true },
                    { key: "issued", header: "Issued", type: "date", align: "right", hideBelow: "lg" },
                    { key: "maturity", header: "Maturity", type: "date", align: "right" },
                  ]}
                  searchKeys={["code", "issuer", "type"]}
                  searchPlaceholder="Search code, issuer or type"
                  csvFilename="maldex-bonds-terms.csv"
                  caption="Published terms from the MSE listed-securities directory."
                  pageSize={12}
                />
              ),
            },
            {
              id: "upcoming",
              label: "Upcoming (30m)",
              count: upcoming.length,
              content: (
                <DataTable
                  data={upcomingRows as unknown as Record<string, unknown>[]}
                  idKey="code"
                  initialSort={{ key: "maturity", direction: "asc" }}
                  columns={[
                    { key: "code", header: "Instrument", type: "mono" },
                    { key: "issuer", header: "Issuer" },
                    { key: "maturity", header: "Maturity", type: "date" },
                    { key: "rate", header: "Rate", type: "percent", align: "right", digits: 2 },
                    { key: "frequency", header: "Frequency", hideBelow: "md" },
                    { key: "nominalValue", header: "Nominal value", type: "currency", align: "right", compact: true },
                  ]}
                  searchKeys={["code", "issuer"]}
                  searchPlaceholder="Search instrument or issuer"
                  csvFilename="maldex-upcoming-maturities.csv"
                  caption="Instruments maturing within 30 months."
                  pageSize={12}
                />
              ),
            },
            {
              id: "returns",
              label: "Highest rates",
              count: returns.length,
              content: (
                <DataTable
                  data={returnRows as unknown as Record<string, unknown>[]}
                  idKey="code"
                  initialSort={{ key: "rate", direction: "desc" }}
                  columns={[
                    { key: "code", header: "Instrument", type: "mono" },
                    { key: "issuer", header: "Issuer" },
                    { key: "rate", header: "Published rate", type: "percent", align: "right", digits: 2 },
                    { key: "frequency", header: "Frequency", hideBelow: "md" },
                    { key: "type", header: "Type", hideBelow: "lg" },
                    { key: "maturity", header: "Maturity", type: "date", align: "right" },
                    { key: "nominalValue", header: "Nominal value", type: "currency", align: "right", compact: true, hideBelow: "sm" },
                  ]}
                  searchKeys={["code", "issuer"]}
                  searchPlaceholder="Search instrument or issuer"
                  csvFilename="maldex-bond-rates.csv"
                  caption="Instruments with a published return rate, sorted by rate."
                  pageSize={12}
                />
              ),
            },
            {
              id: "calendar",
              label: "By year",
              count: calendar.length,
              content: (
                <DataTable
                  data={maturityRows as unknown as Record<string, unknown>[]}
                  idKey="year"
                  initialSort={{ key: "year", direction: "asc" }}
                  columns={[
                    { key: "year", header: "Maturity year", type: "mono" },
                    { key: "count", header: "Instruments", type: "number", align: "right" },
                    { key: "nominalValue", header: "Nominal value", type: "currency", align: "right", compact: true },
                    { key: "issuers", header: "Issuers", hideBelow: "md" },
                    { key: "earliest", header: "Earliest date", type: "date", align: "right", hideBelow: "lg" },
                  ]}
                  searchKeys={["issuers"]}
                  searchPlaceholder="Search issuer"
                  csvFilename="maldex-bond-maturity-calendar.csv"
                  caption="Bond and Sukuk maturities grouped by year."
                  pageSize={10}
                />
              ),
            },
          ]}
        />
      </section>
    </PageContainer>
  );
}
