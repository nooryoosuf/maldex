/**
 * Maldex — MSE public data collector.
 *
 * Retrieves the public CSV exports offered by the Maldives Stock Exchange
 * insights page using dynamic rolling date windows, validates responses,
 * and preserves existing snapshots if an upstream endpoint fails.
 *
 * Usage: node scripts/fetch-mse.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://stockexchange.mv";
const OUT = path.join(process.cwd(), "src", "data", "mse");
const now = new Date();
const RETRIEVED_AT = now.toISOString();
const TODAY = RETRIEVED_AT.slice(0, 10);

const twoYearsAgoDate = new Date(now);
twoYearsAgoDate.setUTCFullYear(twoYearsAgoDate.getUTCFullYear() - 2);
const TWO_YEARS_AGO = twoYearsAgoDate.toISOString().slice(0, 10);

const HEADERS = {
  "user-agent": "Mozilla/5.0 (compatible; MaldexBot/1.0; +https://maldex.nooryoosuf.com)",
  accept: "text/html,application/xhtml+xml,text/csv,*/*",
};

async function readExistingJson(filename) {
  try {
    const raw = await readFile(path.join(OUT, filename), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((v) => v !== "")) rows.push(row);
  }
  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(header.map((h, i) => [h.trim(), cells[i]?.trim() ?? ""])),
  );
}

function toIso(date) {
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const m = date?.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (!m) return date;
  return `${m[3]}-${months[m[2]] ?? "01"}-${m[1]}`;
}

