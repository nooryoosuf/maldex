import { BONDS, nominalIssueValue } from "@/lib/data/bonds";
import { COMPANIES } from "@/lib/data/companies";
import { DISCLOSURES } from "@/lib/data/disclosures";
import { ECONOMIC_INDICATORS, getIndicatorRows } from "@/lib/data/economy";
import { getAnnualFinancialRows, getCompanyComparison, getDividendHistory } from "@/lib/data/financials";
import {
  DAILY_TURNOVER,
  MARKET_CAP_SERIES,
  MASIX_SERIES,
  TRADES,
} from "@/lib/data/market";
import { getSource } from "@/lib/data/sources";
import type { Dataset } from "@/lib/types";

const marketSource = getSource("mse-market");
const worldBankSource = getSource("worldbank");
const cmdaSource = getSource("cmda-disclosures");
const mseListedSource = getSource("mse-listed");
const modelSource = getSource("maldex-financial-model");

const MARKET_CUTOFF = "2021-11-24";
const TRADE_CUTOFF = "2026-08-26";

const masixRows = MASIX_SERIES.filter((row) => row.date >= MARKET_CUTOFF).map((row) => ({
  date: row.date,
  index: row.value,
}));

const capCodes = Object.keys(MARKET_CAP_SERIES.at(-1)?.bySecurity ?? {});
const capRows = MARKET_CAP_SERIES.filter((row) => row.date >= MARKET_CUTOFF).map((row) => ({
  date: row.date,
  total: row.total,
  ...Object.fromEntries(capCodes.map((code) => [code, row.bySecurity[code] ?? null])),
}));

const tradeRows = TRADES.filter((row) => row.date >= TRADE_CUTOFF).map((row) => ({
  date: row.date,
  code: row.code,
  quantity: row.quantity,
  price: row.price,
  value: row.value,
}));

const turnoverRows = DAILY_TURNOVER.map((row) => ({
  date: row.date,
  value: row.value,
  volume: row.volume,
  trades: row.trades,
}));

function indicatorDataset(key: string, id: string, name: string, description: string, category: string): Dataset {
  const indicator = ECONOMIC_INDICATORS.find((item) => item.key === key);
  return {
    id,
    name,
    description,
    category,
    sourceId: "worldbank",
    verification: "official-reported",
    updatedAt: worldBankSource.retrievedAt,
    rows: (indicator?.observations ?? []).map((obs) => ({ period: obs.period, value: obs.value })),
    columns: [
      { key: "period", label: "Period", type: "date" },
      { key: "value", label: `${indicator?.name ?? "Value"} (${indicator?.unit ?? ""})`, type: "number", align: "right" },
    ],
    chart: { x: "period", y: "value", kind: "line" },
  };
}

const disclosureRows = DISCLOSURES.map((item) => ({
  date: item.publishedAt,
  company: item.company,
  code: item.code ?? "",
  type: item.type,
  title: item.title,
  source: item.sourceUrl,
}));

const bondRows = BONDS.map((bond) => ({
  code: bond.code,
  issuer: bond.issuerShort,
  type: bond.instrumentType,
  rate: bond.returnRate,
  frequency: bond.returnFrequency,
  faceValue: bond.faceValue,
  units: bond.issueSizeUnits,
  nominalValue: nominalIssueValue(bond),
  issued: bond.issueDate,
  maturity: bond.maturityDate,
}));

const comparisonRows = getCompanyComparison();
const annualRows = getAnnualFinancialRows();
const dividendRows = getDividendHistory();

const latestFinancialRows = comparisonRows.map((row) => ({
  code: row.code,
  company: row.name,
  revenue: row.revenue,
  netProfit: row.netProfit,
  totalAssets: row.totalAssets,
  netMargin: row.netMargin,
  roe: row.roe,
  eps: row.eps,
  pe: row.pe,
  dividendYield: row.dividendYield,
}));

