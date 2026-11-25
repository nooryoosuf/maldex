/**
 * Maldex — CMDA InformInvestor disclosure index collector.
 *
 * Fetches the public disclosure listing and merges new items with existing
 * indexed disclosures so historical filings are never lost.
 *
 * Usage: node scripts/fetch-disclosures.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = "https://informinvestor.cmda.gov.mv/disclosures";
const OUT = path.join(process.cwd(), "src", "data", "cmda");
const FILE = path.join(OUT, "disclosures.json");
const RETRIEVED_AT = new Date().toISOString();

const COMPANY_CODES = {
  "Amana Takaful Maldives": "ATM",
  "Bank of Maldives": "BML",
  "Centurion": "CPLC",
  "Dhivehi Raajjeyge Gulhun Plc": "DHR",
  "Housing Development Finance Corporation": "HDFC",
  "Maldives Islamic Bank": "MIB",
  "Maldives Tourism Development Corporation": "MTDC",
  "Maldives Transport & Contracting Company": "MTCC",
  "Ooredoo Maldives": "OMPL",
  "State Trading Organization": "STO",
};

function decode(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function classify(title) {
  const t = title.toLowerCase();
  if (t.includes("quarter") || t.includes("quarterly")) return "Financial report";
  if (t.includes("annual report") || t.includes("audited")) return "Annual report";
  if (t.includes("dividend")) return "Dividend";
  if (t.includes("egm")) return "EGM";
  if (t.includes("agm")) return "AGM";
  if (t.includes("book clos")) return "General disclosure";
  if (
    t.includes("director") ||
    t.includes("chairman") ||
    t.includes("board") ||
    t.includes("ceo") ||
    t.includes("managing director") ||
    t.includes("secretary")
  ) {
    return "Board & governance";
  }
  if (t.includes("esg")) return "ESG";
  if (t.includes("press release")) return "Press release";
  return "General disclosure";
}

let existing = [];
try {
  const prev = JSON.parse(await readFile(FILE, "utf8"));
  existing = Array.isArray(prev.disclosures) ? prev.disclosures : [];
} catch {
  existing = [];
}

const res = await fetch(SOURCE_URL, {
  headers: {
    "user-agent": "Mozilla/5.0 (compatible; MaldexBot/1.0; +https://maldex.nooryoosuf.com)",
    accept: "text/html,application/xhtml+xml,*/*",
  },
  signal: AbortSignal.timeout(30_000),
});
if (!res.ok) throw new Error(`CMDA Disclosures HTTP ${res.status}`);
const html = await res.text();

const cards = [...html.matchAll(/<div class="disclosure-card[\s\S]*?<\/div>\s*<\/div>\s*<\/a>\s*<\/div>/g)].map((m) => m[0]);
const fetched = [];
for (const card of cards) {
  const url = card.match(/href="([^"]+)"/)?.[1];
  const date = card.match(/<h6 class="text-gray-500">([^<]+)<\/h6>/)?.[1]?.trim();
  const title = decode(card.match(/<h6 class="text-gray-700[^"]*">([^<]+)<\/h6>/)?.[1]?.trim() ?? "");
  const company = decode(card.match(/<strong[^>]*>([^<]+)<\/strong>/)?.[1]?.trim() ?? "");
  if (!url || !date || !title || !company) continue;
  const parsedDate = new Date(`${date} 00:00:00 UTC`);
  if (Number.isNaN(parsedDate.getTime())) continue;
  const publishedAt = parsedDate.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) continue;
  fetched.push({
    id: url.split("/").pop(),
    title,
    company,
    code: COMPANY_CODES[company] ?? null,
    type: classify(title),
    publishedAt,
    sourceUrl: url,
    sourcePage: SOURCE_URL,
  });
}

if (fetched.length === 0 && existing.length > 0) {
  throw new Error("CMDA page returned 0 parsed disclosure cards; keeping existing file");
}

// Merge existing + newly fetched (newly fetched wins on matching IDs)
const mergedMap = new Map(existing.map((d) => [String(d.id), d]));
let newCount = 0;
for (const item of fetched) {
  if (!mergedMap.has(String(item.id))) newCount++;
  mergedMap.set(String(item.id), item);
}

const deduped = [...mergedMap.values()].sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt) || Number(b.id) - Number(a.id),
);

await mkdir(OUT, { recursive: true });
await writeFile(
  FILE,
  JSON.stringify(
    {
      meta: {
        source: "CMDA InformInvestor",
        sourceUrl: SOURCE_URL,
        retrievedAt: RETRIEVED_AT,
        verification: "official-reported",
        note:
          "Headline metadata and official detail links from the CMDA public disclosure listing. Document contents have not been extracted or verified by Maldex.",
      },
      disclosures: deduped,
    },
    null,
    2,
  ),
);
console.log(`CMDA Disclosures: ${deduped.length} total (${newCount} newly added)`);
