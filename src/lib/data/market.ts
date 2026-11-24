import masixData from "@/data/mse/masix.json";
import capData from "@/data/mse/market-cap.json";
import tradesData from "@/data/mse/trades.json";
import barsData from "@/data/mse/daily-bars.json";
import latestData from "@/data/mse/latest-trades.json";
import orderBookData from "@/data/mse/order-book.json";
import { COMPANIES, getCompanyByCode } from "@/lib/data/companies";
import type { LatestTrade, MarketSnapshot, OrderBookEntry, PriceBar, PricePoint } from "@/lib/types";

export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
export const TIME_RANGES: TimeRange[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

const RANGE_DAYS: Record<Exclude<TimeRange, "ALL">, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

export const MASIX_SERIES: { date: string; value: number }[] = masixData.observations
  .filter((row) => validDate(row.date) && Number.isFinite(row.value) && row.value > 0)
  .map((row) => ({ date: row.date, value: row.value }));

export interface MarketCapPoint {
  date: string;
  total: number;
  bySecurity: Record<string, number>;
}

export const MARKET_CAP_SERIES: MarketCapPoint[] = capData.observations
  .filter((row) => validDate(row.date) && Number.isFinite(row.total) && row.total > 0)
  .map((row) => ({ date: row.date, total: row.total, bySecurity: row.bySecurity }));

export interface TradeRecord {
  date: string;
  code: string;
  quantity: number;
  price: number;
  value: number;
}

export const TRADES: TradeRecord[] = tradesData.trades.filter(
  (t) => validDate(t.date) && t.code && Number.isFinite(t.price),
);

export const DAILY_BARS: Record<string, PriceBar[]> = barsData.bars as Record<string, PriceBar[]>;
export const LATEST_TRADES: LatestTrade[] = latestData.summary as LatestTrade[];
export const ORDER_BOOK: OrderBookEntry[] = orderBookData.orders as OrderBookEntry[];

const equityCodes = new Set(COMPANIES.map((c) => c.code));

export const LATEST_MARKET_DATE = MASIX_SERIES.at(-1)?.date ?? null;
export const LAST_TRADE_DATE = TRADES.map((t) => t.date).sort().at(-1) ?? null;

function nearestPoint(series: { date: string; value: number }[], targetDate: string) {
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].date <= targetDate) return series[i];
  }
  return null;
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function downsample<T>(rows: T[], maxPoints = 420): T[] {
  if (rows.length <= maxPoints) return rows;
  const stride = (rows.length - 1) / (maxPoints - 1);
  const output: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    output.push(rows[Math.round(i * stride)]);
  }
  return output;
}

export function sliceRange<T extends { date: string }>(rows: T[], range: TimeRange): T[] {
  if (range === "ALL" || rows.length === 0) return rows;
  const end = rows.at(-1)?.date;
  if (!end) return rows;
  const start = shiftDate(end, RANGE_DAYS[range]);
  const sliced = rows.filter((row) => row.date >= start);
  return sliced.length >= 2 ? sliced : rows.slice(-2);
}

export function getIndexSeries(range: TimeRange): PricePoint[] {
  return downsample(sliceRange(MASIX_SERIES, range), range === "ALL" ? 520 : 420);
}

export function getMarketCapSeries(range: TimeRange): { date: string; value: number }[] {
  return downsample(
    sliceRange(MARKET_CAP_SERIES, range).map((row) => ({ date: row.date, value: row.total })),
    range === "ALL" ? 520 : 420,
  );
}

export interface TurnoverPoint {
  date: string;
  value: number;
  volume: number;
  trades: number;
}

export const DAILY_TURNOVER: TurnoverPoint[] = (() => {
  const grouped = new Map<string, TurnoverPoint>();
  for (const trade of TRADES) {
    const point = grouped.get(trade.date) ?? { date: trade.date, value: 0, volume: 0, trades: 0 };
    point.value += trade.value;
    point.volume += trade.quantity;
    point.trades += 1;
    grouped.set(trade.date, point);
  }
  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
})();

export function getTurnoverSeries(range: TimeRange): TurnoverPoint[] {
  return downsample(sliceRange(DAILY_TURNOVER, range), 420);
}

