import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { DataTable } from "@/components/ui/data-table";
import { SOURCE_LIST } from "@/lib/data/sources";
import { getEconomyStats } from "@/lib/data/economy";
import { getDisclosureStats } from "@/lib/data/disclosures";
import { getMarketSnapshot } from "@/lib/data/market";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sources & methodology",
  description:
    "Where Maldex’s data comes from, how it is verified, what is official, what is calculated and what is illustrative sample data.",
};

export default function SourcesPage() {
  const market = getMarketSnapshot();
  const economy = getEconomyStats();
  const disclosures = getDisclosureStats();

  const sourceRows = SOURCE_LIST.map((source) => ({
    id: source.id,
    name: source.name,
    organisation: source.organisation,
    verification: source.verification,
    retrieved: source.retrievedAt,
    cadence: source.updateCadence,
    description: source.description,
    url: source.url,
  }));

  const principles = [
    {
      title: "Official data is a snapshot, not a live feed",
      body: "Market prices, MASIX, market capitalisation and trade history are retrieved from the Maldives Stock Exchange’s public CSV export. They reflect the last retrieval, not the current order book.",
    },
    {
      title: "Economic data is annual and lagged",
      body: "World Bank indicators are annual observations. Each series has its own latest year; “latest” is not the same year across series. Stale series are marked as reference only.",
    },
    {
      title: "Company financials are illustrative",
      body: "Revenue, profit, assets, EPS, dividends and every ratio derived from them are sample values created for interface development. They are not official company figures.",
    },
    {
      title: "Nominal value is a calculation",
      body: "Bond nominal issue value is units × face value, calculated by Maldex. It is not a market price and may differ from trading value.",
    },
    {
      title: "Disclosures are metadata only",
      body: "Maldex indexes disclosure headlines and official document links. It does not extract or verify the contents of those documents.",
    },
    {
      title: "No imputation",
      body: "When a verified series is unavailable, the page says so. Missing values are shown as “—”, never estimated or filled.",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sources & methodology"
        title="Where every number comes from"
        description={
          <>
            Maldex is built to make official information understandable and traceable. This page lists every source, its
            verification status, retrieval date and the principles that govern how figures are shown.
          </>
        }
        meta={
          <>
            <span>{SOURCE_LIST.length} sources</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>Market snapshot {formatDate(market.indexDate)}</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{economy.indicators} economic indicators</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{disclosures.total} disclosures</span>
          </>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="mono-label mb-1">Official</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {SOURCE_LIST.filter((source) => source.verification === "official-reported").length}
          </p>
          <p className="mt-1 text-xs text-muted">Sources published by official organisations.</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="mono-label mb-1">Calculated</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {SOURCE_LIST.filter((source) => source.verification === "calculated").length}
          </p>
          <p className="mt-1 text-xs text-muted">Metrics derived by Maldex from published inputs.</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="mono-label mb-1">Illustrative</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {SOURCE_LIST.filter((source) => source.verification === "illustrative").length}
          </p>
          <p className="mt-1 text-xs text-muted">Sample data for interface development only.</p>
        </div>
      </div>

      <div className="mt-6">
        <Notice variant="warning" title="Company financials are illustrative">
          Revenue, profit, assets, EPS, dividends and every ratio derived from them are sample values. They are not
          official company figures and must not be used for investment decisions.
        </Notice>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Registry</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">All sources</h2>
          </div>
          <span className="text-[10px] text-faint">Click a source to open the original</span>
        </div>
        <DataTable
          data={sourceRows as unknown as Record<string, unknown>[]}
          idKey="id"
          initialSort={{ key: "name", direction: "asc" }}
          columns={[
            { key: "name", header: "Source", type: "link", hrefTemplate: "{url}" },
            { key: "organisation", header: "Organisation" },
            { key: "verification", header: "Status", type: "badge", toneMap: { "official-reported": "accent", calculated: "accent", illustrative: "warning" } },
            { key: "retrieved", header: "Retrieved", type: "date" },
            { key: "cadence", header: "Cadence", hideBelow: "lg" },
            { key: "description", header: "Description", hideBelow: "md" },
          ]}
          searchKeys={["name", "organisation", "description", "verification"]}
          searchPlaceholder="Search sources"
          csvFilename="maldex-sources.csv"
          caption="Source registry for the Maldex data layer."
          pageSize={12}
          hideSearch={false}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-faint">
          <ShieldCheck className="h-3 w-3" /> Verification status: official-reported, calculated, illustrative.
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3">
          <p className="mono-label mb-1">Principles</p>
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">How Maldex handles information</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title} className="rounded-md border border-line bg-surface p-4">
              <h3 className="text-[12.5px] font-medium text-ink">{principle.title}</h3>
              <p className="mt-1.5 text-[11.5px] leading-5 text-muted">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mono-label mb-1">Open data</p>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Explore the datasets directly</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            Data Explorer lets you filter, chart and export every dataset, with source metadata attached.
          </p>
        </div>
        <Link href="/data-explorer" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Open Data Explorer <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}
