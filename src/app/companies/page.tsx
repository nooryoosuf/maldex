import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, GitCompareArrows, FileText } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Stat, StatGrid } from "@/components/ui/stat";
import { SourceLabel } from "@/components/ui/source-label";
import { CompanyDirectory } from "@/components/companies/company-directory";
import { COMPANIES } from "@/lib/data/companies";
import { getCompanyComparison } from "@/lib/data/financials";
import { getCompanyMarketRows, getMarketSnapshot, getSharesOutstanding } from "@/lib/data/market";
import { formatMvr, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Tracked companies listed on the Maldives Stock Exchange: market prices, market capitalisation, sector context, and links to official CMDA corporate filings.",
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

  const sectorTotals = COMPANIES.reduce<Record<string, number>>((acc, company) => {
    const row = rows.find((entry) => entry.code === company.code);
    acc[company.sectorGroup] = (acc[company.sectorGroup] ?? 0) + (row?.marketCap ?? 0);
    return acc;
  }, {});
  const sectorRanked = Object.entries(sectorTotals)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxSector = sectorRanked[0]?.[1] ?? 1;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Companies"
        title="Listed issuers on the Maldives Stock Exchange"
        description={
          <>
            Nine official listed issuers spanning banking, telecommunications, trading, transport, tourism, and insurance.
            Market prices, volume, and market capitalisation are sourced directly from official MSE trade records, paired with official CMDA corporate filings.
          </>
        }
        actions={
          <Link
            href="/companies/compare"
            className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <GitCompareArrows className="h-3.5 w-3.5" /> Compare companies
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

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Tracked issuers"
            value={formatNumber(COMPANIES.length)}
            sub="Listed equity issuers with market data"
            badge={<Building2 className="h-3 w-3 text-faint" />}
          />
          <Stat
            label="Combined market cap"
            value={formatMvr(totalCap, { compact: true })}
            sub="Sum of published per-security values"
            trendLabel="Official MSE market capitalisation"
          />
          <Stat
            label="Largest issuer"
            value={largest?.code ?? "—"}
            sub={largest ? largest.company : "—"}
            trend={largestShare}
            trendLabel="Share of combined market cap"
          />
          <Stat
            label="Official CMDA Filings"
            value={formatNumber(totalFilings)}
            sub="Audited statements, reports & notices"
            badge={<FileText className="h-3 w-3 text-faint" />}
          />
        </StatGrid>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel sourceId="mse-market" />
          <span className="text-[10px] text-faint">
            Market values are a snapshot from official exchange exports. “Largest” refers to published market capitalisation.
          </span>
        </div>
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="mono-label mb-1">Directory</p>
              <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">All tracked companies</h2>
            </div>
            <span className="text-[10px] text-faint">Prices from {formatNumber(marketRows.length)} latest trade summaries</span>
          </div>
          <CompanyDirectory rows={rows} />
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="mono-label mb-1">Composition</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Market cap by sector</h2>
            </div>
            <div className="space-y-3 px-4 py-3.5">
              {sectorRanked.map(([sector, value]) => (
                <div key={sector}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-ink">{sector}</span>
                    <span className="font-mono text-[10px] text-muted">{formatMvr(value, { compact: true })}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.max(2, (value / maxSector) * 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className="border-t border-line pt-2.5 text-[9.5px] leading-4 text-faint">
                Based on the latest published per-security market capitalisation. Companies without a market cap are
                excluded rather than shown as zero.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-line bg-surface p-4">
            <p className="mono-label mb-1">Verified Information</p>
            <ul className="mt-2 space-y-2 text-[11px] leading-5 text-muted">
              <li className="flex gap-2">
                <span className="font-mono text-[9px] text-accent">01</span> Official last trade price, change and turnover from MSE.
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[9px] text-accent">02</span> Verifiable trading history and capitalisation trend.
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[9px] text-accent">03</span> Direct access to official CMDA audited financial filings.
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-[9px] text-accent">04</span> Corporate governance disclosures and dividend notices.
              </li>
            </ul>
            <Link href="/sources" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
              Data sources & verification <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mono-label mb-1">Compare</p>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Put companies side by side</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            Compare official market capitalisation, trading volume, turnover, share price performance, and corporate disclosures side by side.
          </p>
        </div>
        <Link href="/companies/compare" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Open comparison <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}
