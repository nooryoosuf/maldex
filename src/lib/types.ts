export type ViewingMode = "simple" | "advanced";
export type Theme = "light" | "dark";

export type VerificationStatus =
  | "official-reported"
  | "derived"
  | "calculated"
  | "unavailable";

export type DataCategory = "market" | "company" | "economy" | "debt" | "disclosure";

export interface SourceRef {
  id: string;
  name: string;
  organisation: string;
  url: string;
  retrievedAt: string;
  verification: VerificationStatus;
  description: string;
  updateCadence: string;
}

export interface Company {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  sector: string;
  sectorGroup: "Financials" | "Telecom" | "Consumer & trade" | "Transport" | "Tourism" | "Insurance";
  summary: string;
  simpleSummary: string;
  website?: string;
  monogram: string;
}

export interface PricePoint {
  date: string;
  value: number | null;
}

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  value: number;
  trades: number;
}

export interface LatestTrade {
  code: string;
  lastDate: string | null;
  lastPrice: number | null;
  previousClose: number | null;
  changePct: number | null;
  volume: number;
  value: number;
  trades: number;
}

export interface OrderBookEntry {
  code: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}

export interface MarketSnapshot {
  index: number | null;
  indexDate: string | null;
  indexChangePct: number | null;
  indexChange30dPct: number | null;
  indexChange1yPct: number | null;
  marketCap: number | null;
  marketCapDate: string | null;
  marketCapChangePct: number | null;
  listedEquities: number;
  sessionValue: number;
  sessionVolume: number;
  sessionTrades: number;
  sessionDate: string | null;
  lastUpdated: string;
}

export interface AnnualFinancial {
  year: number;
  revenue: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  eps: number;
  dps: number;
}

export interface QuarterlyFinancial {
  label: string;
  periodEnd: string;
  revenue: number;
  netProfit: number;
}

export interface CorporateFiling {
  id: string;
  title: string;
  type: string;
  publishedAt: string;
  sourceUrl: string;
}

export interface CompanyFinancialProfile {
  code: string;
  sharesOutstanding: number | null;
  marketCap: number | null;
  lastPrice: number | null;
  filings: CorporateFiling[];
  verification: VerificationStatus;
}

export interface BondInstrument {
  id: string;
  issuer: string;
  issuerShort: string;
  name: string;
  code: string;
  isin: string | null;
  issueSizeUnits: number;
  faceValue: number;
  currency: string;
  returnRate: number | null;
  returnFrequency: "Annual" | "Semi Annual" | "Quarterly";
  issueDate: string;
  maturityDate: string;
  instrumentType: "Bond" | "Sukuk";
  sector: string;
}

export interface Disclosure {
  id: string;
  title: string;
  company: string;
  code: string | null;
  type: string;
  publishedAt: string;
  sourceUrl: string;
  sourcePage: string;
}

export interface IndicatorObservation {
  period: string;
  value: number;
}

export interface EconomicIndicator {
  id: string;
  key: string;
  name: string;
  unit: string;
  category: string;
  description: string;
  observations: IndicatorObservation[];
  latest: IndicatorObservation | null;
}

export interface DatasetColumn {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "percent" | "currency" | "mono";
  align?: "left" | "right";
  format?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  sourceId: string;
  verification: VerificationStatus;
  updatedAt: string;
  rows: Record<string, unknown>[];
  columns: DatasetColumn[];
  chart?: { x: string; y: string; kind: "line" | "area" | "bar" };
}