export const DATASETS: Dataset[] = [
  {
    id: "masix-index",
    name: "MASIX index",
    description:
      "Daily closing level of the Maldives Stock Exchange MASIX index, retrieved from the exchange's public CSV export.",
    category: "Market",
    sourceId: "mse-market",
    verification: "official-reported",
    updatedAt: marketSource.retrievedAt,
    rows: masixRows,
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "index", label: "MASIX (points)", type: "number", align: "right" },
    ],
    chart: { x: "date", y: "index", kind: "line" },
  },
  {
    id: "market-cap",
    name: "Market capitalisation",
    description:
      "Daily total market capitalisation and per-security market values. Market capitalisation is price × shares outstanding as published by MSE.",
    category: "Market",
    sourceId: "mse-market",
    verification: "official-reported",
    updatedAt: marketSource.retrievedAt,
    rows: capRows,
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "total", label: "Total market cap (MVR)", type: "currency", align: "right" },
      ...capCodes.map((code) => ({ key: code, label: `${code} (MVR)`, type: "currency" as const, align: "right" as const })),
    ],
    chart: { x: "date", y: "total", kind: "area" },
  },
  {
    id: "daily-turnover",
    name: "Daily trading turnover",
    description:
      "Value and volume of trades by day, aggregated from the official trade history. A day with no trades is not shown, rather than plotted as zero.",
    category: "Market",
    sourceId: "mse-market",
    verification: "derived",
    updatedAt: marketSource.retrievedAt,
    rows: turnoverRows,
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "value", label: "Turnover (MVR)", type: "currency", align: "right" },
      { key: "volume", label: "Volume (units)", type: "number", align: "right" },
      { key: "trades", label: "Trades", type: "number", align: "right" },
    ],
    chart: { x: "date", y: "value", kind: "bar" },
  },
  {
    id: "trades",
    name: "Trade records",
    description:
      "Individual trade records for the last three months, including security, quantity, price and value. This is a filtered extract of the official trade history.",
    category: "Market",
    sourceId: "mse-market",
    verification: "official-reported",
    updatedAt: marketSource.retrievedAt,
    rows: tradeRows,
    columns: [
      { key: "date", label: "Date", type: "date" },
      { key: "code", label: "Security", type: "mono" },
      { key: "quantity", label: "Quantity", type: "number", align: "right" },
      { key: "price", label: "Price (MVR)", type: "currency", align: "right" },
      { key: "value", label: "Value (MVR)", type: "currency", align: "right" },
    ],
  },
  {
    id: "gdp-growth",
    name: "GDP growth",
    description:
      "Annual real GDP growth for the Maldives, from the World Bank Open Data API. The latest available year may lag current conditions.",
    category: "Economy",
    sourceId: "worldbank",
    verification: "official-reported",
    updatedAt: worldBankSource.retrievedAt,
    rows: indicatorDataset("gdpGrowth", "gdp-growth", "GDP growth", "", "Economy").rows,
    columns: [
      { key: "period", label: "Year", type: "date" },
      { key: "value", label: "GDP growth (% annual)", type: "number", align: "right" },
    ],
    chart: { x: "period", y: "value", kind: "line" },
  },
  indicatorDataset("inflation", "inflation", "Inflation", "Annual percentage change in the Maldives consumer price index, from the World Bank Open Data API.", "Economy"),
  indicatorDataset("reserves", "reserves", "Official reserves", "Total official reserves in US dollars, from the World Bank Open Data API.", "Economy"),
  indicatorDataset("current-account", "current-account", "Current account balance", "Current account balance as a share of GDP, from the World Bank Open Data API.", "Economy"),
  {
    id: "economic-observations",
    name: "Economic indicator observations",
    description:
      "A long-format view of all connected World Bank indicators for the Maldives. Units differ by indicator, so compare within a series rather than across rows.",
    category: "Economy",
    sourceId: "worldbank",
    verification: "official-reported",
    updatedAt: worldBankSource.retrievedAt,
    rows: getIndicatorRows(),
    columns: [
      { key: "period", label: "Period", type: "date" },
      { key: "indicator", label: "Indicator", type: "text" },
      { key: "value", label: "Value", type: "number", align: "right" },
      { key: "unit", label: "Unit", type: "text" },
      { key: "category", label: "Category", type: "text" },
    ],
  },
  {
    id: "disclosures",
    name: "Corporate disclosures",
    description:
      "Headline metadata and official document links from the CMDA InformInvestor disclosure index. Document contents are not extracted by Maldex.",
    category: "Disclosures",
    sourceId: "cmda-disclosures",
    verification: "official-reported",
    updatedAt: cmdaSource.retrievedAt,
    rows: disclosureRows,
    columns: [
      { key: "date", label: "Published", type: "date" },
      { key: "company", label: "Company", type: "text" },
      { key: "code", label: "Code", type: "mono" },
      { key: "type", label: "Type", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "source", label: "Official source", type: "text" },
    ],
  },
  {
    id: "bonds",
    name: "Bonds & Sukuk terms",
    description:
      "Published debt-instrument terms from the MSE listed-securities directory. Nominal issue value is a Maldex calculation of units × face value.",
    category: "Debt",
    sourceId: "mse-listed",
    verification: "official-reported",
    updatedAt: mseListedSource.retrievedAt,
    rows: bondRows,
    columns: [
      { key: "code", label: "Code", type: "mono" },
      { key: "issuer", label: "Issuer", type: "text" },
      { key: "type", label: "Type", type: "text" },
      { key: "rate", label: "Return (%)", type: "percent", align: "right" },
      { key: "frequency", label: "Frequency", type: "text" },
      { key: "faceValue", label: "Face value (MVR)", type: "currency", align: "right" },
      { key: "units", label: "Issue size (units)", type: "number", align: "right" },
      { key: "nominalValue", label: "Nominal value (MVR, calc.)", type: "currency", align: "right" },
      { key: "issued", label: "Issued", type: "date" },
      { key: "maturity", label: "Maturity", type: "date" },
    ],
    chart: { x: "code", y: "rate", kind: "bar" },
  },
  {
    id: "company-financials",
    name: "Company financial snapshot",
    description:
      "Illustrative annual financial figures for the nine tracked listed companies. These are sample values for interface development, not official company financials.",
    category: "Companies",
    sourceId: "maldex-financial-model",
    verification: "illustrative",
    updatedAt: modelSource.retrievedAt,
    rows: latestFinancialRows,
    columns: [
      { key: "code", label: "Code", type: "mono" },
      { key: "company", label: "Company", type: "text" },
      { key: "revenue", label: "Revenue (MVR m, illustrative)", type: "number", align: "right" },
      { key: "netProfit", label: "Net profit (MVR m, illustrative)", type: "number", align: "right" },
      { key: "totalAssets", label: "Assets (MVR m, illustrative)", type: "number", align: "right" },
      { key: "netMargin", label: "Net margin (%)", type: "number", align: "right" },
      { key: "roe", label: "ROE (%)", type: "number", align: "right" },
      { key: "eps", label: "EPS (MVR)", type: "number", align: "right" },
      { key: "pe", label: "P/E (calc.)", type: "number", align: "right" },
    ],
    chart: { x: "code", y: "revenue", kind: "bar" },
  },
  {
    id: "annual-financials",
    name: "Annual company financials (illustrative)",
    description:
      "Illustrative annual revenue, profit, assets, equity, EPS and dividends for the tracked companies, 2021–2025. Not official data.",
    category: "Companies",
    sourceId: "maldex-financial-model",
    verification: "illustrative",
    updatedAt: modelSource.retrievedAt,
    rows: annualRows,
    columns: [
      { key: "code", label: "Code", type: "mono" },
      { key: "company", label: "Company", type: "text" },
      { key: "year", label: "Year", type: "date" },
      { key: "revenue", label: "Revenue (MVR m)", type: "number", align: "right" },
      { key: "netProfit", label: "Net profit (MVR m)", type: "number", align: "right" },
      { key: "totalAssets", label: "Assets (MVR m)", type: "number", align: "right" },
      { key: "equity", label: "Equity (MVR m)", type: "number", align: "right" },
      { key: "eps", label: "EPS (MVR)", type: "number", align: "right" },
      { key: "dps", label: "DPS (MVR)", type: "number", align: "right" },
      { key: "netMargin", label: "Net margin (%)", type: "number", align: "right" },
      { key: "roe", label: "ROE (%)", type: "number", align: "right" },
    ],
  },
  {
    id: "dividends",
    name: "Dividend history (illustrative)",
    description:
      "Illustrative dividend per share history derived from the sample financial model. Not an official dividend record; check CMDA announcements for declared dividends.",
    category: "Companies",
    sourceId: "maldex-dividend-model",
    verification: "illustrative",
    updatedAt: modelSource.retrievedAt,
    rows: dividendRows,
    columns: [
      { key: "code", label: "Code", type: "mono" },
      { key: "company", label: "Company", type: "text" },
      { key: "year", label: "Year", type: "date" },
      { key: "eps", label: "EPS (MVR)", type: "number", align: "right" },
      { key: "dps", label: "DPS (MVR)", type: "number", align: "right" },
      { key: "payout", label: "Payout (%)", type: "number", align: "right" },
    ],
  },
];

export const DATASET_CATEGORIES = [...new Set(DATASETS.map((dataset) => dataset.category))];

export function getDataset(id: string): Dataset | undefined {
  return DATASETS.find((dataset) => dataset.id === id);
}

export const DATA_EXPLORER_STATS = {
  datasets: DATASETS.length,
  rows: DATASETS.reduce((sum, dataset) => sum + dataset.rows.length, 0),
  sources: new Set(DATASETS.map((dataset) => dataset.sourceId)).size,
  updatedAt: marketSource.retrievedAt,
};

export const COMPANY_OPTIONS = COMPANIES.map((company) => ({ code: company.code, name: company.shortName }));
