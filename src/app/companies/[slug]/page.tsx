import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ExternalLink,
  FileText,
  Info,
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Trend } from "@/components/ui/trend";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { CompanyMark } from "@/components/ui/company-mark";
import { CompanyPriceChart, QuarterlyChart } from "@/components/companies/price-chart";
import { COMPANIES, getCompanyBySlug } from "@/lib/data/companies";
import {
  getCompanyComparison,
  getCompanyFinancials,
  getCompanyMetrics,
} from "@/lib/data/financials";
import {
  getCompanyBars,
  getCompanyMarketCap,
  getSharesOutstanding,
  getLatestTrade,
  getCompanyPriceSeries,
  TIME_RANGES,
} from "@/lib/data/market";
import { getDisclosuresForCompany, plainLanguageDisclosure, disclosureTypeTone } from "@/lib/data/disclosures";

import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return COMPANIES.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) return { title: "Company not found" };
  return {
    title: company.shortName,
    description: `${company.name} (${company.code}) on the Maldives Stock Exchange: market data, illustrative financials and official disclosures.`,
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const metrics = getCompanyMetrics(company);
  const financials = getCompanyFinancials(company);
  const trade = getLatestTrade(company.code);
  const marketCap = getCompanyMarketCap(company.code);
  const shares = getSharesOutstanding(company.code);
  const disclosures = getDisclosuresForCompany(company.code, 8);
  const comparison = getCompanyComparison().find((row) => row.code === company.code);

  const bars = getCompanyBars(company.code, "1Y");
  const yearHigh = bars.length ? Math.max(...bars.map((bar) => bar.high)) : null;
  const yearLow = bars.length ? Math.min(...bars.map((bar) => bar.low)) : null;
  const yearStart = bars[0]?.close ?? null;
  const yearChange = yearStart && trade?.lastPrice ? ((trade.lastPrice - yearStart) / yearStart) * 100 : null;

  const seriesByRange = Object.fromEntries(
    TIME_RANGES.filter((range) => range !== "1W").map((range) => [
      range,
      getCompanyPriceSeries(company.code, range).map((point) => ({ date: point.date, value: point.value ?? 0 })),
    ]),
  );

  const annualRows = financials.annual.map((annual) => ({
    year: annual.year,
    revenue: annual.revenue,
    netProfit: annual.netProfit,
    totalAssets: annual.totalAssets,
    equity: annual.equity,
    eps: annual.eps,
    dps: annual.dps,
    netMargin: (annual.netProfit / annual.revenue) * 100,
    roe: (annual.netProfit / annual.equity) * 100,
  }));

  const dividendRows = financials.annual.map((annual) => ({
    year: annual.year,
    eps: annual.eps,
    dps: annual.dps,
    payout: annual.eps > 0 ? (annual.dps / annual.eps) * 100 : null,
    yieldOnCost: metrics.price && annual.dps > 0 ? (annual.dps / metrics.price) * 100 : null,
  }));

  const peers = getCompanyComparison()
    .filter((row) => row.code !== company.code)
    .filter((row) => COMPANIES.find((entry) => entry.code === row.code)?.sectorGroup === company.sectorGroup)
    .slice(0, 3);

  return (
    <PageContainer>
      <div className="pt-4">
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> All companies
        </Link>
      </div>

      <PageHeader
        eyebrow={`${company.sector} · ${company.code}`}
        title={company.name}
        description={
          <>
            <span className="simple-only">{company.simpleSummary}</span>
            <span className="advanced-only">{company.summary}</span>
          </>
        }
        actions={
          <>
            <Link
              href={`/disclosures?company=${encodeURIComponent(company.name)}`}
              className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <FileText className="h-3.5 w-3.5" /> Disclosures
            </Link>
            <Link
              href="/companies/compare"
              className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Compare
            </Link>
          </>
        }
        meta={
          <>
            <span className="inline-flex items-center gap-2">
              <CompanyMark monogram={company.monogram} size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{company.code}</span>
            </span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{company.sectorGroup}</span>
            <span className="h-3 w-px bg-line-strong" />
            <DataBadge status="official-reported" label="Market data" />
            <DataBadge status="illustrative" label="Financials" />
            <span className="h-3 w-px bg-line-strong" />
            <span className="font-mono text-[10px]">Simple / Advanced</span>
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            label="Last price"
            value={formatNumber(trade?.lastPrice ?? metrics.price, 2)}
            trend={trade?.changePct ?? null}
            sub={trade?.lastDate ? `Traded ${formatDate(trade.lastDate)}` : "No published trade"}
            trendLabel="Versus previous close"
          />
          <Stat
            label="Market cap"
            value={formatMvr(marketCap, { compact: true })}
            sub="Published by MSE"
            trendLabel="Price × shares outstanding"
          />
          <Stat
            label="52-week high"
            value={formatNumber(yearHigh, 2)}
            sub="Intraday high, official bars"
          />
          <Stat
            label="52-week low"
            value={formatNumber(yearLow, 2)}
            sub="Intraday low, official bars"
          />
          <Stat
            label="12-month change"
            value={formatPercent(yearChange, 1, true)}
            sub="First to latest close in window"
            valueClassName={(yearChange ?? 0) < 0 ? "text-negative" : "text-positive"}
          />
          <Stat
            label="P/E (illustrative)"
            value={formatNumber(metrics.pe, 1)}
            sub="Price ÷ illustrative EPS"
            badge={<DataBadge status="illustrative" label="Sample" />}
          />
        </StatGrid>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel sourceId="mse-market" />
          <span className="text-[10px] text-faint">
            52-week range is derived from official price bars. P/E and yield use illustrative financial statements.
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
            <div>
              <p className="mono-label mb-1">Price history</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">{company.code} closing price</h2>
              <p className="mt-0.5 text-[11px] leading-5 text-muted">
                Daily close from official trade history. Gaps mean no trade was published on that day.
              </p>
            </div>
            <Badge variant="outline">MVR</Badge>
          </div>
          <div className="px-2 pb-2 pt-3">
            <CompanyPriceChart seriesByRange={seriesByRange} code={company.code} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
            <span className="text-[10px] text-faint">Snapshot, not a live feed</span>
            <SourceLabel sourceId="mse-market" />
          </div>
        </section>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="mono-label mb-1">Latest trade</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">What changed</h2>
            </div>
            <dl className="divide-y divide-line text-xs">
              {[
                ["Last price", trade?.lastPrice !== null && trade?.lastPrice !== undefined ? formatMvr(trade.lastPrice, { digits: 2 }) : "—"],
                ["Previous close", trade?.previousClose !== null && trade?.previousClose !== undefined ? formatMvr(trade.previousClose, { digits: 2 }) : "—"],
                ["Volume", formatNumber(trade?.volume ?? 0)],
                ["Turnover", formatMvr(trade?.value ?? 0, { compact: true })],
                ["Trades", formatNumber(trade?.trades ?? 0)],
                ["Last trade date", trade?.lastDate ? formatDate(trade.lastDate, "long") : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 px-4 py-2">
                  <dt className="text-muted">{label}</dt>
                  <dd className="num font-mono text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[9.5px] leading-4 text-faint">
              A security with no recent trade may show a stale last price. Check the trade date.
            </div>
          </section>

          <Notice variant="info" title="In plain language" className="simple-only">
            This is the last price at which {company.shortName} shares changed hands on the exchange. The percentage
            shows how it compares with the previous close. A company’s share price is not the same as its profit or the
            size of the business.
          </Notice>
          <section className="advanced-only rounded-md border border-line bg-surface p-4">
              <p className="mono-label mb-2">Capital structure</p>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Shares outstanding (derived)</dt>
                  <dd className="num font-mono text-ink">{shares ? formatNumber(shares) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Market cap to revenue</dt>
                  <dd className="num font-mono text-ink">{metrics.marketCapToRevenue ? `${formatNumber(metrics.marketCapToRevenue, 2)}×` : "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">NAV per share (illustrative)</dt>
                  <dd className="num font-mono text-ink">{formatMvr(metrics.navPerShare, { digits: 2 })}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Dividend yield (illustrative)</dt>
                  <dd className="num font-mono text-ink">{formatPercent(metrics.dividendYield, 1)}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-line pt-2 font-mono text-[9px] leading-4 text-faint">
                Shares outstanding is derived from published market cap ÷ last price and rounded by the exchange’s own
                published values.
              </p>
            </section>
        </div>
      </div>

      <div className="mt-8">
        <Tabs
          ariaLabel="Company detail"
          items={[
            {
              id: "overview",
              label: "Overview",
              content: (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                  <div className="space-y-5">
                    <section className="rounded-md border border-line bg-surface p-5">
                      <div className="flex items-start gap-3">
                        <CompanyMark monogram={company.monogram} size="lg" />
                        <div>
                          <p className="mono-label mb-1">Business</p>
                          <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">About {company.shortName}</h3>
                          <p className="mt-1.5 text-xs leading-6 text-muted">{company.summary}</p>
                        </div>
                      </div>
                      <dl className="mt-4 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
                        {[
                          ["Security code", company.code],
                          ["Sector", company.sector],
                          ["Sector group", company.sectorGroup],
                          ["Data status", "Prices official · financials illustrative"],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-surface px-3 py-2.5">
                            <dt className="mono-label">{label}</dt>
                            <dd className="mt-0.5 text-[12px] text-ink">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>

                    <section className="overflow-hidden rounded-md border border-line bg-surface">
                      <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <div>
                          <p className="mono-label mb-1">Official disclosures</p>
                          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Recent CMDA filings</h3>
                        </div>
                        <Link
                          href={`/disclosures?company=${encodeURIComponent(company.name)}`}
                          className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline"
                        >
                          All <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                      {disclosures.length ? (
                        <div className="divide-y divide-line">
                          {disclosures.slice(0, 6).map((item) => (
                            <Link
                              key={item.id}
                              href={`/disclosures/${item.id}`}
                              className="block px-4 py-3 transition-colors hover:bg-surface-2/40"
                            >
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant={disclosureTypeTone(item.type)}>{item.type}</Badge>
                                <span className="font-mono text-[9px] text-faint">{formatDate(item.publishedAt)}</span>
                              </div>
                              <p className="mt-1 text-[12px] font-medium leading-[18px] text-ink">{item.title}</p>
                              <p className="simple-only mt-0.5 text-[10.5px] leading-4 text-muted">{plainLanguageDisclosure(item)}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="px-4 py-6 text-center text-xs text-muted">
                          No indexed disclosures for this company in the connected CMDA feed.
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-4 py-2">
                        <span className="text-[9.5px] text-faint">Metadata indexed from CMDA</span>
                        <SourceLabel sourceId="cmda-disclosures" showDate={false} />
                      </div>
                    </section>
                  </div>

                  <div className="space-y-5">
                    <section className="overflow-hidden rounded-md border border-line bg-surface">
                      <div className="border-b border-line px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="mono-label">Key ratios</p>
                          <DataBadge status="illustrative" />
                        </div>
                        <h3 className="mt-1 text-sm font-semibold tracking-[-0.01em] text-ink">Financial performance</h3>
                      </div>
                      <dl className="divide-y divide-line text-xs">
                        {[
                          ["Revenue (illustrative)", `${formatNumber(metrics.latestAnnual.revenue, 1)}m`],
                          ["Net profit (illustrative)", `${formatNumber(metrics.latestAnnual.netProfit, 1)}m`],
                          ["Net margin", formatPercent(metrics.netMargin, 1)],
                          ["Return on equity", formatPercent(metrics.roe, 1)],
                          ["Return on assets", formatPercent(metrics.roa, 1)],
                          ["Liabilities / assets", formatPercent(metrics.liabilityRatio, 1)],
                          ["EPS (illustrative)", formatMvr(metrics.eps, { digits: 2 })],
                          ["DPS (illustrative)", formatMvr(metrics.dps, { digits: 2 })],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-3 px-4 py-2">
                            <dt className="text-muted">{label}</dt>
                            <dd className="num font-mono text-ink">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[9.5px] leading-4 text-warning">
                        Sample values — not official filings. Revenue and profit in MVR millions.
                      </div>
                    </section>

                    {peers.length ? (
                      <section className="overflow-hidden rounded-md border border-line bg-surface">
                        <div className="border-b border-line px-4 py-3">
                          <p className="mono-label mb-1">Sector peers</p>
                          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">{company.sectorGroup}</h3>
                        </div>
                        <div className="divide-y divide-line">
                          {peers.map((peer) => (
                            <Link key={peer.code} href={`/companies/${peer.slug}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2/40">
                              <span>
                                <span className="block text-[12px] font-medium text-ink">{peer.name}</span>
                                <span className="block font-mono text-[9px] text-faint">{peer.code} · P/E {formatNumber(peer.pe, 1)}</span>
                              </span>
                              <Trend value={peer.revenueGrowth} size="sm" />
                            </Link>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>
                </div>
              ),
            },
            {
              id: "financials",
              label: "Financials",
              content: (
                <div className="space-y-5">
                  <Notice variant="demo" compact title="Illustrative financial statements">
                    The annual and quarterly figures below are sample data for interface development. They are not
                    extracted from the company’s official reports. Use the official disclosures to verify any figure.
                  </Notice>

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <section className="overflow-hidden rounded-md border border-line bg-surface">
                      <div className="border-b border-line px-4 py-3">
                        <p className="mono-label mb-1">Annual, 2021–2025</p>
                        <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Income and balance sheet</h3>
                        <p className="mt-0.5 text-[10px] text-faint">MVR millions unless stated</p>
                      </div>
                      <DataTable
                        data={annualRows as unknown as Record<string, unknown>[]}
                        idKey="year"
                        hideSearch
                        pageSize={6}
                        csvFilename={`maldex-${company.code}-annual-illustrative.csv`}
                        columns={[
                          { key: "year", header: "Year", type: "mono" },
                          { key: "revenue", header: "Revenue", type: "number", align: "right", digits: 1 },
                          { key: "netProfit", header: "Net profit", type: "number", align: "right", digits: 1 },
                          { key: "totalAssets", header: "Assets", type: "number", align: "right", digits: 1, hideBelow: "md" },
                          { key: "eps", header: "EPS", type: "number", align: "right", digits: 2 },
                          { key: "dps", header: "DPS", type: "number", align: "right", digits: 2, hideBelow: "sm" },
                          { key: "netMargin", header: "Margin", type: "percent", align: "right", digits: 1 },
                          { key: "roe", header: "ROE", type: "percent", align: "right", digits: 1, hideBelow: "md" },
                        ]}
                        footerNote="Illustrative sample data"
                      />
                    </section>

                    <section className="overflow-hidden rounded-md border border-line bg-surface">
                      <div className="border-b border-line px-4 py-3">
                        <p className="mono-label mb-1">Quarterly, 2025–2026</p>
                        <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Revenue and net profit</h3>
                        <p className="mt-0.5 text-[10px] text-faint">MVR millions, illustrative</p>
                      </div>
                      <div className="px-2 pb-3 pt-4">
                        <QuarterlyChart data={financials.quarterly} />
                      </div>
                    </section>
                  </div>

                  <section className="overflow-hidden rounded-md border border-line bg-surface">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                      <div>
                        <p className="mono-label mb-1">Dividends</p>
                        <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Dividend per share history</h3>
                      </div>
                      <DataBadge status="illustrative" />
                    </div>
                    <DataTable
                      data={dividendRows as unknown as Record<string, unknown>[]}
                      idKey="year"
                      hideSearch
                      pageSize={6}
                      columns={[
                        { key: "year", header: "Year", type: "mono" },
                        { key: "eps", header: "EPS (MVR)", type: "number", align: "right", digits: 2 },
                        { key: "dps", header: "DPS (MVR)", type: "number", align: "right", digits: 2 },
                        { key: "payout", header: "Payout ratio", type: "percent", align: "right", digits: 1 },
                        { key: "yieldOnCost", header: "Yield at latest price", type: "percent", align: "right", digits: 2 },
                      ]}
                      csvFilename={`maldex-${company.code}-dividends-illustrative.csv`}
                      footerNote="Illustrative · not an official dividend record"
                    />
                  </section>
                </div>
              ),
            },
            {
              id: "trading",
              label: "Trading",
              content: (
                <div className="space-y-5">
                  <section className="overflow-hidden rounded-md border border-line bg-surface">
                    <div className="border-b border-line px-4 py-3">
                      <p className="mono-label mb-1">Trade history</p>
                      <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Daily bars, last 60 trading days</h3>
                    </div>
                    <DataTable
                      data={bars.slice(-60).reverse() as unknown as Record<string, unknown>[]}
                      idKey="date"
                      initialSort={{ key: "date", direction: "desc" }}
                      pageSize={12}
                      searchKeys={["date"]}
                      searchPlaceholder="Filter by date"
                      csvFilename={`maldex-${company.code}-daily-bars.csv`}
                      columns={[
                        { key: "date", header: "Date", type: "date" },
                        { key: "open", header: "Open", type: "currency", align: "right", digits: 2 },
                        { key: "high", header: "High", type: "currency", align: "right", digits: 2 },
                        { key: "low", header: "Low", type: "currency", align: "right", digits: 2 },
                        { key: "close", header: "Close", type: "currency", align: "right", digits: 2 },
                        { key: "volume", header: "Volume", type: "number", align: "right" },
                        { key: "value", header: "Value", type: "currency", align: "right", compact: true, hideBelow: "sm" },
                        { key: "trades", header: "Trades", type: "number", align: "right", hideBelow: "md" },
                      ]}
                      footerNote="Derived from official trade records"
                    />
                  </section>
                  <Notice variant="info" compact title="No trade is not a zero price">
                    Missing days mean the exchange published no trade for this security, not that its value fell to zero.
                    The line chart skips non-trading days rather than plotting them.
                  </Notice>
                </div>
              ),
            },
          ]}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3">
        <p className="text-[10px] leading-4 text-faint">
          Market data © Maldives Stock Exchange, retrieved {formatDate(financials.annual.at(-1)?.year ? "2026-11-24" : "2026-11-24", "long")}. Illustrative
          financials © Maldex sample model.
        </p>
        <div className="flex flex-wrap gap-2">
          <SourceLabel sourceId="mse-market" />
          <SourceLabel sourceId="maldex-financial-model" showDate={false} />
        </div>
      </div>
    </PageContainer>
  );
}
