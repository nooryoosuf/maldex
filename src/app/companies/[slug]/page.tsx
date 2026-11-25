import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ExternalLink,
  FileText,
  Landmark,
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
import { CompanyPriceChart } from "@/components/companies/price-chart";
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
import { cn } from "@/lib/cn";

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
              className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <FileText className="h-3.5 w-3.5" /> All Disclosures ({disclosures.length})
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
              <CompanyMark code={company.code} size="xs" />
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{company.code}</span>
            </span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{company.sectorGroup}</span>
            <span className="h-3 w-px bg-line-strong" />
            <DataBadge status="official-reported" label="Market data" />
            <span className="h-3 w-px bg-line-strong" />
            <DataBadge status="official-reported" label="CMDA Filings" />
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
            label="Official Filings"
            value={formatNumber(filings.length)}
            sub="CMDA audited & quarterly"
            badge={<DataBadge status="official-reported" label="Verified" />}
          />
        </StatGrid>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel sourceId="mse-market" />
          <span className="text-[10px] text-faint">
            Official trade snapshot from Maldives Stock Exchange. Filings indexed from CMDA InformInvestor.
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
            <span className="text-[10px] text-faint">Official trade records</span>
            <SourceLabel sourceId="mse-market" />
          </div>
        </section>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="mono-label mb-1">Latest trade</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Market Activity</h2>
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
              A security with no recent trade displays its last established official trade price.
            </div>
          </section>

          <Notice variant="info" title="In plain language" className="simple-only">
            This is the last price at which {company.shortName} shares changed hands on the Maldives Stock Exchange.
            Official corporate disclosure documents and audited annual reports are available in the Financials & Filings tab below.
          </Notice>

          <section className="advanced-only rounded-md border border-line bg-surface p-4">
            <p className="mono-label mb-2">Capital structure</p>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Shares outstanding (derived)</dt>
                <dd className="num font-mono text-ink">{shares ? formatNumber(shares) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Market capitalisation</dt>
                <dd className="num font-mono text-ink">{marketCap ? formatMvr(marketCap, { compact: true }) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Security code</dt>
                <dd className="num font-mono text-ink">{company.code}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Regulator filings indexed</dt>
                <dd className="num font-mono text-ink">{filings.length} filings</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-line pt-2 font-mono text-[9px] leading-4 text-faint">
              Shares outstanding is derived from published market cap ÷ last price as published by the Maldives Stock Exchange.
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
                      <div className="flex items-start gap-4">
                        <CompanyMark code={company.code} size="lg" />
                        <div>
                          <p className="mono-label mb-1">Company Profile</p>
                          <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{company.name}</h3>
                          <p className="mt-1.5 text-xs leading-6 text-muted">{company.summary}</p>
                        </div>
                      </div>
                      <dl className="mt-4 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
                        {[
                          ["Security code", company.code],
                          ["Sector", company.sector],
                          ["Sector group", company.sectorGroup],
                          ["Verification", "Official exchange trade data & CMDA filings"],
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
                          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">Recent CMDA Filings</h3>
                        </div>
                        <Link
                          href={`/disclosures?company=${encodeURIComponent(company.name)}`}
                          className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline"
                        >
                          All ({disclosures.length}) <ArrowUpRight className="h-3 w-3" />
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
                          <p className="mono-label">Market Metrics</p>
                          <DataBadge status="official-reported" />
                        </div>
                        <h3 className="mt-1 text-sm font-semibold tracking-[-0.01em] text-ink">Trading Parameters</h3>
                      </div>
                      <dl className="divide-y divide-line text-xs">
                        {[
                          ["Last trade price", trade?.lastPrice ? formatMvr(trade.lastPrice, { digits: 2 }) : "—"],
                          ["Market capitalisation", marketCap ? formatMvr(marketCap, { compact: true }) : "—"],
                          ["Traded volume", formatNumber(trade?.volume ?? 0)],
                          ["Turnover value", formatMvr(trade?.value ?? 0, { compact: true })],
                          ["Total trades", formatNumber(trade?.trades ?? 0)],
                          ["Shares outstanding", shares ? formatNumber(shares) : "—"],
                          ["Last traded", trade?.lastDate ? formatDate(trade.lastDate) : "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-3 px-4 py-2">
                            <dt className="text-muted">{label}</dt>
                            <dd className="num font-mono text-ink">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[9.5px] leading-4 text-faint">
                        Official MSE market metrics.
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
                              <span className="flex items-center gap-2">
                                <CompanyMark code={peer.code} size="xs" />
                                <span>
                                  <span className="block text-[12px] font-medium text-ink">{peer.name}</span>
                                  <span className="block font-mono text-[9px] text-faint">{peer.code} · {peer.price ? formatMvr(peer.price, { digits: 2 }) : "—"}</span>
                                </span>
                              </span>
                              <span className="font-mono text-xs text-muted">{peer.marketCap ? formatMvr(peer.marketCap, { compact: true }) : "—"}</span>
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
              content: (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-md border border-line bg-surface p-4">
                      <p className="mono-label text-[10px]">Audited Annual Reports</p>
                      <p className="num mt-1 font-mono text-2xl font-semibold text-ink">{annualFilingsCount}</p>
                      <p className="mt-1 text-[11px] text-muted">Comprehensive yearly audited financial statements</p>
                    </div>
                    <div className="rounded-md border border-line bg-surface p-4">
                      <p className="mono-label text-[10px]">Quarterly Financial Reports</p>
                      <p className="num mt-1 font-mono text-2xl font-semibold text-ink">{quarterlyFilingsCount}</p>
                      <p className="mt-1 text-[11px] text-muted">Unaudited quarterly income & balance sheet filings</p>
                    </div>
                    <div className="rounded-md border border-line bg-surface p-4">
                      <p className="mono-label text-[10px]">Dividend Declarations</p>
                      <p className="num mt-1 font-mono text-2xl font-semibold text-ink">{dividendFilingsCount}</p>
                      <p className="mt-1 text-[11px] text-muted">Declared dividends and book closure notices</p>
                    </div>
                  </div>

                  <section className="overflow-hidden rounded-md border border-line bg-surface">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                      <div>
                        <p className="mono-label mb-1">Official Registry</p>
                        <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">
                          Official CMDA Corporate Financial Filings
                        </h3>
                        <p className="mt-0.5 text-[11px] text-muted">
                          Official financial reports and audited disclosures submitted to the Capital Market Development Authority (CMDA). Click any filing to open the official document.
                        </p>
                      </div>
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" /> {filings.length} Filings
                      </Badge>
                    </div>

                    {filings.length ? (
                      <div className="divide-y divide-line">
                        {filings.map((filing) => (
                          <div
                            key={filing.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2/40 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={disclosureTypeTone(filing.type)}>{filing.type}</Badge>
                                <span className="font-mono text-[10px] text-faint">{formatDate(filing.publishedAt, "long")}</span>
                              </div>
                              <p className="mt-1 text-[13px] font-medium text-ink leading-snug">{filing.title}</p>
                            </div>
                            <div>
                              <a
                                href={filing.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded border border-line bg-surface-2/60 px-3 py-1.5 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors"
                              >
                                <span>Official Document</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-muted">
                        No financial statements currently indexed for this issuer. View all corporate disclosures on{" "}
                        <Link href="/disclosures" className="text-accent underline">
                          the disclosures page
                        </Link>
                        .
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-line bg-surface-2/40 px-4 py-2.5 text-[10px] text-faint">
                      <span>Source: CMDA InformInvestor Official Disclosure Index</span>
                      <SourceLabel sourceId="cmda-disclosures" showDate={false} />
                    </div>
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
          Market data © Maldives Stock Exchange. Regulatory filings © Capital Market Development Authority (CMDA).
        </p>
        <div className="flex flex-wrap gap-2">
          <SourceLabel sourceId="mse-market" />
          <SourceLabel sourceId="cmda-disclosures" showDate={false} />
        </div>
      </div>
    </PageContainer>
  );
}
