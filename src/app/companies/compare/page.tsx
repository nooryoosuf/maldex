import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { CompareTool } from "@/components/companies/compare-tool";
import { COMPANIES } from "@/lib/data/companies";
import { getCompanyComparison } from "@/lib/data/financials";
import { getCompanyMarketRows } from "@/lib/data/market";

export const metadata: Metadata = {
  title: "Compare companies",
  description:
    "Compare listed Maldivian companies side by side: official market values with illustrative revenue, margins, returns, EPS, dividends and valuation ratios.",
};

export default function ComparePage() {
  const comparison = getCompanyComparison();
  const marketRows = Object.fromEntries(getCompanyMarketRows().map((row) => [row.code, row]));
  const companies = comparison.map((row) => {
    const company = COMPANIES.find((entry) => entry.code === row.code);
    return {
      ...row,
      marketCap: marketRows[row.code]?.marketCap ?? null,
      sectorGroup: company?.sectorGroup ?? "",
      monogram: company?.monogram ?? row.code.slice(0, 2),
      changePct: marketRows[row.code]?.changePct ?? null,
    };
  });

  return (
    <PageContainer>
      <div className="pt-4">
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> All companies
        </Link>
      </div>

      <PageHeader
        eyebrow="Companies · Comparison"
        title="Compare companies on the same basis"
        description={
          <>
            Select up to four listed companies. Official market data and illustrative financials are kept separate so
            that a real price is never blended with a sample profit figure without a label.
          </>
        }
        meta={
          <>
            <SourceLabel sourceId="mse-market" />
            <SourceLabel sourceId="maldex-financial-model" showDate={false} />
            <span className="h-3 w-px bg-line-strong" />
            <span>Not investment advice</span>
          </>
        }
      />

      <div className="mt-6">
        <Notice variant="demo" compact title="How to read this comparison">
          Prices and market capitalisation come from the Maldives Stock Exchange. Revenue, profit, assets, EPS and DPS are
          illustrative sample values. P/E and dividend yield are calculated by combining an official price with an
          illustrative per-share figure, and are labelled as calculated.
        </Notice>
      </div>

      <div className="mt-6">
        <CompareTool companies={companies} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3">
        <span className="inline-flex items-center gap-2 text-[11px] text-muted">
          <Scale className="h-3.5 w-3.5 text-accent" /> Comparing companies of different sizes and business models has
          limits.
        </span>
        <Link href="/sources" className="text-[11px] font-medium text-accent hover:underline">
          Methodology →
        </Link>
      </div>
    </PageContainer>
  );
}
