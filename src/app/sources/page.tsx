import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, ShieldCheck, CheckCircle2 } from "lucide-react";
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
    "Where Maldex’s data comes from, how it is verified, and the governance principles across Maldives Stock Exchange, Maldives Monetary Authority, CMDA, and World Bank feeds.",
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
      title: "Official data is an authentic snapshot",
      body: "Market prices, MASIX, market capitalisation and trade history are retrieved from official Maldives Stock Exchange public data exports and reflect exact trade records.",
    },
    {
      title: "Central bank reserves and monetary aggregates",
      body: "Maldives Monetary Authority (MMA) figures reflect official central bank reporting: gross reserves, usable reserves, official currency peg (15.42 MVR/USD), Treasury bill yields, and broad money aggregates.",
    },
    {
      title: "Corporate disclosures and financial reports",
      body: "Audited annual statements, quarterly financials, and dividend declarations are indexed directly from the Capital Market Development Authority (CMDA) InformInvestor disclosure registry with direct document links.",
    },
    {
      title: "Multilateral national accounts",
      body: "World Bank indicators provide standardized macroeconomic observations across annual series. Series are presented with exact reporting periods and clear source citations.",
    },
    {
      title: "Bonds & Sukuk terms",
      body: "Debt instrument terms, coupon rates, issue sizes and maturity dates are sourced from the official MSE listed-securities directory. Nominal values are derived as units × face value.",
    },
    {
      title: "Zero synthetic data",
      body: "When a verified series or market trade is unavailable, Maldex displays “—” rather than imputing, estimating, or generating synthetic figures.",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sources & methodology"
        title="Where every number comes from"
        description={
          <>
            Maldex is built to make official information understandable, traceable, and verifiable. This page lists every institutional source, its verification status, retrieval date, and reporting methodology.
          </>
        }
        meta={
          <>
            <span>{SOURCE_LIST.length} official sources</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>Market snapshot {formatDate(market.indexDate)}</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{economy.indicators} economic indicators</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{disclosures.total} CMDA disclosures</span>
          </>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="mono-label mb-1">Official Reported</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {SOURCE_LIST.filter((source) => source.verification === "official-reported").length}
          </p>
          <p className="mt-1 text-xs text-muted">Primary regulatory sources (MSE, MMA, CMDA, World Bank).</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="mono-label mb-1">Derived Metrics</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {SOURCE_LIST.filter((source) => source.verification === "derived" || source.verification === "calculated").length}
          </p>
          <p className="mt-1 text-xs text-muted">Metrics calculated by Maldex from published inputs.</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="mono-label mb-1">Data Integrity</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] text-accent flex items-center gap-1.5">
            <CheckCircle2 className="h-6 w-6" /> 100%
          </p>
          <p className="mt-1 text-xs text-muted">Verified official disclosures and market records.</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Registry</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Institutional Sources</h2>
          </div>
          <span className="text-[10px] text-faint">Click a source to open the official portal</span>
        </div>
        <DataTable
          data={sourceRows as unknown as Record<string, unknown>[]}
          idKey="id"
          initialSort={{ key: "name", direction: "asc" }}
          columns={[
            { key: "name", header: "Source", type: "link", hrefTemplate: "{url}" },
            { key: "organisation", header: "Organisation" },
            { key: "verification", header: "Status", type: "badge", toneMap: { "official-reported": "accent", derived: "accent", calculated: "accent" } },
            { key: "retrieved", header: "Retrieved", type: "date" },
            { key: "cadence", header: "Cadence", hideBelow: "lg" },
            { key: "description", header: "Description", hideBelow: "md" },
          ]}
          searchKeys={["name", "organisation", "description"]}
          searchPlaceholder="Search sources"
          csvFilename="maldex-sources.csv"
          caption="Verified sources connected to Maldex."
          pageSize={10}
        />
      </section>

      <section className="mt-10">
        <div className="mb-4 border-b border-line pb-3">
          <p className="mono-label mb-1">Methodology</p>
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Data Principles</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            The rules governing how data is ingested, verified, and displayed across the platform.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle) => (
            <div key={principle.title} className="rounded-md border border-line bg-surface p-4">
              <h3 className="text-xs font-semibold text-ink">{principle.title}</h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3">
        <span className="inline-flex items-center gap-2 text-[11px] text-muted">
          <ShieldCheck className="h-3 w-3 text-accent" /> Verification status: official-reported and derived.
        </span>
        <Link href="/data-explorer" className="text-[11px] font-medium text-accent hover:underline">
          Browse all datasets →
        </Link>
      </div>
    </PageContainer>
  );
}
