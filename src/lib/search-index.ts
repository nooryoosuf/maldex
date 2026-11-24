import { BONDS } from "@/lib/data/bonds";
import { COMPANIES } from "@/lib/data/companies";
import { DISCLOSURES } from "@/lib/data/disclosures";
import { ECONOMIC_INDICATORS } from "@/lib/data/economy";
import { getCompanyMarketCap, getLatestPrice } from "@/lib/data/market";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: "Company" | "Security" | "Disclosure" | "Report" | "Economy" | "Page" | "Bond";
  keywords: string;
}

const pageItems: SearchItem[] = [
  { id: "page-overview", title: "Overview", subtitle: "Maldives economic overview", href: "/", category: "Page", keywords: "home economy snapshot dashboard" },
  { id: "page-market", title: "Market", subtitle: "Prices, trades, turnover and order book", href: "/market", category: "Page", keywords: "masix index price trading volume equity" },
  { id: "page-companies", title: "Companies", subtitle: "Listed company directory and comparison", href: "/companies", category: "Page", keywords: "issuers listed equities compare" },
  { id: "page-bonds", title: "Bonds & Sukuk", subtitle: "Debt instruments, maturities and cash flows", href: "/bonds", category: "Page", keywords: "debt sukuk coupon yield maturity" },
  { id: "page-economy", title: "Economy", subtitle: "Inflation, tourism, trade, reserves and debt", href: "/economy", category: "Page", keywords: "gdp inflation tourism reserves fiscal trade" },
  { id: "page-disclosures", title: "Disclosures", subtitle: "Official corporate filings and financial reports", href: "/disclosures", category: "Page", keywords: "cmda reports annual quarterly agm dividend" },
  { id: "page-explorer", title: "Data Explorer", subtitle: "Datasets, tables and CSV export", href: "/data-explorer", category: "Page", keywords: "data csv table download api" },
  { id: "page-sources", title: "Data sources", subtitle: "Provenance, verification and refresh status", href: "/sources", category: "Page", keywords: "source provenance verification methodology" },
];

const companyItems: SearchItem[] = COMPANIES.map((company) => {
  const price = getLatestPrice(company.code);
  const cap = getCompanyMarketCap(company.code);
  return {
    id: `company-${company.code}`,
    title: company.shortName,
    subtitle: `${company.code} · ${company.sector}${price ? ` · MVR ${price.toLocaleString("en-GB")}` : ""}${cap ? ` · ${(cap / 1e9).toFixed(2)}bn market cap` : ""}`,
    href: `/companies/${company.slug}`,
    category: "Company",
    keywords: `${company.name} ${company.code} ${company.sector} ${company.summary}`,
  };
});

const disclosureItems: SearchItem[] = DISCLOSURES.filter((item) => item.publishedAt >= "2025-01-01").map(
  (item) => ({
    id: `disclosure-${item.id}`,
    title: item.title,
    subtitle: `${item.company} · ${item.publishedAt} · ${item.type}`,
    href: `/disclosures/${item.id}`,
    category: item.type === "Financial report" || item.type === "Annual report" ? "Report" : "Disclosure",
    keywords: `${item.company} ${item.code ?? ""} ${item.type} ${item.title} ${item.publishedAt}`,
  }),
);

const bondItems: SearchItem[] = BONDS.map((bond) => ({
  id: `bond-${bond.id}`,
  title: `${bond.code} — ${bond.issuerShort}`,
  subtitle: `${bond.instrumentType} · ${bond.returnRate !== null ? `${bond.returnRate}%` : "return not published"} · matures ${bond.maturityDate}`,
  href: `/bonds/${bond.id}`,
  category: "Bond",
  keywords: `${bond.issuer} ${bond.code} ${bond.isin ?? ""} ${bond.instrumentType} ${bond.sector} bond sukuk debt`,
}));

const economyItems: SearchItem[] = ECONOMIC_INDICATORS.map((indicator) => ({
  id: `indicator-${indicator.key}`,
  title: indicator.name,
  subtitle: `${indicator.latest?.period ?? "—"} · ${indicator.latest?.value ?? "—"} ${indicator.unit}`,
  href: `/economy#${indicator.key}`,
  category: "Economy",
  keywords: `${indicator.name} ${indicator.description} ${indicator.unit} ${indicator.id}`,
}));

export const SEARCH_INDEX: SearchItem[] = [
  ...pageItems,
  ...companyItems,
  ...bondItems,
  ...economyItems,
  ...disclosureItems,
];

export function searchItems(query: string, limit = 40): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SEARCH_INDEX.slice(0, limit);
  const terms = q.split(/\s+/).filter(Boolean);
  return SEARCH_INDEX.filter((item) => {
    const haystack = `${item.title} ${item.subtitle} ${item.keywords} ${item.category}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).slice(0, limit);
}
