import type { Company } from "@/lib/types";

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

export function getCompanyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((company) => company.slug === slug);
}

export function getCompanyByCode(code: string): Company | undefined {
  return COMPANIES.find((company) => company.code === code);
}

export const SECTOR_GROUPS = Array.from(new Set(COMPANIES.map((c) => c.sectorGroup)));
