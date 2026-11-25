import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, FileText, GitCompareArrows } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Stat, StatGrid } from "@/components/ui/stat";
import { SourceLabel } from "@/components/ui/source-label";
import { CompanyDirectory } from "@/components/companies/company-directory";
import { MarketComposition } from "@/components/market/market-composition";
import { COMPANIES } from "@/lib/data/companies";
import { getCompanyComparison } from "@/lib/data/financials";
import { getCompanyMarketRows, getMarketSnapshot, getSharesOutstanding } from "@/lib/data/market";
import { formatMvr, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Tracked companies listed on the Maldives Stock Exchange: market prices, market capitalisation, sector composition, and links to official CMDA corporate filings.",
};

export default function CompaniesPage() {
  const snapshot = getMarketSnapshot();
  const marketRows = getCompanyMarketRows();
  const comparison = getCompanyComparison();
  const comparisonByCode = Object.fromEntries(comparison.map((row) => [row.code, row]));

  const rows = marketRows.map((row) => {
    const comp = comparisonByCode[row.code];
    return {
      ...row,
      sectorGroup: COMPANIES.find((company) => company.code === row.code)?.sectorGroup ?? "",
      shares: comp?.shares ?? getSharesOutstanding(row.code),
      volume: comp?.volume ?? 0,
      value: comp?.value ?? 0,
      filingsCount: comp?.filingsCount ?? 0,
    };
  });

  const withCap = rows.filter((row) => row.marketCap !== null);
  const totalCap = withCap.reduce((sum, row) => sum + (row.marketCap ?? 0), 0);
  const largest = [...withCap].sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))[0];
  const largestShare = largest && totalCap ? ((largest.marketCap ?? 0) / totalCap) * 100 : null;
  const totalFilings = rows.reduce((acc, row) => acc + row.filingsCount, 0);

  const treemapItems = withCap.map((r) => ({
    code: r.code,
    name: r.company,
    sector: r.sector,
    slug: r.slug,
    marketCap: r.marketCap ?? 0,
    price: r.price,
    changePct: r.changePct,
  }));

  const sectorTotals = COMPANIES.reduce<Record<string, number>>((acc, company) => {
    const row = rows.find((entry) => entry.code === company.code);
    acc[company.sectorGroup] = (acc[company.sectorGroup] ?? 0) + (row?.marketCap ?? 0);
    return acc;
  }, {});
  const sectorSlices = Object.entries(sectorTotals)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Companies"
        title="Listed issuers on the Maldives Stock Exchange"
        description={
          <>
            Nine official listed issuers spanning banking, telecommunications, trading, transport, tourism, and insurance.
            Inspect official MSE prices and capitalisation alongside audited CMDA corporate filings.
          </>
        }
        actions={
          <Link
            href="/companies/compare"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <GitCompareArrows className="h-3.5 w-3.5 text-accent" /> Compare issuers
          </Link>
        }
        meta={
          <>
            <SourceLabel sourceId="mse-market" />
            <span className="h-3 w-px bg-line-strong" />
            <SourceLabel sourceId="cmda-disclosures" />
            <span className="h-3 w-px bg-line-strong" />
            <span>{formatNumber(snapshot.indexDate ? marketRows.filter((row) => row.price !== null).length : 0)} with published prices</span>
          </>
        }
      />

      {/* Level 1 — Issuer Summary Strip */}
      <div className="mt-6">
        <StatGrid columns="grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Tracked issuers"
            value={formatNumber(COMPANIES.length)}
            sub="MSE listed equity issuers"
            badge={<Building2 className="h-3 w-3 text-faint" />}
          />
          <Stat
            label="Combined market cap"
            value={formatMvr(totalCap, { compact: true })}
            sub="Published per-security values"
          />
          <Stat
            label="Largest issuer"
            value={largest?.code ?? "—"}
            sub={largest ? largest.company : "—"}
            trend={largestShare}
            trendLabel="Share of total market cap"
            href={largest ? `/companies/${largest.slug}` : undefined}
          />
          <Stat
            label="CMDA Filings"
            value={formatNumber(totalFilings)}
            sub="Audited statements, reports & notices"
            badge={<FileText className="h-3 w-3 text-faint" />}
            href="/disclosures"
          />
        </StatGrid>
      </div>

      {/* Level 2 — Interactive Sector & Issuer Visual Breakdown */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <MarketComposition items={treemapItems} sectorSlices={sectorSlices} defaultView="sectors" />

        <section className="surface-panel flex flex-col justify-between p-5">
          <div>
            <p className="mono-label mb-1">Side-by-Side Analysis</p>
            <h2 className="text-base font-semibold tracking-[-0.015em] text-ink">
              Compare up to four companies
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Overlay historical price performance, compare market capitalisation and trading liquidity, and examine CMDA disclosure activity on a consistent basis.
            </p>
            <ul className="mt-4 space-y-2 border-t border-line/70 pt-3.5 text-[11.5px] leading-5 text-muted">
              <li className="flex gap-2">
                <span className="font-mono text-[9.5px] font-semibold text-accent">01</span>
                <span>Normalized multi-company price performance overlay</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[9.5px] font-semibold text-accent">02</span>
                <span>Official MSE market cap, volume & turnover comparison</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[9.5px] font-semibold text-accent">03</span>
                <span>Direct links to audited CMDA annual & quarterly filings</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
            <Link
              href="/companies/compare"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              Launch comparison workbench <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/sources" className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-ink">
              Methodology <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </div>

      {/* Level 3 — Filterable Company Directory */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Issuer Directory</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">All listed companies</h2>
          </div>
          <span className="font-mono text-[10px] text-faint">Click any issuer to inspect trading history & CMDA filings</span>
        </div>
        <CompanyDirectory rows={rows} />
      </section>
    </PageContainer>
  );
}
