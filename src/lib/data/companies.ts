import type { Company } from "@/lib/types";

export interface CompanyModelConfig {
  baseRevenue: number; // MVR millions, illustrative FY2021
  revenueGrowth: number;
  netMargin: number;
  baseAssets: number; // MVR millions, illustrative FY2021
  assetGrowth: number;
  liabilityRatio: number;
  payoutRatio: number;
  seasonality: [number, number, number, number];
  seed: number;
}

export const COMPANIES: Company[] = [
  {
    slug: "bank-of-maldives",
    code: "BML",
    name: "Bank of Maldives Plc",
    shortName: "Bank of Maldives",
    sector: "Banking",
    sectorGroup: "Financials",
    monogram: "BM",
    summary:
      "A Maldivian bank providing retail, business and Islamic banking through a nationwide branch network.",
    simpleSummary:
      "Bank of Maldives is a bank that serves individuals, businesses and the government across the Maldives.",
  },
  {
    slug: "dhiraagu",
    code: "DHR",
    name: "Dhivehi Raajjeyge Gulhun Plc",
    shortName: "Dhiraagu",
    sector: "Telecommunications",
    sectorGroup: "Telecom",
    monogram: "DH",
    summary:
      "One of the Maldives' national telecommunications operators, offering mobile, broadband and fixed-line services under the Dhiraagu brand.",
    simpleSummary:
      "Dhiraagu is a telecommunications company that provides mobile phone, internet and fixed-line services.",
  },
  {
    slug: "ooredoo-maldives",
    code: "OMPL",
    name: "Ooredoo Maldives Plc",
    shortName: "Ooredoo Maldives",
    sector: "Telecommunications",
    sectorGroup: "Telecom",
    monogram: "OO",
    summary:
      "A national telecommunications operator offering mobile, broadband and enterprise connectivity services in the Maldives.",
    simpleSummary:
      "Ooredoo Maldives is a telecommunications company providing mobile and internet services.",
  },
  {
    slug: "sto",
    code: "STO",
    name: "State Trading Organization Plc",
    shortName: "STO",
    sector: "Petroleum & general trade",
    sectorGroup: "Consumer & trade",
    monogram: "ST",
    summary:
      "A state-linked trading company involved in fuel, construction materials, pharmaceuticals and consumer goods.",
    simpleSummary:
      "STO imports and sells essential goods in the Maldives, including fuel and building materials.",
  },
  {
    slug: "mtcc",
    code: "MTCC",
    name: "Maldives Transport & Contracting Company Plc",
    shortName: "MTCC",
    sector: "Transportation & construction",
    sectorGroup: "Transport",
    monogram: "MT",
    summary:
      "A transport and construction company operating public ferry services, road construction and marine works.",
    simpleSummary:
      "MTCC runs ferry services and builds roads and marine infrastructure.",
  },
  {
    slug: "amana-takaful",
    code: "ATM",
    name: "Amana Takaful Maldives Plc",
    shortName: "Amana Takaful",
    sector: "Insurance",
    sectorGroup: "Insurance",
    monogram: "AT",
    summary:
      "A takaful (Islamic insurance) provider offering family and general takaful products in the Maldives.",
    simpleSummary:
      "Amana Takaful provides insurance that follows Islamic principles.",
  },
  {
    slug: "maldives-islamic-bank",
    code: "MIB",
    name: "Maldives Islamic Bank Plc",
    shortName: "Maldives Islamic Bank",
    sector: "Banking",
    sectorGroup: "Financials",
    monogram: "MI",
    summary:
      "A full-service Islamic bank offering Shariah-compliant retail, business and trade finance services.",
    simpleSummary:
      "Maldives Islamic Bank is a bank that provides financial services in line with Islamic principles.",
  },
  {
    slug: "mtdc",
    code: "MTDC",
    name: "Maldives Tourism Development Corporation Plc",
    shortName: "MTDC",
    sector: "Tourism",
    sectorGroup: "Tourism",
    monogram: "MD",
    summary:
      "A tourism development company with interests in resort and hotel operations in the Maldives.",
    simpleSummary:
      "MTDC develops and operates tourism businesses, including resorts and hotels.",
  },
  {
    slug: "centurion",
    code: "CPLC",
    name: "Centurion Plc",
    shortName: "Centurion",
    sector: "Shipping & logistics",
    sectorGroup: "Transport",
    monogram: "CE",
    summary:
      "A shipping and logistics company listed on the Maldives Stock Exchange.",
    simpleSummary:
      "Centurion is a shipping and logistics company.",
  },
];

export const COMPANY_MODEL: Record<string, CompanyModelConfig> = {
  BML: { baseRevenue: 4150, revenueGrowth: 0.092, netMargin: 0.302, baseAssets: 46800, assetGrowth: 0.081, liabilityRatio: 0.778, payoutRatio: 0.42, seasonality: [0.24, 0.25, 0.25, 0.26], seed: 11 },
  DHR: { baseRevenue: 3520, revenueGrowth: 0.071, netMargin: 0.281, baseAssets: 5220, assetGrowth: 0.055, liabilityRatio: 0.392, payoutRatio: 0.78, seasonality: [0.24, 0.245, 0.25, 0.265], seed: 23 },
  OMPL: { baseRevenue: 3180, revenueGrowth: 0.083, netMargin: 0.176, baseAssets: 4680, assetGrowth: 0.062, liabilityRatio: 0.441, payoutRatio: 0.66, seasonality: [0.245, 0.25, 0.25, 0.255], seed: 37 },
  STO: { baseRevenue: 13150, revenueGrowth: 0.101, netMargin: 0.034, baseAssets: 12100, assetGrowth: 0.088, liabilityRatio: 0.701, payoutRatio: 0.31, seasonality: [0.25, 0.24, 0.25, 0.26], seed: 41 },
  MTCC: { baseRevenue: 2960, revenueGrowth: 0.064, netMargin: 0.069, baseAssets: 6080, assetGrowth: 0.051, liabilityRatio: 0.487, payoutRatio: 0.38, seasonality: [0.23, 0.25, 0.255, 0.265], seed: 53 },
  ATM: { baseRevenue: 1280, revenueGrowth: 0.076, netMargin: 0.058, baseAssets: 2430, assetGrowth: 0.058, liabilityRatio: 0.633, payoutRatio: 0.34, seasonality: [0.245, 0.25, 0.25, 0.255], seed: 67 },
  MIB: { baseRevenue: 1980, revenueGrowth: 0.118, netMargin: 0.228, baseAssets: 9420, assetGrowth: 0.105, liabilityRatio: 0.812, payoutRatio: 0.36, seasonality: [0.24, 0.25, 0.25, 0.26], seed: 71 },
  MTDC: { baseRevenue: 790, revenueGrowth: 0.087, netMargin: 0.147, baseAssets: 4020, assetGrowth: 0.047, liabilityRatio: 0.283, payoutRatio: 0.44, seasonality: [0.28, 0.24, 0.22, 0.26], seed: 83 },
  CPLC: { baseRevenue: 1510, revenueGrowth: 0.058, netMargin: 0.051, baseAssets: 3120, assetGrowth: 0.044, liabilityRatio: 0.402, payoutRatio: 0.29, seasonality: [0.25, 0.25, 0.25, 0.25], seed: 97 },
};

export function getCompanyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((company) => company.slug === slug);
}

export function getCompanyByCode(code: string): Company | undefined {
  return COMPANIES.find((company) => company.code === code);
}

export const SECTOR_GROUPS = Array.from(new Set(COMPANIES.map((c) => c.sectorGroup)));
