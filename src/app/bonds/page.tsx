import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarRange, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { BondCalculator } from "@/components/bonds/bond-calculator";
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
    "Published terms for bonds and Sukuk listed on the Maldives Stock Exchange: rates, maturity calendar, nominal values and a cash-flow calculator.",
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
            Published terms for {BONDS.length} bonds and Sukuk listed on the Maldives Stock Exchange. These are
            contractual terms, not market prices: Maldex does not currently connect a live bond-price series, so every
            figure here is an official published term or a clearly labelled calculation from it.
          </>
        }
        actions={
          <Link
            href="/data-explorer?dataset=bonds"
            className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Bond dataset
          </Link>
        }
        meta={
          <>
            <SourceLabel sourceId="mse-listed" />
            <span className="h-3 w-px bg-line-strong" />
            <Badge variant="outline">{BONDS.length} instruments</Badge>
            <span className="h-3 w-px bg-line-strong" />
            <span>Terms retrieved 24 Nov 2026</span>
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            label="Instruments"
            value={formatNumber(BONDS.length)}
            sub={`${government} government · ${sukuk} Sukuk`}
            badge={<ShieldCheck className="h-3 w-3 text-faint" />}
          />
          <Stat
            label="Nominal value"
            value={formatMvr(totalNominal, { compact: true })}
            sub="Sum of units × face value"
            trendLabel="Calculated, not market value"
          />
          <Stat
            label="With published rate"
            value={formatNumber(withRate.length)}
            sub={`${formatNumber(BONDS.length - withRate.length)} rate not published`}
            trendLabel="Coupon-paying instruments"
          />
          <Stat
            label="Average coupon"
            value={formatPercent(averageRate, 2)}
            sub="Among coupon-paying instruments"
            trendLabel="Simple average, not weighted"
          />
          <Stat
            label="Earliest maturity"
            value={formatDate(BONDS.map((bond) => bond.maturityDate).sort()[0])}
            sub="Among all instruments"
          />
          <Stat
            label="Latest maturity"
            value={formatDate(BONDS.map((bond) => bond.maturityDate).sort().at(-1) ?? "")}
            sub="Among all instruments"
          />
        </StatGrid>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel sourceId="mse-listed" />
          <span className="text-[10px] text-faint">
            Nominal value is a Maldex calculation of units × face value. It is not a market price and may differ from
            trading value.
          </span>
        </div>
      </div>

      <div className="mt-8">
        <Notice variant="warning" title="No live bond-price series is connected yet">
          The exchange publishes bond terms and occasional trade summaries, but Maldex does not yet integrate a live or
          historical bond-price series. Treat the rates and maturities below as contractual terms, not valuations.
        </Notice>
      </div>

      <div className="mt-8">
        <BondCalculator />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Maturity calendar</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">When instruments come due</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Grouped by maturity year. Nominal value is units × face value.
            </p>
          </div>
          <span className="text-[10px] text-faint">{upcoming.length} instruments mature within 30 months</span>
        </div>

        <Tabs
          ariaLabel="Bond tables"
          items={[
            {
              id: "calendar",
              label: "Maturity calendar",
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
            {
              id: "upcoming",
              label: "Upcoming",
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
                  caption="Instruments maturing within 30 months of the snapshot date."
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
              id: "all",
              label: "All instruments",
              count: BONDS.length,
              content: (
                <DataTable
                  data={instrumentRows as unknown as Record<string, unknown>[]}
                  idKey="code"
                  initialSort={{ key: "issuer", direction: "asc" }}
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
          ]}
        />
      </section>

      <section className="mt-8 grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mono-label mb-1">Understanding</p>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">A bond’s rate is not its return</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            The published rate tells you what the issuer pays on face value. What an investor actually earns depends on
            the price paid, which is not connected here. Sukuk returns are structured rather than interest-based, but are
            shown with the same rate and frequency convention.
          </p>
        </div>
        <Link href="/sources" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Methodology <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}
