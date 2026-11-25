import { COMPANIES, getCompanyByCode } from "@/lib/data/companies";
import { DISCLOSURES } from "@/lib/data/disclosures";
import {
  getCompanyMarketCap,
  getLatestPrice,
  getLatestTrade,
  getSharesOutstanding,
} from "@/lib/data/market";
import type { Company, CorporateFiling } from "@/lib/types";

export interface CompanyMetrics {
  code: string;
  price: number | null;
  marketCap: number | null;
  shares: number | null;
  previousClose: number | null;
  changePct: number | null;
  volume: number;
  value: number;
  trades: number;
  lastTradeDate: string | null;
  filingsCount: number;
  latestFiling: CorporateFiling | null;
}

export function getCompanyFilings(code: string): CorporateFiling[] {
  return DISCLOSURES.filter(
    (item) =>
      item.code === code &&
      (item.type === "Financial report" || item.type === "Annual report" || item.type === "Dividend"),
  ).map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    publishedAt: item.publishedAt,
    sourceUrl: item.sourceUrl,
  }));
}

export function getCompanyMetrics(company: Company): CompanyMetrics {
  const trade = getLatestTrade(company.code);
  const price = trade?.lastPrice ?? getLatestPrice(company.code);
  const marketCap = getCompanyMarketCap(company.code);
  const shares = getSharesOutstanding(company.code);
  const filings = getCompanyFilings(company.code);

  return {
    code: company.code,
    price,
    marketCap,
    shares,
    previousClose: trade?.previousClose ?? null,
    changePct: trade?.changePct ?? null,
    volume: trade?.volume ?? 0,
    value: trade?.value ?? 0,
    trades: trade?.trades ?? 0,
    lastTradeDate: trade?.lastDate ?? null,
    filingsCount: filings.length,
    latestFiling: filings[0] ?? null,
  };
}

export interface CompanyComparisonRow {
  code: string;
  name: string;
  slug: string;
  sector: string;
  sectorGroup: string;
  price: number | null;
  previousClose: number | null;
  changePct: number | null;
  marketCap: number | null;
  shares: number | null;
  volume: number;
  value: number;
  trades: number;
  lastDate: string | null;
  filingsCount: number;
}

export function getCompanyComparison(): CompanyComparisonRow[] {
  return COMPANIES.map((company) => {
    const metrics = getCompanyMetrics(company);
    return {
      code: company.code,
      name: company.shortName,
      slug: company.slug,
      sector: company.sector,
      sectorGroup: company.sectorGroup,
      price: metrics.price,
      previousClose: metrics.previousClose,
      changePct: metrics.changePct,
      marketCap: metrics.marketCap,
      shares: metrics.shares,
      volume: metrics.volume,
      value: metrics.value,
      trades: metrics.trades,
      lastDate: metrics.lastTradeDate,
      filingsCount: metrics.filingsCount,
    };
  });
}

export function getCompanyByCodeSafe(code: string): Company | undefined {
  return getCompanyByCode(code);
}
