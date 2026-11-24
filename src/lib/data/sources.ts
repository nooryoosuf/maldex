import masixData from "@/data/mse/masix.json";
import disclosureData from "@/data/cmda/disclosures.json";
import worldBankData from "@/data/worldbank/indicators.json";
import type { SourceRef } from "@/lib/types";

export const SOURCES: Record<string, SourceRef> = {
  "mse-market": {
    id: "mse-market",
    name: "MSE Insights — market data",
    organisation: "Maldives Stock Exchange",
    url: "https://stockexchange.mv/insights",
    retrievedAt: masixData.meta.retrievedAt,
    verification: "official-reported",
    description:
      "Official MASIX index, market capitalisation and trade history retrieved from the exchange's public CSV export. Prices are a snapshot, not a live feed.",
    updateCadence: "Trading days; snapshot retrieved manually in this preview",
  },
  "cmda-disclosures": {
    id: "cmda-disclosures",
    name: "InformInvestor disclosures",
    organisation: "Capital Market Development Authority",
    url: disclosureData.meta.sourceUrl,
    retrievedAt: disclosureData.meta.retrievedAt,
    verification: "official-reported",
    description:
      "Public disclosure headlines and official document links published by CMDA. Maldex indexes the metadata only; document contents are not extracted or verified.",
    updateCadence: "As published by issuers",
  },
  "mse-listed": {
    id: "mse-listed",
    name: "Listed securities directory",
    organisation: "Maldives Stock Exchange",
    url: "https://stockexchange.mv/listedcompanies",
    retrievedAt: "2026-11-24T14:40:00.000Z",
    verification: "official-reported",
    description:
      "Issuer names, security codes, ISINs and published debt-instrument terms from the MSE listed-securities directory.",
    updateCadence: "As updated by the exchange",
  },
  "worldbank": {
    id: "worldbank",
    name: "World Bank Open Data — Maldives",
    organisation: "World Bank",
    url: "https://data.worldbank.org/country/maldives",
    retrievedAt: worldBankData.meta.retrievedAt,
    verification: "official-reported",
    description:
      "Annual macroeconomic indicators for the Maldives from the World Bank Open Data API. Latest available year varies by indicator and can lag current conditions.",
    updateCadence: "Annual / irregular official releases",
  },
  "maldex-financial-model": {
    id: "maldex-financial-model",
    name: "Maldex illustrative financial model",
    organisation: "Maldex (sample data)",
    url: "/sources",
    retrievedAt: "2026-11-24T00:00:00.000Z",
    verification: "illustrative",
    description:
      "Sample company financial statements created for interface development. These are not official company figures and must not be used for investment decisions.",
    updateCadence: "Static sample — replace with verified reports",
  },
  "maldex-dividend-model": {
    id: "maldex-dividend-model",
    name: "Maldex illustrative dividend history",
    organisation: "Maldex (sample data)",
    url: "/sources",
    retrievedAt: "2026-11-24T00:00:00.000Z",
    verification: "illustrative",
    description:
      "Sample dividend per share history derived from the illustrative financial model. Not an official dividend record.",
    updateCadence: "Static sample — replace with verified announcements",
  },
  "maldex-derived": {
    id: "maldex-derived",
    name: "Maldex derived metrics",
    organisation: "Maldex",
    url: "/sources",
    retrievedAt: "2026-11-24T00:00:00.000Z",
    verification: "calculated",
    description:
      "Metrics calculated by Maldex from published inputs (for example changes, yields or nominal issue values). The calculation basis is shown with each metric.",
    updateCadence: "Recalculated on each data refresh",
  },
};

export const SOURCE_LIST = Object.values(SOURCES);

export function getSource(id: string): SourceRef {
  return SOURCES[id] ?? SOURCES["maldex-derived"];
}

export const DATA_STATUS = {
  market: "official-reported" as const,
  economic: "official-reported" as const,
  disclosures: "official-reported" as const,
  financials: "illustrative" as const,
  derived: "calculated" as const,
};