export function getEquityTurnoverSeries(range: TimeRange): TurnoverPoint[] {
  const grouped = new Map<string, TurnoverPoint>();
  for (const trade of TRADES) {
    if (!equityCodes.has(trade.code)) continue;
    const point = grouped.get(trade.date) ?? { date: trade.date, value: 0, volume: 0, trades: 0 };
    point.value += trade.value;
    point.volume += trade.quantity;
    point.trades += 1;
    grouped.set(trade.date, point);
  }
  const rows = [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
  return downsample(sliceRange(rows, range), 420);
}

export function getCompanyPriceSeries(code: string, range: TimeRange = "1Y"): PricePoint[] {
  const bars = DAILY_BARS[code] ?? [];
  return downsample(
    sliceRange(bars, range).map((bar) => ({ date: bar.date, value: bar.close })),
    420,
  );
}

export function getCompanyBars(code: string, range: TimeRange = "1Y"): PriceBar[] {
  return sliceRange(DAILY_BARS[code] ?? [], range);
}

export function getLatestTrade(code: string): LatestTrade | null {
  return LATEST_TRADES.find((row) => row.code === code) ?? null;
}

export function getLatestPrice(code: string): number | null {
  return getLatestTrade(code)?.lastPrice ?? DAILY_BARS[code]?.at(-1)?.close ?? null;
}

export function getSharesOutstanding(code: string): number | null {
  const cap = MARKET_CAP_SERIES.at(-1)?.bySecurity?.[code];
  const price = getLatestPrice(code);
  if (!cap || !price) return null;
  return cap / price;
}

export function getCompanyMarketCap(code: string): number | null {
  return MARKET_CAP_SERIES.at(-1)?.bySecurity?.[code] ?? null;
}

export function getSparkline(code: string, points = 30): number[] {
  const bars = DAILY_BARS[code] ?? [];
  return bars.slice(-points).map((bar) => bar.close);
}

export function getIndexSparkline(points = 30): number[] {
  return MASIX_SERIES.slice(-points).map((row) => row.value);
}

export function getMarketCapSparkline(points = 30): number[] {
  return MARKET_CAP_SERIES.slice(-points).map((row) => row.total);
}

export function getMarketSnapshot(): MarketSnapshot {
  const latest = MASIX_SERIES.at(-1) ?? null;
  const previous = MASIX_SERIES.at(-2) ?? null;
  const monthAgo = latest ? nearestPoint(MASIX_SERIES, shiftDate(latest.date, 30)) : null;
  const yearAgo = latest ? nearestPoint(MASIX_SERIES, shiftDate(latest.date, 365)) : null;
  const capLatest = MARKET_CAP_SERIES.at(-1) ?? null;
  const capPrevious = MARKET_CAP_SERIES.at(-2) ?? null;
  const session = DAILY_TURNOVER.at(-1) ?? null;

  return {
    index: latest?.value ?? null,
    indexDate: latest?.date ?? null,
    indexChangePct: latest && previous ? ((latest.value - previous.value) / previous.value) * 100 : null,
    indexChange30dPct:
      latest && monthAgo ? ((latest.value - monthAgo.value) / monthAgo.value) * 100 : null,
    indexChange1yPct:
      latest && yearAgo ? ((latest.value - yearAgo.value) / yearAgo.value) * 100 : null,
    marketCap: capLatest?.total ?? null,
    marketCapDate: capLatest?.date ?? null,
    marketCapChangePct:
      capLatest && capPrevious ? ((capLatest.total - capPrevious.total) / capPrevious.total) * 100 : null,
    listedEquities: COMPANIES.length,
    sessionValue: session?.value ?? 0,
    sessionVolume: session?.volume ?? 0,
    sessionTrades: session?.trades ?? 0,
    sessionDate: session?.date ?? null,
    lastUpdated: masixData.meta.retrievedAt,
  };
}

export interface CompanyMarketRow {
  code: string;
  company: string;
  slug: string;
  sector: string;
  price: number | null;
  previousClose: number | null;
  changePct: number | null;
  volume: number;
  value: number;
  trades: number;
  lastDate: string | null;
  marketCap: number | null;
  sparkline: number[];
}

export function getCompanyMarketRows(): CompanyMarketRow[] {
  return COMPANIES.map((company) => {
    const trade = getLatestTrade(company.code);
    return {
      code: company.code,
      company: company.shortName,
      slug: company.slug,
      sector: company.sector,
      price: trade?.lastPrice ?? getLatestPrice(company.code),
      previousClose: trade?.previousClose ?? null,
      changePct: trade?.changePct ?? null,
      volume: trade?.volume ?? 0,
      value: trade?.value ?? 0,
      trades: trade?.trades ?? 0,
      lastDate: trade?.lastDate ?? null,
      marketCap: getCompanyMarketCap(company.code),
      sparkline: getSparkline(company.code, 24),
    };
  });
}

export function getRecentTrades(limit = 60): TradeRecord[] {
  return [...TRADES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export function getDebtTrades(): LatestTrade[] {
  return LATEST_TRADES.filter((row) => !equityCodes.has(row.code));
}

export function getDebtTradeSummary() {
  const rows = getDebtTrades();
  return {
    instruments: rows.length,
    value: rows.reduce((sum, row) => sum + (row.value ?? 0), 0),
    latestDate: rows.map((r) => r.lastDate).filter(Boolean).sort().at(-1) ?? null,
  };
}

export function getOrderBookFor(code?: string): OrderBookEntry[] {
  return code ? ORDER_BOOK.filter((order) => order.code === code) : ORDER_BOOK;
}

export function getMostActiveEquity(): CompanyMarketRow | null {
  return [...getCompanyMarketRows()].sort((a, b) => b.value - a.value)[0] ?? null;
}

export function getCompanyName(code: string): string {
  return getCompanyByCode(code)?.shortName ?? code;
}

export const MARKET_META = masixData.meta;
