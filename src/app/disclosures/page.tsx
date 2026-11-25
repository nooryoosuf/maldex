import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { DisclosureTable } from "@/components/disclosures/disclosure-table";
import { WhatDoesThisMean } from "@/components/ui/disclosure-panel";
import { getDisclosures, getDisclosureStats } from "@/lib/data/disclosures";

export const metadata: Metadata = {
  title: "Disclosures",
  description:
    "Corporate disclosures published through CMDA InformInvestor: announcements, financial reports, dividends, meetings and governance updates.",
};

export default function DisclosuresPage() {
  const stats = getDisclosureStats();
  const disclosures = getDisclosures();
  const rows = disclosures.map((item) => ({
    id: item.id,
    date: item.publishedAt,
    company: item.company,
    code: item.code ?? "",
    type: item.type,
    title: item.title,
    source: item.sourceUrl,
  }));

  const yearCounts = disclosures.reduce<Record<string, number>>((acc, item) => {
    const year = item.publishedAt.slice(0, 4);
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});
  const yearSeries = Object.entries(yearCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }));

  const typeCounts = disclosures.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
  const typeSlices = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const latestYear = yearSeries.at(-1)?.year ?? "";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Disclosures"
        title="What listed issuers have officially filed"
        description={
          <>
            Regulatory filings, audited financial reports, dividend declarations, and governance announcements indexed
            from CMDA InformInvestor with direct official PDF links.
          </>
        }
        meta={
          <>
            <SourceLabel sourceId="cmda-disclosures" />
            <span className="h-3 w-px bg-line-strong" />
            <span>{stats.total} indexed filings</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{stats.currentYear} in {latestYear}</span>
          </>
        }
      />

      {/* Level 1 — Filing Summary Strip */}
      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-4">
          <Stat
            label="Total disclosures"
            value={stats.total}
            sub="Indexed from CMDA"
            badge={<FileText className="h-3 w-3 text-faint" />}
          />
          <Stat
            label={`Published in ${latestYear}`}
            value={stats.currentYear}
            sub="Latest calendar year"
            sparkline={yearSeries.map((y) => y.count)}
          />
          <Stat label="Reporting issuers" value={stats.companies} sub="Distinct listed companies" />
          <Stat label="Financial reports" value={stats.reports} sub="Audited annual & quarterly" />
        </StatGrid>
      </div>

      {/* Level 2 — Disclosure Activity Visualisations */}
      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartCard
          eyebrow="Reporting Cadence"
          title="Disclosures Published by Year"
          description="Annual volume of corporate filings published via CMDA InformInvestor."
          tableData={yearSeries as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "year", label: "Year" },
            { key: "count", label: "Disclosures", format: "number", digits: 0 },
          ]}
          csvFilename="maldex-disclosures-by-year.csv"
        >
          <TimeSeriesChart
            data={yearSeries as unknown as Record<string, unknown>[]}
            xKey="year"
            series={[{ key: "count", label: "Filings published", color: "rgb(var(--chart-1))" }]}
            kind="bar"
            format="number"
            labelType="year"
            height={210}
            yWidth={40}
            showLegend={false}
          />
        </ChartCard>

        <ChartCard
          eyebrow="Filing Mix"
          title="Disclosures by Category"
          description="Breakdown of indexed announcements across financial reports, dividends, meetings, and governance."
        >
          <DonutChart data={typeSlices} format="number" centerLabel="Filings" height={210} />
        </ChartCard>
      </section>

      {/* Level 3 — Filterable Disclosure Registry */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Registry</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">All indexed disclosures</h2>
          </div>
          <WhatDoesThisMean title="Metadata vs. official document" compact>
            Maldex indexes disclosure headlines, dates, and official PDF links without extracting or modifying document numbers. Always open the linked CMDA document to read the audited figures and notes.
          </WhatDoesThisMean>
        </div>
        <DisclosureTable rows={rows} />
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-3 surface-panel px-4 py-3">
        <span className="text-xs text-muted">
          Every link opens the original document hosted by the Capital Market Development Authority (CMDA).
        </span>
        <Link href="/sources" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Methodology <ArrowUpRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}
