/**
 * Maldex — World Bank Open Data collector.
 *
 * Pulls annual Maldives indicators from the public World Bank API.
 * Outputs a single provenance-tagged dataset consumed by the Economy page.
 *
 * Usage: node scripts/fetch-worldbank.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "src", "data", "worldbank");
const RETRIEVED_AT = new Date().toISOString();

const INDICATORS = [
  { id: "NY.GDP.MKTP.KD.ZG", key: "gdpGrowth", name: "GDP growth", unit: "% annual", category: "national", description: "Annual growth in gross domestic product at constant prices." },
  { id: "NY.GDP.MKTP.CD", key: "gdpUsd", name: "GDP", unit: "US$", category: "national", description: "Gross domestic product at current market prices." },
  { id: "NY.GDP.PCAP.CD", key: "gdpPerCapita", name: "GDP per person", unit: "US$", category: "national", description: "Gross domestic product divided by midyear population." },
  { id: "SP.POP.TOTL", key: "population", name: "Population", unit: "people", category: "national", description: "Total population, midyear estimate." },
  { id: "FP.CPI.TOTL.ZG", key: "inflation", name: "Inflation", unit: "% annual", category: "prices", description: "Annual percentage change in the consumer price index." },
  { id: "ST.INT.ARVL", key: "touristArrivals", name: "International tourist arrivals", unit: "arrivals", category: "tourism", description: "Overnight international visitor arrivals." },
  { id: "ST.INT.RCPT.CD", key: "tourismReceipts", name: "International tourism receipts", unit: "US$", category: "tourism", description: "Expenditure by international inbound visitors, including payments to carriers." },
  { id: "GC.XPN.TOTL.GD.ZS", key: "govExpense", name: "Government expense", unit: "% of GDP", category: "fiscal", description: "Cash payments for operating activities of the government." },
  { id: "GC.TAX.TOTL.GD.ZS", key: "taxRevenue", name: "Tax revenue", unit: "% of GDP", category: "fiscal", description: "Compulsory transfers to the central government for public purposes." },
  { id: "GC.DOD.TOTL.GD.ZS", key: "govDebt", name: "Central government debt", unit: "% of GDP", category: "debt", description: "Total central government debt as a share of GDP." },
  { id: "NE.EXP.GNFS.ZS", key: "exports", name: "Exports of goods & services", unit: "% of GDP", category: "trade", description: "Value of all goods and services exported as a share of GDP." },
  { id: "NE.IMP.GNFS.ZS", key: "imports", name: "Imports of goods & services", unit: "% of GDP", category: "trade", description: "Value of all goods and services imported as a share of GDP." },
  { id: "NE.TRD.GNFS.ZS", key: "trade", name: "Trade openness", unit: "% of GDP", category: "trade", description: "Sum of exports and imports of goods and services as a share of GDP." },
  { id: "BN.CAB.XOKA.GD.ZS", key: "currentAccount", name: "Current account balance", unit: "% of GDP", category: "trade", description: "Current account balance as a share of GDP." },
  { id: "BX.KLT.DINV.WD.GD.ZS", key: "fdi", name: "Foreign direct investment", unit: "% of GDP", category: "trade", description: "Net inflows of investment to acquire a lasting management interest." },
  { id: "BX.TRF.PWKR.DT.GD.ZS", key: "remittances", name: "Personal remittances", unit: "% of GDP", category: "external", description: "Personal transfers and compensation of employees received from abroad." },
  { id: "FI.RES.TOTL.CD", key: "reserves", name: "Total reserves", unit: "US$", category: "monetary", description: "Official holdings of monetary gold, SDRs and foreign exchange." },
  { id: "FS.AST.PRVT.GD.ZS", key: "privateCredit", name: "Domestic credit to private sector", unit: "% of GDP", category: "monetary", description: "Financial resources provided to the private sector by financial corporations." },
  { id: "PA.NUS.FCRF", key: "exchangeRate", name: "Official exchange rate", unit: "MVR per US$", category: "monetary", description: "Official exchange rate, annual period average." },
  { id: "SL.UEM.TOTL.ZS", key: "unemployment", name: "Unemployment", unit: "% of labour force", category: "labour", description: "Share of the labour force that is without work but available for work." },
  { id: "SP.DYN.LE00.IN", key: "lifeExpectancy", name: "Life expectancy at birth", unit: "years", category: "social", description: "Number of years a newborn would live if prevailing patterns stayed constant." },
];

async function fetchIndicator(ind) {
  const url = `https://api.worldbank.org/v2/country/MDV/indicator/${ind.id}?format=json&per_page=200`;
  const res = await fetch(url, { headers: { "user-agent": "Maldex data collector (research preview)" } });
  if (!res.ok) throw new Error(`${ind.id}: HTTP ${res.status}`);
  const json = await res.json();
  const observations = (json[1] ?? [])
    .filter((row) => row.value !== null)
    .map((row) => ({ period: row.date, value: Number(row.value) }))
    .sort((a, b) => a.period.localeCompare(b.period));
  return { ...ind, observations, latest: observations.at(-1) ?? null };
}

await mkdir(OUT, { recursive: true });
const results = [];
for (const ind of INDICATORS) {
  try {
    const data = await fetchIndicator(ind);
    results.push(data);
    console.log(`${ind.key}: ${data.observations.length} obs, latest ${data.latest?.period ?? "—"}`);
  } catch (err) {
    console.error(`${ind.key}: ${err.message}`);
  }
}

const payload = {
  meta: {
    source: "World Bank Open Data",
    sourceUrl: "https://data.worldbank.org/country/maldives",
    apiUrl: "https://api.worldbank.org/v2/country/MDV/indicator",
    retrievedAt: RETRIEVED_AT,
    verification: "official-reported",
    note:
      "Annual indicators published by the World Bank. Values may lag current conditions; the latest available period is shown. Not a live or monthly series.",
  },
  indicators: results,
};
await writeFile(path.join(OUT, "indicators.json"), JSON.stringify(payload, null, 2));
console.log(`Saved ${results.length} indicators to ${OUT}`);