async function getToken() {
  const res = await fetch(`${BASE}/insights`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Insights page HTTP ${res.status}`);
  const html = await res.text();
  const token = html.match(/name="_token"\s+value="([^"]+)"/)?.[1];
  if (!token) throw new Error("Could not locate MSE CSRF form token");
  const cookies = (res.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
  return { token, cookies, html };
}

async function exportCsv({ token, cookies }, data, stock, from, to) {
  const body = new URLSearchParams({ _token: token, data, stock, from, to });
  const res = await fetch(`${BASE}/insights/export`, {
    method: "POST",
    headers: {
      ...HEADERS,
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookies,
    },
    body,
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`Export ${data} ${stock} failed: HTTP ${res.status}`);
  const text = await res.text();
  if (!text.includes(",")) throw new Error(`Export ${data} returned non-CSV body`);
  return text;
}

const meta = {
  source: "Maldives Stock Exchange — Insights",
  sourceUrl: "https://stockexchange.mv/insights",
  retrievedAt: RETRIEVED_AT,
  verification: "official-reported",
  note:
    "Published by MSE. Historical series are official exchange data retrieved via the public CSV export. Re-verify against the source before use in decisions.",
};

await mkdir(OUT, { recursive: true });
const auth = await getToken();

// 1. MASIX index — full available history through today
const masixCsv = await exportCsv(auth, "masix", "*", "2006-11-14", TODAY);
const masixFetched = parseCsv(masixCsv)
  .map((r) => ({ date: toIso(r.Date), value: Number(r.Index) }))
  .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(r.value) && r.value > 0);

const existingMasix = await readExistingJson("masix.json");
const mergedMasix = [...new Map([
  ...(existingMasix?.observations ?? []).map((o) => [o.date, o]),
  ...masixFetched.map((o) => [o.date, o]),
]).values()].sort((a, b) => a.date.localeCompare(b.date));

if (mergedMasix.length < 100) {
  throw new Error(`MASIX sanity check failed (${mergedMasix.length} rows)`);
}
await writeFile(
  path.join(OUT, "masix.json"),
  JSON.stringify({ meta: { ...meta, dataset: "MASIX index", unit: "index points" }, observations: mergedMasix }, null, 2),
);
console.log(`MASIX: ${mergedMasix.length} observations (latest ${mergedMasix.at(-1)?.date})`);

// 2. Market capitalisation — full available history through today
const capCsv = await exportCsv(auth, "market-cap", "*", "2006-11-14", TODAY);
const capRows = parseCsv(capCsv);
const capCodes = Object.keys(capRows[0] ?? {}).filter((k) => k !== "Date");
const capFetched = capRows
  .map((r) => ({
    date: toIso(r.Date),
    total: Number(r.Total),
    bySecurity: Object.fromEntries(capCodes.filter((c) => c !== "Total").map((c) => [c, Number(r[c])])),
  }))
  .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(r.total) && r.total > 0);

const existingCap = await readExistingJson("market-cap.json");
const mergedCap = [...new Map([
  ...(existingCap?.observations ?? []).map((o) => [o.date, o]),
  ...capFetched.map((o) => [o.date, o]),
]).values()].sort((a, b) => a.date.localeCompare(b.date));

if (mergedCap.length < 100) {
  throw new Error(`Market cap sanity check failed (${mergedCap.length} rows)`);
}
await writeFile(
  path.join(OUT, "market-cap.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Market capitalisation", unit: "MVR" }, observations: mergedCap }, null, 2),
);
console.log(`Market cap: ${mergedCap.length} observations (latest ${mergedCap.at(-1)?.date})`);

// 3. Trade history (rolling 2-year window merged with recent trades)
const tradesCsv = await exportCsv(auth, "trades", "*", TWO_YEARS_AGO, TODAY);
const fetchedTrades = parseCsv(tradesCsv)
  .map((r) => ({
    date: toIso(r.Date),
    code: r.Stock,
    quantity: Number(r.Quantity),
    price: Number(r["Price per Share (MVR)"]),
    value: Number(r["Value (MVR)"]),
  }))
  .filter((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.date) && t.code && Number.isFinite(t.price));

const existingTrades = await readExistingJson("trades.json");
// Keep existing dates outside fetched window (within 2 years) + replace fetched dates cleanly
const fetchedDates = new Set(fetchedTrades.map((t) => t.date));
const retainedTrades = (existingTrades?.trades ?? []).filter(
  (t) => t.date >= TWO_YEARS_AGO && !fetchedDates.has(t.date),
);
const trades = [...retainedTrades, ...fetchedTrades].sort((a, b) => a.date.localeCompare(b.date));

if (trades.length < 20) {
  throw new Error(`Trades sanity check failed (${trades.length} rows)`);
}
await writeFile(
  path.join(OUT, "trades.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Trade history", period: `${TWO_YEARS_AGO} to ${TODAY}` }, trades }, null, 2),
);
console.log(`Trades: ${trades.length} rows (latest ${trades.at(-1)?.date})`);

// 4. Derive daily bars + summary per security
const barsByCode = {};
for (const t of trades) {
  const code = t.code;
  barsByCode[code] ??= {};
  const day = (barsByCode[code][t.date] ??= {
    date: t.date,
    open: t.price,
    high: t.price,
    low: t.price,
    close: t.price,
    volume: 0,
    value: 0,
    trades: 0,
  });
  day.high = Math.max(day.high, t.price);
  day.low = Math.min(day.low, t.price);
  day.close = t.price;
  day.volume += t.quantity;
  day.value += t.value;
  day.trades += 1;
}
const bars = Object.fromEntries(
  Object.entries(barsByCode).map(([code, days]) => [
    code,
    Object.values(days).sort((a, b) => a.date.localeCompare(b.date)),
  ]),
);
await writeFile(
  path.join(OUT, "daily-bars.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Daily bars derived from trade history" }, bars }, null, 2),
);

const summary = Object.entries(bars).map(([code, b]) => {
  const last = b.at(-1);
  const prev = b.at(-2);
  return {
    code,
    lastDate: last?.date,
    lastPrice: last?.close,
    previousClose: prev?.close ?? null,
    changePct: prev && prev.close > 0 ? ((last.close - prev.close) / prev.close) * 100 : null,
    volume: last?.volume ?? 0,
    value: last?.value ?? 0,
    trades: last?.trades ?? 0,
  };
});
await writeFile(
  path.join(OUT, "latest-trades.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Latest daily trade summary" }, summary }, null, 2),
);

// 5. Equity order book snapshot
const orderBookSection = auth.html.split('id="EquityOrderBook"')[1]?.split('id="BondOrderBook"')[0] ?? "";
const orderBook = [...orderBookSection.matchAll(/<tr[^>]*class="record[^"]*"[\s\S]*?<\/tr>/g)]
  .map((m) => {
    const cells = [...m[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) =>
      c[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    );
    if (cells.length < 4) return null;
    return {
      code: cells[0],
      side: cells[1].toUpperCase().includes("SELL") ? "SELL" : "BUY",
      quantity: Number(cells[2].replaceAll(",", "")),
      price: Number(cells[3].replaceAll(",", "")),
    };
  })
  .filter((o) => o && o.code && Number.isFinite(o.price));

if (orderBook.length > 0) {
  await writeFile(
    path.join(OUT, "order-book.json"),
    JSON.stringify({ meta: { ...meta, dataset: "Equity order book snapshot" }, orders: orderBook }, null, 2),
  );
  console.log(`Order book: ${orderBook.length} rows`);
} else {
  console.log("Order book: 0 rows parsed, keeping existing snapshot");
}
