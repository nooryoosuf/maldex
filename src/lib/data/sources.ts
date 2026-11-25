import masixData from "@/data/mse/masix.json";
import disclosureData from "@/data/cmda/disclosures.json";
import worldBankData from "@/data/worldbank/indicators.json";
import mmaData from "@/data/mma/indicators.json";
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
    updateCadence: "Trading days; snapshot retrieved from official exchange files",
  },
  "cmda-disclosures": {
    id: "cmda-disclosures",
    name: "InformInvestor disclosures",
    organisation: "Capital Market Development Authority",
    url: disclosureData.meta.sourceUrl,
    retrievedAt: disclosureData.meta.retrievedAt,
    verification: "official-reported",
    description:
      "Public disclosure headlines and official document links published by CMDA. Maldex indexes the metadata and links directly to official audited annual and quarterly filings.",
    updateCadence: "As published by listed issuers",
  },
  "mma-statistics": {
    id: "mma-statistics",
    name: "MMA Monthly Statistics & Database",
    organisation: "Maldives Monetary Authority",
    url: "https://statistics.mma.gov.mv/",
    retrievedAt: mmaData.meta.retrievedAt,
    verification: "official-reported",
    description:
      "Official central bank reserves, usable reserves, MVR exchange rates, Treasury bill yields, broad money (M2) and domestic credit from the Maldives Monetary Authority.",
    updateCadence: "Monthly official releases and continuous statistical series",
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
  "maldex-derived": {
    id: "maldex-derived",
    name: "Maldex derived metrics",
    organisation: "Maldex",
    url: "/sources",
    retrievedAt: "2026-11-25T00:00:00.000Z",
    verification: "calculated",
    description:
      "Metrics calculated by Maldex from published inputs (for example percentage changes, yields, shares outstanding or nominal issue values). The calculation basis is shown with each metric.",
    updateCadence: "Recalculated on each data refresh",
  },
};

export const SOURCE_LIST = Object.values(SOURCES);

export function getSource(id: string): SourceRef {
  return SOURCES[id] ?? SOURCES["maldex-derived"];
}

export const DATA_STATUS = {
  market: "official-reported" as const,
  monetary: "official-reported" as const,
  economic: "official-reported" as const,
  disclosures: "official-reported" as const,
  debt: "official-reported" as const,
  derived: "calculated" as const,
};
