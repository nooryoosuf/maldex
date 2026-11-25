import mmaData from "@/data/mma/indicators.json";

export interface ReserveObservation {
  period: string;
  value: number; // in USD millions
}

export interface ExchangeRateRow {
  currency: string;
  name: string;
  rate: number;
  regime: string;
  unit: string;
}

export interface TreasuryBillRow {
  tenor: string;
  days: number;
  rate: number; // annual percentage
  currency: string;
  issuer: string;
}

export interface MonetaryAggregateRow {
  period: string;
  broadMoneyM2: number; // MVR millions
  domesticCredit: number; // MVR millions
  privateCredit: number; // MVR millions
}

export interface MonthlyTourismRow {
  period: string;
  arrivals: number;
  occupancyRate: number;
}

export const MMA_META = mmaData.meta;
export const MMA_GROSS_RESERVES = mmaData.reserves.gross as ReserveObservation[];
export const MMA_USABLE_RESERVES = mmaData.reserves.usable as ReserveObservation[];
export const MMA_EXCHANGE_RATES = mmaData.exchangeRates as ExchangeRateRow[];
export const MMA_TREASURY_BILLS = mmaData.treasuryBills as TreasuryBillRow[];
export const MMA_MONETARY_AGGREGATES = mmaData.monetaryAggregates as MonetaryAggregateRow[];
export const MMA_MONTHLY_TOURISM = mmaData.monthlyTourism as MonthlyTourismRow[];

export function getLatestGrossReserves(): ReserveObservation {
  return MMA_GROSS_RESERVES.at(-1)!;
}

export function getLatestUsableReserves(): ReserveObservation {
  return MMA_USABLE_RESERVES.at(-1)!;
}

export function getReserveSeries(): { period: string; gross: number; usable: number }[] {
  return MMA_GROSS_RESERVES.map((g, i) => ({
    period: g.period,
    gross: g.value,
    usable: MMA_USABLE_RESERVES[i]?.value ?? 0,
  }));
}
