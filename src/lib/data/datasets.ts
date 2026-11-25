import { BONDS, nominalIssueValue } from "@/lib/data/bonds";
import { COMPANIES } from "@/lib/data/companies";
import { DISCLOSURES } from "@/lib/data/disclosures";
import { ECONOMIC_INDICATORS, getIndicatorRows } from "@/lib/data/economy";
import { getCompanyComparison } from "@/lib/data/financials";
import {
  DAILY_TURNOVER,
  MARKET_CAP_SERIES,
  MASIX_SERIES,
  TRADES,
} from "@/lib/data/market";
import {
  MMA_EXCHANGE_RATES,
  MMA_GROSS_RESERVES,
  MMA_MONETARY_AGGREGATES,
  MMA_MONTHLY_TOURISM,
  MMA_TREASURY_BILLS,
  MMA_USABLE_RESERVES,
} from "@/lib/data/mma";
import { getSource } from "@/lib/data/sources";
import type { Dataset } from "@/lib/types";

const marketSource = getSource("mse-market");
const worldBankSource = getSource("worldbank");
const cmdaSource = getSource("cmda-disclosures");
const mseListedSource = getSource("mse-listed");
const mmaSource = getSource("mma-statistics");

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

const companyRows = comparisonRows.map((row) => ({
  code: row.code,
  company: row.name,
  sector: row.sector,
  price: row.price,
  marketCap: row.marketCap,
  shares: row.shares,
  changePct: row.changePct,
  volume: row.volume,
  turnover: row.value,
  lastTrade: row.lastDate,
  filingsCount: row.filingsCount,
}));

const reserveRows = MMA_GROSS_RESERVES.map((item, idx) => ({
  period: item.period,
  gross: item.value,
  usable: MMA_USABLE_RESERVES[idx]?.value ?? null,
}));

const exchangeRows = MMA_EXCHANGE_RATES.map((row) => ({
  currency: row.currency,
  name: row.name,
  rate: row.rate,
  regime: row.regime,
  unit: row.unit,
}));

const tbillRows = MMA_TREASURY_BILLS.map((row) => ({
  tenor: row.tenor,
  days: row.days,
  rate: row.rate,
  currency: row.currency,
  issuer: row.issuer,
}));

const monetaryRows = MMA_MONETARY_AGGREGATES.map((row) => ({
  period: row.period,
  broadMoneyM2: row.broadMoneyM2,
  domesticCredit: row.domesticCredit,
  privateCredit: row.privateCredit,
}));

const tourismRows = MMA_MONTHLY_TOURISM.map((row) => ({
  period: row.period,
  arrivals: row.arrivals,
  occupancy: row.occupancyRate,
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
    id: "mse-companies",
    name: "Listed equities snapshot",
    description:
      "Official MSE listed equity issuer metrics including current trading prices, market capitalisation, shares outstanding, and filing counts.",
    category: "Companies",
    sourceId: "mse-market",
    verification: "official-reported",
    updatedAt: marketSource.retrievedAt,
    rows: companyRows,
    columns: [
      { key: "code", label: "Code", type: "mono" },
      { key: "company", label: "Company", type: "text" },
      { key: "sector", label: "Sector", type: "text" },
      { key: "price", label: "Price (MVR)", type: "currency", align: "right" },
      { key: "marketCap", label: "Market Cap (MVR)", type: "currency", align: "right" },
      { key: "shares", label: "Shares", type: "number", align: "right" },
      { key: "filingsCount", label: "Disclosures", type: "number", align: "right" },
    ],
    chart: { x: "code", y: "marketCap", kind: "bar" },
  },
  {
    id: "mma-reserves",
    name: "MMA Official Foreign Reserves",
    description:
      "Official Gross Reserves and Usable Reserves published by the Maldives Monetary Authority in USD millions.",
    category: "Monetary",
    sourceId: "mma-statistics",
    verification: "official-reported",
    updatedAt: mmaSource.retrievedAt,
    rows: reserveRows,
    columns: [
      { key: "period", label: "Period", type: "date" },
      { key: "gross", label: "Gross Reserves (USD m)", type: "number", align: "right" },
      { key: "usable", label: "Usable Reserves (USD m)", type: "number", align: "right" },
    ],
    chart: { x: "period", y: "gross", kind: "line" },
  },
  {
    id: "mma-exchange-rates",
    name: "MMA Foreign Exchange Rates",
    description:
      "Official central bank exchange rates against the Maldivian Rufiyaa (MVR), highlighting the USD 15.42 peg regime.",
    category: "Monetary",
    sourceId: "mma-statistics",
    verification: "official-reported",
    updatedAt: mmaSource.retrievedAt,
    rows: exchangeRows,
    columns: [
      { key: "currency", label: "Currency", type: "mono" },
      { key: "name", label: "Name", type: "text" },
      { key: "rate", label: "Rate (MVR)", type: "number", align: "right" },
      { key: "regime", label: "Regime", type: "text" },
    ],
  },
  {
    id: "mma-treasury-bills",
    name: "MMA Treasury Bill Yields",
    description:
      "Government of Maldives Treasury Bill auction interest rates across standard maturities issued via the Maldives Monetary Authority.",
    category: "Monetary",
    sourceId: "mma-statistics",
    verification: "official-reported",
    updatedAt: mmaSource.retrievedAt,
    rows: tbillRows,
    columns: [
      { key: "tenor", label: "Tenor", type: "text" },
      { key: "days", label: "Maturity (days)", type: "number", align: "right" },
      { key: "rate", label: "Yield (% p.a.)", type: "percent", align: "right" },
      { key: "currency", label: "Currency", type: "mono" },
    ],
    chart: { x: "tenor", y: "rate", kind: "bar" },
  },
  {
    id: "mma-monetary-aggregates",
    name: "MMA Broad Money & Credit",
    description:
      "Monetary aggregates including Broad Money (M2), domestic credit, and credit to private sector from MMA Monthly Statistics in MVR millions.",
    category: "Monetary",
    sourceId: "mma-statistics",
    verification: "official-reported",
    updatedAt: mmaSource.retrievedAt,
    rows: monetaryRows,
    columns: [
      { key: "period", label: "Period", type: "date" },
      { key: "broadMoneyM2", label: "Broad Money M2 (MVR m)", type: "number", align: "right" },
      { key: "domesticCredit", label: "Domestic Credit (MVR m)", type: "number", align: "right" },
      { key: "privateCredit", label: "Private Credit (MVR m)", type: "number", align: "right" },
    ],
    chart: { x: "period", y: "broadMoneyM2", kind: "line" },
  },
  {
    id: "mma-tourism",
    name: "MMA Monthly Tourism Arrivals",
    description:
      "Monthly tourist arrivals and resort/hotel bed occupancy rates published in MMA Monthly Statistics.",
    category: "Economy",
    sourceId: "mma-statistics",
    verification: "official-reported",
    updatedAt: mmaSource.retrievedAt,
    rows: tourismRows,
    columns: [
      { key: "period", label: "Month", type: "text" },
      { key: "arrivals", label: "Arrivals", type: "number", align: "right" },
      { key: "occupancy", label: "Occupancy (%)", type: "percent", align: "right" },
    ],
    chart: { x: "period", y: "arrivals", kind: "bar" },
  },
  {
    id: "disclosures",
    name: "Corporate disclosures",
    description:
      "Headline metadata and official document links from the CMDA InformInvestor disclosure index. Includes audited annual statements and quarterly reports.",
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
    id: "gdp-growth",
    name: "GDP growth",
    description:
      "Annual real GDP growth for the Maldives, from the World Bank Open Data API.",
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
