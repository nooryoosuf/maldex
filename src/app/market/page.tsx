import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Info } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { CompanyMark } from "@/components/ui/company-mark";
import { Trend } from "@/components/ui/trend";
import { MarketActivity } from "@/components/home/market-activity";
import {
  DAILY_TURNOVER,
  MASIX_SERIES,
  TIME_RANGES,
  getCompanyMarketRows,
  getDebtTradeSummary,
  getDebtTrades,
  getEquityTurnoverSeries,
  getIndexSeries,
  getIndexSparkline,
  getMarketCapSeries,
  getMarketSnapshot,
  getMostActiveEquity,
  getOrderBookFor,
  getRecentTrades,
  getTurnoverSeries,
} from "@/lib/data/market";
import { getCompanyByCode } from "@/lib/data/companies";
import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Market",
  description:
    "MASIX index, market capitalisation, trading activity, listed equities, recent trades and the order book — from official Maldives Stock Exchange snapshots.",
};

function yearRange() {
  const latest = MASIX_SERIES.at(-1);
  if (!latest) return null;
  const start = new Date(`${latest.date}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 365);
  const startStr = start.toISOString().slice(0, 10);
  const window = MASIX_SERIES.filter((row) => row.date >= startStr);
  if (!window.length) return null;
  return {
    high: Math.max(...window.map((row) => row.value)),
    low: Math.min(...window.map((row) => row.value)),
    start: window[0].date,
  };
}

export default function MarketPage() {
  const snapshot = getMarketSnapshot();
  const rows = getCompanyMarketRows();
  const active = getMostActiveEquity();
  const recent = getRecentTrades(80);
  const orders = getOrderBookFor();
  const debtTrades = getDebtTrades();
  const debtSummary = getDebtTradeSummary();
  const range = yearRange();

  const traded = rows.filter((row) => row.changePct !== null);
  const gainers = [...traded].filter((row) => (row.changePct ?? 0) > 0).sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
  const losers = [...traded].filter((row) => (row.changePct ?? 0) < 0).sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0));
  const unchanged = traded.length - gainers.length - losers.length;
  const byValue = [...rows].sort((a, b) => b.value - a.value).slice(0, 4);

  const seriesByRange = Object.fromEntries(
    TIME_RANGES.map((rangeKey) => [
      rangeKey,
      {
        index: getIndexSeries(rangeKey),
        cap: getMarketCapSeries(rangeKey),
        turnover: getTurnoverSeries(rangeKey),
        equityTurnover: getEquityTurnoverSeries(rangeKey),
      },
    ]),
  );

  const equityRows = rows.map((row) => ({
    ...row,
    trend: row.sparkline,
  }));

  const tradeRows = recent.map((trade) => ({
    ...trade,
    company: getCompanyByCode(trade.code)?.shortName ?? trade.code,
    slug: getCompanyByCode(trade.code)?.slug ?? "",
  }));

  const orderRows = orders.map((order, index) => ({
    id: `${order.code}-${order.side}-${index}`,
    code: order.code,
    side: order.side,
    quantity: order.quantity,
    price: order.price,
    value: order.quantity * order.price,
  }));

  const debtRows = debtTrades.map((row) => ({
    code: row.code,
    price: row.lastPrice,
    changePct: row.changePct,
    volume: row.volume,
    value: row.value,
    trades: row.trades,
    lastDate: row.lastDate,
  }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Market"
        title="The Maldives Stock Exchange, explained"
        description={
          <>
            The exchange is small, thinly traded and dominated by a handful of large companies. This page separates the
            official snapshot from interpretation, so you can see what actually traded — and what did not.
          </>
        }
        actions={
          <Link
            href="/data-explorer?dataset=masix-index"
            className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <BookOpen className="h-3.5 w-3.5" /> Open market datasets
          </Link>
        }
        meta={
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" /> Snapshot {formatDate(snapshot.indexDate, "long")}
            </span>
            <span className="h-3 w-px bg-line-strong" />
            <SourceLabel sourceId="mse-market" />
            <span className="h-3 w-px bg-line-strong" />
            <span>Prices are not a live feed</span>
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            label="MASIX"
            value={formatNumber(snapshot.index, 2)}
            trend={snapshot.indexChangePct}
            trendLabel="Latest session"
            sub="Index level"
            sparkline={getIndexSparkline(30)}
          />
          <Stat
            label="Market cap"
            value={formatMvr(snapshot.marketCap, { compact: true })}
            trend={snapshot.marketCapChangePct}
            trendLabel="Latest session"
            sub="All listed equities"
          />
          <Stat
            label="Turnover"
            value={formatMvr(snapshot.sessionValue, { compact: true })}
            sub={`${formatNumber(snapshot.sessionTrades)} trades · ${formatNumber(snapshot.sessionVolume)} units`}
            trendLabel="Latest trading session"
          />
          <Stat
            label="Advancers / decliners"
            value={`${gainers.length} / ${losers.length}`}
            sub={`${unchanged} unchanged · latest available trade`}
            trendLabel="Per security, not the index"
          />
          <Stat
            label="52-week high"
            value={formatNumber(range?.high ?? null, 2)}
            sub={range ? `Since ${formatDate(range.start)}` : "—"}
            trendLabel="MASIX intraday closes"
          />
          <Stat
            label="52-week low"
            value={formatNumber(range?.low ?? null, 2)}
            sub={range ? `Since ${formatDate(range.start)}` : "—"}
            trendLabel="MASIX intraday closes"
          />
        </StatGrid>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel sourceId="mse-market" />
          <span className="text-[10px] text-faint">
            Advancers and decliners compare the latest published price with the prior close for each security. Trading
            days differ by security.
          </span>
        </div>
      </div>

      <div className="mt-8">
        <MarketActivity
          seriesByRange={seriesByRange}
          snapshot={snapshot}
          mostActive={active ? { code: active.code, value: active.value, changePct: active.changePct } : null}
        />
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="mono-label mb-1">Movers</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Largest moves in the latest trade</h2>
            </div>
            <Badge variant="outline">Per security</Badge>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2">
            <div className="bg-surface p-4">
              <p className="mono-label mb-2 text-positive">Largest gains</p>
              {gainers.length ? (
                <div className="divide-y divide-line">
                  {gainers.slice(0, 4).map((row) => {
                    const company = getCompanyByCode(row.code);
                    return (
                      <Link key={row.code} href={`/companies/${row.slug}`} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 group">
                        <CompanyMark monogram={company?.monogram ?? row.code.slice(0, 2)} size="xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium text-ink group-hover:text-accent">{company?.shortName ?? row.code}</span>
                          <span className="block font-mono text-[9px] text-faint">{row.code} · {formatDate(row.lastDate)}</span>
                        </span>
                        <span className="text-right">
                          <Trend value={row.changePct} size="sm" />
                          <span className="mt-0.5 block font-mono text-[10px] text-muted">{formatNumber(row.price, 2)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] leading-5 text-muted">No security traded above its prior close in the latest summary.</p>
              )}
            </div>
            <div className="bg-surface p-4">
              <p className="mono-label mb-2 text-negative">Largest declines</p>
              {losers.length ? (
                <div className="divide-y divide-line">
                  {losers.slice(0, 4).map((row) => {
                    const company = getCompanyByCode(row.code);
                    return (
                      <Link key={row.code} href={`/companies/${row.slug}`} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 group">
                        <CompanyMark monogram={company?.monogram ?? row.code.slice(0, 2)} size="xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium text-ink group-hover:text-accent">{company?.shortName ?? row.code}</span>
                          <span className="block font-mono text-[9px] text-faint">{row.code} · {formatDate(row.lastDate)}</span>
                        </span>
                        <span className="text-right">
                          <Trend value={row.changePct} size="sm" />
                          <span className="mt-0.5 block font-mono text-[10px] text-muted">{formatNumber(row.price, 2)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] leading-5 text-muted">No security traded below its prior close in the latest summary.</p>
              )}
            </div>
          </div>
          <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[10px] leading-4 text-faint">
            A large percentage move can reflect a very small number of units traded. Check turnover before drawing
            conclusions.
          </div>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="mono-label mb-1">By value</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Where the money traded</h2>
            </div>
            <div className="divide-y divide-line">
              {byValue.map((row, index) => (
                <div key={row.code} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-4 font-mono text-[9px] text-faint">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-ink">{getCompanyByCode(row.code)?.shortName ?? row.code}</span>
                    <span className="block font-mono text-[9px] text-faint">{row.code} · {formatDate(row.lastDate)}</span>
                  </span>
                  <span className="text-right">
                    <span className="num block font-mono text-[12px] text-ink">{formatMvr(row.value, { compact: true })}</span>
                    <span className="block font-mono text-[9px] text-faint">{formatNumber(row.volume)} units</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Notice variant="info" compact title="How to read the market">
            The MASIX index summarises price movements; it does not show how much was traded. A flat index can hide large
            moves in individual companies, and a big index move can come from very thin trading.
          </Notice>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Reference data</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Listed securities and trading detail</h2>
          </div>
          <span className="text-[10px] text-faint">All figures from the latest official MSE snapshot</span>
        </div>

        <Tabs
          ariaLabel="Market data tables"
          items={[
            {
              id: "equities",
              label: "Equities",
              count: rows.length,
              content: (
                <DataTable
                  data={equityRows}
                  idKey="code"
                  initialSort={{ key: "marketCap", direction: "desc" }}
                  columns={[
                    { key: "company", header: "Company", type: "company", hrefTemplate: "/companies/{slug}", secondaryKey: "code" },
                    { key: "sector", header: "Sector", hideBelow: "lg" },
                    { key: "price", header: "Last price", type: "currency", align: "right", digits: 2 },
                    { key: "changePct", header: "Change", type: "change", align: "right" },
                    { key: "volume", header: "Volume", type: "number", align: "right", hideBelow: "md" },
                    { key: "value", header: "Turnover", type: "currency", align: "right", compact: true },
                    { key: "marketCap", header: "Market cap", type: "currency", align: "right", compact: true, hideBelow: "sm" },
                    { key: "trend", header: "30d", type: "sparkline", align: "right", hideBelow: "lg", sortable: false },
                    { key: "lastDate", header: "Last trade", type: "date", align: "right", hideBelow: "lg" },
                  ]}
                  searchKeys={["company", "code", "sector"]}
                  searchPlaceholder="Search companies or sectors"
                  csvFilename="maldex-listed-equities.csv"
                  caption="Latest published price, turnover and market capitalisation for each tracked listed equity."
                  footerNote="Latest available trade per security"
                  pageSize={10}
                />
              ),
            },
            {
              id: "trades",
              label: "Recent trades",
              count: recent.length,
              content: (
                <DataTable
                  data={tradeRows}
                  idKey="id"
                  initialSort={{ key: "date", direction: "desc" }}
                  columns={[
                    { key: "date", header: "Date", type: "date" },
                    { key: "code", header: "Security", type: "mono" },
                    { key: "company", header: "Company", hideBelow: "md" },
                    { key: "quantity", header: "Quantity", type: "number", align: "right" },
                    { key: "price", header: "Price", type: "currency", align: "right", digits: 2 },
                    { key: "value", header: "Value", type: "currency", align: "right", compact: true },
                  ]}
                  searchKeys={["code", "company", "date"]}
                  searchPlaceholder="Search security or date"
                  csvFilename="maldex-recent-trades.csv"
                  caption="A filtered extract of individual trade records from the official MSE trade history."
                  pageSize={12}
                  footerNote="Filtered extract · not the complete trade history"
                />
              ),
            },
            {
              id: "order-book",
              label: "Order book",
              count: orders.length,
              content: (
                <DataTable
                  data={orderRows}
                  idKey="id"
                  columns={[
                    { key: "code", header: "Security", type: "mono" },
                    { key: "side", header: "Side", type: "badge", toneMap: { BUY: "positive", SELL: "negative" } },
                    { key: "quantity", header: "Quantity", type: "number", align: "right" },
                    { key: "price", header: "Limit price", type: "currency", align: "right", digits: 2 },
                    { key: "value", header: "Order value", type: "currency", align: "right", compact: true },
                  ]}
                  searchKeys={["code", "side"]}
                  searchPlaceholder="Search security or side"
                  csvFilename="maldex-order-book.csv"
                  caption="Published equity order book snapshot. Orders may have been amended or withdrawn since retrieval."
                  pageSize={12}
                  footerNote="Snapshot, not a live order book"
                />
              ),
            },
            {
              id: "debt",
              label: "Debt market",
              count: debtTrades.length,
              content: (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface-2/40 px-4 py-2.5">
                    <p className="text-[11px] text-muted">
                      {debtSummary.instruments} debt instruments have a published trade summary. Latest trade{" "}
                      {debtSummary.latestDate ? formatDate(debtSummary.latestDate) : "unavailable"}.
                    </p>
                    <Link href="/bonds" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
                      Bonds & Sukuk terms <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <DataTable
                    data={debtRows}
                    idKey="code"
                    columns={[
                      { key: "code", header: "Instrument", type: "mono" },
                      { key: "price", header: "Last price", type: "currency", align: "right", digits: 2 },
                      { key: "changePct", header: "Change", type: "change", align: "right" },
                      { key: "volume", header: "Volume", type: "number", align: "right" },
                      { key: "value", header: "Value", type: "currency", align: "right", compact: true },
                      { key: "trades", header: "Trades", type: "number", align: "right" },
                      { key: "lastDate", header: "Last trade", type: "date", align: "right" },
                    ]}
                    searchKeys={["code"]}
                    searchPlaceholder="Search instrument"
                    csvFilename="maldex-debt-market.csv"
                    caption="Latest published trade summary for listed debt instruments."
                    hideSearch={debtTrades.length < 8}
                    footerNote="Debt instruments trade infrequently"
                  />
                </div>
              ),
            },
          ]}
        />
      </section>

      <section className="mt-8 grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mono-label mb-1">Understanding the numbers</p>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Thin trading changes how you should read prices</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            With few buyers and sellers, the last traded price may not reflect the price at which a larger order could
            trade. Market capitalisation uses published prices and shares outstanding, so it moves even when no shares
            change hands.
          </p>
        </div>
        <Link href="/sources" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Methodology <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}
