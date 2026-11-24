import { COMPANIES, COMPANY_MODEL, getCompanyByCode } from "@/lib/data/companies";
import {
  getCompanyMarketCap,
  getLatestPrice,
  getSharesOutstanding,
} from "@/lib/data/market";
import type { AnnualFinancial, Company, CompanyFinancials, QuarterlyFinancial } from "@/lib/types";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const cache = new Map<string, CompanyFinancials>();

export function getCompanyFinancials(company: Company): CompanyFinancials {
  const cached = cache.get(company.code);
  if (cached) return cached;

  const config = COMPANY_MODEL[company.code];
  const shares = getSharesOutstanding(company.code) ?? 1_000_000;
  const sharesMillions = shares / 1_000_000;
  const random = seeded(config.seed);
  const annual: AnnualFinancial[] = [];

  for (let year = 2021; year <= 2025; year++) {
    const step = year - 2021;
    const revenueNoise = 1 + (random() - 0.5) * 0.035;
    const marginNoise = config.netMargin + (random() - 0.5) * 0.016;
    const assetNoise = 1 + (random() - 0.5) * 0.025;
    const revenue = round(config.baseRevenue * (1 + config.revenueGrowth) ** step * revenueNoise, 1);
    const netProfit = round(revenue * marginNoise, 1);
    const totalAssets = round(config.baseAssets * (1 + config.assetGrowth) ** step * assetNoise, 1);
    const totalLiabilities = round(totalAssets * (config.liabilityRatio + (random() - 0.5) * 0.012), 1);
    const equity = round(totalAssets - totalLiabilities, 1);
    const eps = round(netProfit / sharesMillions, 2);
    const dps = round(eps * config.payoutRatio * (0.92 + random() * 0.14), 2);
    annual.push({ year, revenue, netProfit, totalAssets, totalLiabilities, equity, eps, dps });
  }

  const latest = annual.at(-1)!;
  const quarterly: QuarterlyFinancial[] = [];
  const quarterEnds = [
    { label: "Q1 2025", periodEnd: "2025-03-31", annualYear: 2025, q: 0 },
    { label: "Q2 2025", periodEnd: "2025-06-30", annualYear: 2025, q: 1 },
    { label: "Q3 2025", periodEnd: "2025-09-30", annualYear: 2025, q: 2 },
    { label: "Q4 2025", periodEnd: "2025-12-31", annualYear: 2025, q: 3 },
    { label: "Q1 2026", periodEnd: "2026-03-31", annualYear: 2026, q: 0 },
    { label: "Q2 2026", periodEnd: "2026-06-30", annualYear: 2026, q: 1 },
    { label: "Q3 2026", periodEnd: "2026-09-30", annualYear: 2026, q: 2 },
  ];

  for (const quarter of quarterEnds) {
    const yearFactor = quarter.annualYear === 2026 ? 1 + config.revenueGrowth : 1;
    const quarterRevenue = round(latest.revenue * yearFactor * config.seasonality[quarter.q] * (0.98 + random() * 0.04), 1);
    const quarterMargin = config.netMargin + (random() - 0.5) * 0.012;
    const quarterProfit = round(quarterRevenue * quarterMargin, 1);
    quarterly.push({
      label: quarter.label,
      periodEnd: quarter.periodEnd,
      revenue: quarterRevenue,
      netProfit: quarterProfit,
    });
  }

  const result: CompanyFinancials = { annual, quarterly, sharesOutstanding: shares, source: "illustrative" };
  cache.set(company.code, result);
  return result;
}

export interface CompanyMetrics {
  latestAnnual: AnnualFinancial;
  previousAnnual: AnnualFinancial;
  price: number | null;
  marketCap: number | null;
  shares: number | null;
  revenueGrowth: number | null;
  profitGrowth: number | null;
  assetGrowth: number | null;
  netMargin: number | null;
  roe: number | null;
  roa: number | null;
  liabilityRatio: number | null;
  eps: number | null;
  pe: number | null;
  navPerShare: number | null;
  dps: number | null;
  dividendYield: number | null;
  marketCapToRevenue: number | null;
}

