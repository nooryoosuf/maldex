import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Stat, StatGrid } from "@/components/ui/stat";
import { SourceLabel } from "@/components/ui/source-label";
import { DataExplorer } from "@/components/data-explorer/explorer";
import { DATASETS, DATA_EXPLORER_STATS } from "@/lib/data/datasets";

export const metadata: Metadata = {
  title: "Data Explorer",
  description:
    "Browse, filter, chart and export the datasets behind Maldex: market data, central bank reserves, exchange rates, economic indicators, disclosures, and listed equities.",
};

export default function DataExplorerPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Data Explorer"
        title="The data behind every page"
        description={
          <>
            Browse {DATA_EXPLORER_STATS.datasets} verified datasets, filter rows, chart a series and export to CSV. Source and
            verification status are provided for every dataset.
          </>
        }
        meta={
          <>
            <span>{formatNumber(DATA_EXPLORER_STATS.rows)} rows across {DATA_EXPLORER_STATS.datasets} datasets</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{DATA_EXPLORER_STATS.sources} official sources</span>
            <span className="h-3 w-px bg-line-strong" />
            <SourceLabel sourceId="mse-market" showDate={false} />
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-4">
          <Stat label="Datasets" value={DATA_EXPLORER_STATS.datasets} sub="Connected datasets" badge={<Database className="h-3 w-3 text-faint" />} />
          <Stat label="Rows" value={formatNumber(DATA_EXPLORER_STATS.rows)} sub="Across all datasets" />
          <Stat label="Sources" value={DATA_EXPLORER_STATS.sources} sub="Official regulatory feeds" />
          <Stat label="Export" value="CSV" sub="Filtered rows, UTF-8" />
        </StatGrid>
      </div>

      <div className="mt-8">
        <DataExplorer datasets={DATASETS} />
      </div>

      <section className="mt-8 grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mono-label mb-1">Methodology</p>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Read the caveats before you export</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            Official exchange data is a periodic snapshot. Economic indicators include monthly statistics from the Maldives Monetary Authority (MMA) and annual indicators from the World Bank.
          </p>
        </div>
        <Link href="/sources" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Sources & methodology <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}
