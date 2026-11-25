import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SourceLabel } from "@/components/ui/source-label";
import { CompareTool } from "@/components/companies/compare-tool";
import { COMPANIES } from "@/lib/data/companies";
import { getCompanyComparison } from "@/lib/data/financials";
import { getCompanyMarketRows, getCompanyPriceSeries } from "@/lib/data/market";

export const metadata: Metadata = {
  title: "Compare companies",
  description:
    "Compare listed Maldivian companies side by side: relative price performance, official market capitalization, traded volume, turnover, and CMDA corporate disclosures.",
};

export default function ComparePage() {
  const comparison = getCompanyComparison();
  const marketRows = Object.fromEntries(getCompanyMarketRows().map((row) => [row.code, row]));
  const companies = comparison.map((row) => {
    const company = COMPANIES.find((entry) => entry.code === row.code);
    return {
      ...row,
      marketCap: marketRows[row.code]?.marketCap ?? row.marketCap,
      sectorGroup: company?.sectorGroup ?? "",
      monogram: company?.monogram ?? row.code.slice(0, 2),
      changePct: marketRows[row.code]?.changePct ?? row.changePct,
    };
  });

  const priceSeriesByCode = Object.fromEntries(
    COMPANIES.map((company) => [
      company.code,
      getCompanyPriceSeries(company.code, "1Y")
        .filter((pt): pt is { date: string; value: number } => pt.value !== null && pt.value > 0),
    ]),
  );

  return (
    <PageContainer>
      <div className="pt-4">
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> All companies
        </Link>
      </div>

      <PageHeader
        eyebrow="Companies · Comparison"
        title="Compare listed issuers side by side"
        description={
          <>
            Select up to four listed companies to overlay relative 12-month price performance and compare market capitalisation, trading liquidity, and regulatory reporting history.
          </>
        }
        meta={
          <>
            <SourceLabel sourceId="mse-market" />
            <span className="h-3 w-px bg-line-strong" />
            <SourceLabel sourceId="cmda-disclosures" />
            <span className="h-3 w-px bg-line-strong" />
            <span>Official Exchange & Regulatory Data</span>
          </>
        }
      />

      <div className="mt-6">
        <CompareTool companies={companies} priceSeriesByCode={priceSeriesByCode} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 surface-panel px-4 py-3">
        <span className="inline-flex items-center gap-2 text-[11.5px] text-muted">
          <Scale className="h-3.5 w-3.5 text-accent" /> Compare listed equity issuers using official regulatory and market parameters.
        </span>
        <Link href="/sources" className="text-xs font-medium text-accent hover:underline">
          Sources & methodology →
        </Link>
      </div>
    </PageContainer>
  );
}
