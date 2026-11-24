/**
 * Maldex — CMDA InformInvestor disclosure index collector.
 *
 * Reads the public disclosure listing and stores metadata + official detail
 * links. No document content is reproduced. Output is a provenance-tagged
 * index used by the Disclosures feed.
 *
 * Usage: node scripts/fetch-disclosures.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = "https://informinvestor.cmda.gov.mv/disclosures";
const OUT = path.join(process.cwd(), "src", "data", "cmda");
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
  if (t.includes("director") || t.includes("chairman") || t.includes("board") || t.includes("ceo") || t.includes("managing director") || t.includes("secretary")) return "Board & governance";
  if (t.includes("esg")) return "ESG";
  if (t.includes("press release")) return "Press release";
  return "General disclosure";
}

const res = await fetch(SOURCE_URL, {
  headers: { "user-agent": "Maldex data collector (research preview)" },
});
if (!res.ok) throw new Error(`Disclosures ${res.status}`);
const html = await res.text();

const cards = [...html.matchAll(/<div class="disclosure-card[\s\S]*?<\/div>\s*<\/div>\s*<\/a>\s*<\/div>/g)].map((m) => m[0]);
const disclosures = [];
for (const card of cards) {
  const url = card.match(/href="([^"]+)"/)?.[1];
  const date = card.match(/<h6 class="text-gray-500">([^<]+)<\/h6>/)?.[1]?.trim();
  const title = decode(card.match(/<h6 class="text-gray-700[^"]*">([^<]+)<\/h6>/)?.[1]?.trim() ?? "");
  const company = decode(card.match(/<strong[^>]*>([^<]+)<\/strong>/)?.[1]?.trim() ?? "");
  if (!url || !date || !title || !company) continue;
  const publishedAt = new Date(`${date} 00:00:00 UTC`).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) continue;
  disclosures.push({
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

const deduped = [...new Map(disclosures.map((d) => [d.id, d])).values()].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

await mkdir(OUT, { recursive: true });
await writeFile(
  path.join(OUT, "disclosures.json"),
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
console.log(`Saved ${deduped.length} disclosures (${deduped.filter((d) => d.publishedAt.startsWith("2026")).length} from 2026)`);