export function getCompanyMetrics(company: Company): CompanyMetrics {
  const financials = getCompanyFinancials(company);
  const latest = financials.annual.at(-1)!;
  const previous = financials.annual.at(-2)!;
  const price = getLatestPrice(company.code);
  const marketCap = getCompanyMarketCap(company.code);
  const shares = getSharesOutstanding(company.code);

  const change = (current: number, prior: number) => (prior ? ((current - prior) / prior) * 100 : null);

  return {
    latestAnnual: latest,
    previousAnnual: previous,
    price,
    marketCap,
    shares,
    revenueGrowth: change(latest.revenue, previous.revenue),
    profitGrowth: change(latest.netProfit, previous.netProfit),
    assetGrowth: change(latest.totalAssets, previous.totalAssets),
    netMargin: (latest.netProfit / latest.revenue) * 100,
    roe: (latest.netProfit / latest.equity) * 100,
    roa: (latest.netProfit / latest.totalAssets) * 100,
    liabilityRatio: (latest.totalLiabilities / latest.totalAssets) * 100,
    eps: latest.eps,
    pe: price && latest.eps > 0 ? price / latest.eps : null,
    navPerShare: shares ? latest.equity / (shares / 1_000_000) : null,
    dps: latest.dps,
    dividendYield: price && latest.dps > 0 ? (latest.dps / price) * 100 : null,
    marketCapToRevenue: marketCap ? marketCap / (latest.revenue * 1_000_000) : null,
  };
}

export interface CompanyComparisonRow {
  code: string;
  name: string;
  slug: string;
  revenue: number;
  netProfit: number;
  totalAssets: number;
  netMargin: number;
  roe: number;
  eps: number;
  dps: number;
  revenueGrowth: number | null;
  profitGrowth: number | null;
  price: number | null;
  pe: number | null;
  dividendYield: number | null;
}

export function getCompanyComparison(): CompanyComparisonRow[] {
  return COMPANIES.map((company) => {
    const metrics = getCompanyMetrics(company);
    return {
      code: company.code,
      name: company.shortName,
      slug: company.slug,
      revenue: metrics.latestAnnual.revenue,
      netProfit: metrics.latestAnnual.netProfit,
      totalAssets: metrics.latestAnnual.totalAssets,
      netMargin: metrics.netMargin ?? 0,
      roe: metrics.roe ?? 0,
      eps: metrics.eps ?? 0,
      dps: metrics.dps ?? 0,
      revenueGrowth: metrics.revenueGrowth,
      profitGrowth: metrics.profitGrowth,
      price: metrics.price,
      pe: metrics.pe,
      dividendYield: metrics.dividendYield,
    };
  });
}

export function getAnnualSeriesForCodes(codes: string[]): Record<string, unknown>[] {
  const selected = COMPANIES.filter((company) => codes.includes(company.code));
  const years = [2021, 2022, 2023, 2024, 2025];
  return years.map((year) => {
    const row: Record<string, unknown> = { year };
    for (const company of selected) {
      const financials = getCompanyFinancials(company);
      const annual = financials.annual.find((entry) => entry.year === year);
      row[`${company.code}_revenue`] = annual?.revenue ?? null;
      row[`${company.code}_profit`] = annual?.netProfit ?? null;
      row[`${company.code}_assets`] = annual?.totalAssets ?? null;
      row[`${company.code}_margin`] = annual ? (annual.netProfit / annual.revenue) * 100 : null;
      row[`${company.code}_eps`] = annual?.eps ?? null;
      row[`${company.code}_dps`] = annual?.dps ?? null;
    }
    return row;
  });
}

export function getDividendHistory() {
  return COMPANIES.flatMap((company) =>
    getCompanyFinancials(company).annual.map((annual) => ({
      code: company.code,
      company: company.shortName,
      year: annual.year,
      eps: annual.eps,
      dps: annual.dps,
      payout: annual.eps > 0 ? (annual.dps / annual.eps) * 100 : null,
    })),
  );
}

export function getAnnualFinancialRows() {
  return COMPANIES.flatMap((company) =>
    getCompanyFinancials(company).annual.map((annual) => ({
      code: company.code,
      company: company.shortName,
      year: annual.year,
      revenue: annual.revenue,
      netProfit: annual.netProfit,
      totalAssets: annual.totalAssets,
      totalLiabilities: annual.totalLiabilities,
      equity: annual.equity,
      eps: annual.eps,
      dps: annual.dps,
      netMargin: (annual.netProfit / annual.revenue) * 100,
      roe: (annual.netProfit / annual.equity) * 100,
    })),
  );
}

export function getLatestFinancialsByCode(): Record<string, AnnualFinancial> {
  return Object.fromEntries(
    COMPANIES.map((company) => [company.code, getCompanyFinancials(company).annual.at(-1)!]),
  );
}

export function getCompanyByCodeSafe(code: string): Company | undefined {
  return getCompanyByCode(code);
}
