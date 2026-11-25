import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChartCard } from "@/components/charts/chart-card";
import { CompanyPriceChart } from "@/components/companies/price-chart";
import { WhatDoesThisMean } from "@/components/ui/disclosure-panel";
import { COMPANIES, getCompanyBySlug } from "@/lib/data/companies";
import {
  getCompanyComparison,
  getCompanyFilings,
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

export function generateStaticParams() {
  return COMPANIES.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) return { title: "Company not found" };
  return {
    title: `${company.shortName} (${company.code})`,
    description: `${company.name} (${company.code}) on the Maldives Stock Exchange: market price, trading history, and official CMDA corporate filings.`,
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const metrics = getCompanyMetrics(company);
  const trade = getLatestTrade(company.code);
  const marketCap = getCompanyMarketCap(company.code);
  const shares = getSharesOutstanding(company.code);
  const disclosures = getDisclosuresForCompany(company.code, 12);
  const filings = getCompanyFilings(company.code);

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

  const barsByRange = Object.fromEntries(
    TIME_RANGES.filter((range) => range !== "1W").map((range) => [
      range,
      getCompanyBars(company.code, range).map((bar) => ({
        date: bar.date,
        close: bar.close,
        volume: bar.volume,
      })),
    ]),
  );

  const peers = getCompanyComparison()
    .filter((row) => row.code !== company.code)
    .filter((row) => COMPANIES.find((entry) => entry.code === row.code)?.sectorGroup === company.sectorGroup)
    .slice(0, 3);

  const annualFilingsCount = filings.filter((f) => f.type === "Annual report").length;
  const quarterlyFilingsCount = filings.filter((f) => f.type === "Financial report").length;
  const dividendFilingsCount = filings.filter((f) => f.type === "Dividend").length;

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
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <FileText className="h-3.5 w-3.5" /> Disclosures ({disclosures.length})
            </Link>
            <Link
              href="/companies/compare"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Compare
            </Link>
          </>
        }
        meta={
          <>
            <span className="inline-flex items-center gap-2">
              <CompanyMark code={company.code} size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{company.code}</span>
            </span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{company.sectorGroup}</span>
            <span className="h-3 w-px bg-line-strong" />
            <DataBadge status="official-reported" label="MSE Market" />
            <span className="h-3 w-px bg-line-strong" />
            <DataBadge status="official-reported" label="CMDA Filings" />
          </>
        }
      />

      {/* Level 1 — Key Equity Metrics */}
      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            label="Last price"
            value={formatNumber(trade?.lastPrice ?? metrics.price, 2)}
            trend={trade?.changePct ?? null}
            sub={trade?.lastDate ? `Traded ${formatDate(trade.lastDate)}` : "No published trade"}
            trendLabel="MVR per share"
          />
          <Stat
            label="Market cap"
            value={formatMvr(marketCap, { compact: true })}
            sub="Published by MSE"
            trendLabel="Price × shares"
          />
          <Stat
            label="52-week range"
            value={yearLow !== null && yearHigh !== null ? `${formatNumber(yearLow, 1)}–${formatNumber(yearHigh, 1)}` : "—"}
            rangeBar={
              yearLow !== null && yearHigh !== null && (trade?.lastPrice ?? metrics.price) !== null
                ? {
                    min: yearLow,
                    max: yearHigh,
                    current: (trade?.lastPrice ?? metrics.price)!,
                    lowLabel: `L ${formatNumber(yearLow, 2)}`,
                    highLabel: `H ${formatNumber(yearHigh, 2)}`,
                  }
                : undefined
            }
          />
          <Stat
            label="12-month move"
            value={formatPercent(yearChange, 1, true)}
            sub="1Y closing window"
            valueClassName={(yearChange ?? 0) < 0 ? "text-negative" : "text-positive"}
          />
          <Stat
            label="Shares"
            value={shares ? formatNumber(shares) : "—"}
            sub="Derived from MSE cap"
          />
          <Stat
            label="CMDA Filings"
            value={formatNumber(filings.length)}
            sub="Audited & quarterly"
            badge={<DataBadge status="official-reported" label="Verified" />}
          />
        </StatGrid>
      </div>

      {/* Level 2 — Interactive Stock Chart & Trade Summary */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.58fr)_minmax(0,1fr)]">
        <ChartCard
          variant="featured"
          eyebrow="Equity Price History"
          title={`${company.code} Closing Price & Volume`}
          description="Official daily closing prices from MSE trade records. Switch to Price + Volume to inspect liquidity spikes."
          explanation={`Shows the price at which ${company.shortName} shares traded on active exchange sessions. Non-trading days are omitted rather than plotted as zero.`}
          tableData={(seriesByRange["1Y"] ?? []) as unknown as Record<string, unknown>[]}
          tableColumns={[
            { key: "date", label: "Date" },
            { key: "value", label: `${company.code} Close (MVR)`, format: "currency", digits: 2 },
          ]}
          csvFilename={`maldex-${company.code.toLowerCase()}-prices.csv`}
          expandable
          expandedChildren={
            <CompanyPriceChart
              seriesByRange={seriesByRange}
              barsByRange={barsByRange}
              code={company.code}
              height={410}
            />
          }
          actions={<Badge variant="outline">MVR</Badge>}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-faint">Official exchange trade records</span>
              <SourceLabel sourceId="mse-market" />
            </div>
          }
        >
          <CompanyPriceChart
            seriesByRange={seriesByRange}
            barsByRange={barsByRange}
            code={company.code}
          />
        </ChartCard>

        <div className="space-y-5">
          <section className="surface-panel overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <p className="mono-label mb-0.5">Latest Session</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Market Activity</h2>
            </div>
            <dl className="divide-y divide-line/70 text-xs">
              {[
                ["Last price", trade?.lastPrice !== null && trade?.lastPrice !== undefined ? formatMvr(trade.lastPrice, { digits: 2 }) : "—"],
                ["Previous close", trade?.previousClose !== null && trade?.previousClose !== undefined ? formatMvr(trade.previousClose, { digits: 2 }) : "—"],
                ["Volume", formatNumber(trade?.volume ?? 0)],
                ["Turnover", formatMvr(trade?.value ?? 0, { compact: true })],
                ["Trades", formatNumber(trade?.trades ?? 0)],
                ["Last trade date", trade?.lastDate ? formatDate(trade.lastDate, "long") : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted">{label}</dt>
                  <dd className="num font-mono font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line bg-surface-2/35 px-4 py-2.5">
              <WhatDoesThisMean title="Why share price differs from company size" compact>
                Share price alone does not tell you how large {company.shortName} is—a company with a lower share price can have a much higher market capitalisation if it has more shares outstanding.
              </WhatDoesThisMean>
            </div>
          </section>

          <section className="surface-panel p-4">
            <p className="mono-label mb-2">Capital Structure</p>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Shares outstanding (derived)</dt>
                <dd className="num font-mono font-medium text-ink">{shares ? formatNumber(shares) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Market capitalisation</dt>
                <dd className="num font-mono font-medium text-ink">{marketCap ? formatMvr(marketCap, { compact: true }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">CMDA financial filings</dt>
                <dd className="num font-mono font-medium text-ink">{filings.length} indexed</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Level 3 — Detailed Profile, Filings & Daily Bars */}
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
                    <section className="surface-panel p-5">
                      <div className="flex items-start gap-4">
                        <CompanyMark code={company.code} size="lg" />
                        <div>
                          <p className="mono-label mb-1">Company Profile</p>
                          <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{company.name}</h3>
                          <p className="mt-1.5 text-xs leading-6 text-muted">{company.summary}</p>
                        </div>
                      </div>
                      <dl className="mt-4 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
                        {[
                          ["Security code", company.code],
                          ["Sector", company.sector],
                          ["Sector group", company.sectorGroup],
                          ["Verification", "Official exchange trade data & CMDA filings"],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-surface px-3 py-2.5">
                            <dt className="mono-label">{label}</dt>
                            <dd className="mt-0.5 text-xs text-ink">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>

                    <section className="surface-panel overflow-hidden">
                      <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <div>
                          <p className="mono-label mb-0.5">Official disclosures</p>
                          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Recent CMDA Filings</h3>
                        </div>
                        <Link
                          href={`/disclosures?company=${encodeURIComponent(company.name)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                        >
                          All ({disclosures.length}) <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                      {disclosures.length ? (
                        <div className="divide-y divide-line/70">
                          {disclosures.slice(0, 6).map((item) => (
                            <Link
                              key={item.id}
                              href={`/disclosures/${item.id}`}
                              className="block px-4 py-3 transition-colors hover:bg-surface-2/40"
                            >
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant={disclosureTypeTone(item.type)}>{item.type}</Badge>
                                <span className="font-mono text-[9.5px] text-faint">{formatDate(item.publishedAt)}</span>
                              </div>
                              <p className="mt-1 text-xs font-medium leading-[18px] text-ink">{item.title}</p>
                              <p className="simple-only mt-0.5 text-[11px] leading-4 text-muted">{plainLanguageDisclosure(item)}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="px-4 py-6 text-center text-xs text-muted">
                          No indexed disclosures for this company in the connected CMDA feed.
                        </p>
                      )}
                    </section>
                  </div>

                  <div className="space-y-5">
                    {peers.length ? (
                      <section className="surface-panel overflow-hidden">
                        <div className="border-b border-line px-4 py-3">
                          <p className="mono-label mb-0.5">Sector Peers</p>
                          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">{company.sectorGroup}</h3>
                        </div>
                        <div className="divide-y divide-line/70">
                          {peers.map((peer) => (
                            <Link key={peer.code} href={`/companies/${peer.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2/40">
                              <span className="flex items-center gap-2.5">
                                <CompanyMark code={peer.code} size="xs" />
                                <span>
                                  <span className="block text-xs font-medium text-ink">{peer.name}</span>
                                  <span className="block font-mono text-[9.5px] text-faint">
                                    {peer.code} · {peer.price ? formatMvr(peer.price, { digits: 2 }) : "—"}
                                  </span>
                                </span>
                              </span>
                              <span className="num font-mono text-xs text-muted">
                                {peer.marketCap ? formatMvr(peer.marketCap, { compact: true }) : "—"}
                              </span>
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
              label: "Financials & Filings",
              count: filings.length,
              content: (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="surface-panel p-4">
                      <p className="mono-label text-[10px]">Audited Annual Reports</p>
                      <p className="num mt-1 font-mono text-2xl font-semibold text-ink">{annualFilingsCount}</p>
                      <p className="mt-1 text-[11px] text-muted">Yearly audited financial statements</p>
                    </div>
                    <div className="surface-panel p-4">
                      <p className="mono-label text-[10px]">Quarterly Financial Reports</p>
                      <p className="num mt-1 font-mono text-2xl font-semibold text-ink">{quarterlyFilingsCount}</p>
                      <p className="mt-1 text-[11px] text-muted">Interim quarterly income & balance sheet filings</p>
                    </div>
                    <div className="surface-panel p-4">
                      <p className="mono-label text-[10px]">Dividend Declarations</p>
                      <p className="num mt-1 font-mono text-2xl font-semibold text-ink">{dividendFilingsCount}</p>
                      <p className="mt-1 text-[11px] text-muted">Declared dividends and book closure notices</p>
                    </div>
                  </div>

                  <section className="surface-panel overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                      <div>
                        <p className="mono-label mb-0.5">Official Registry</p>
                        <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">
                          Official CMDA Corporate Financial Filings
                        </h3>
                      </div>
                      <SourceLabel sourceId="cmda-disclosures" showDate={false} />
                    </div>

                    {filings.length ? (
                      <div className="divide-y divide-line/70">
                        {filings.map((filing) => (
                          <div
                            key={filing.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-2/40"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={disclosureTypeTone(filing.type)}>{filing.type}</Badge>
                                <span className="font-mono text-[10px] text-faint">{formatDate(filing.publishedAt, "long")}</span>
                              </div>
                              <p className="mt-1 text-[13px] font-medium leading-snug text-ink">{filing.title}</p>
                            </div>
                            <a
                              href={filing.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2/60 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                            >
                              <span>Official PDF</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-muted">
                        No financial statements currently indexed for this issuer.
                      </div>
                    )}
                  </section>
                </div>
              ),
            },
            {
              id: "trading",
              label: "Trading Bars",
              count: bars.slice(-60).length,
              content: (
                <div className="space-y-4">
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
                    footerNote="Derived from official MSE trade records"
                  />
                  <Notice variant="info" compact title="Non-trading sessions">
                    Missing calendar days mean no trades were executed for {company.code} on that session.
                  </Notice>
                </div>
              ),
            },
          ]}
        />
      </div>
    </PageContainer>
  );
}
