/**
 * Maldex — MSE public data collector.
 *
 * Retrieves the public CSV exports offered by the Maldives Stock Exchange
 * insights page. No authentication is used. Outputs are stored as JSON with
 * source + retrieval metadata so the UI can display provenance.
 *
 * Usage: node scripts/fetch-mse.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://stockexchange.mv";
const OUT = path.join(process.cwd(), "src", "data", "mse");
const RETRIEVED_AT = new Date().toISOString();

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
  return body.map((cells) =>
    Object.fromEntries(header.map((h, i) => [h.trim(), cells[i]?.trim() ?? ""])),
  );
}

function toIso(date) {
  // MSE uses DD-Mon-YYYY
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const m = date.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (!m) return date;
  return `${m[3]}-${months[m[2]] ?? "01"}-${m[1]}`;
}

async function getToken() {
  const res = await fetch(`${BASE}/insights`, {
    headers: { "user-agent": "Maldex data collector (research preview)" },
  });
  if (!res.ok) throw new Error(`Insights page ${res.status}`);
  const html = await res.text();
  const token = html.match(/name="_token" value="([^"]+)"/)?.[1];
  if (!token) throw new Error("Could not locate form token");
  const cookies = (res.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
  return { token, cookies };
}

async function exportCsv({ token, cookies }, data, stock, from, to) {
  const body = new URLSearchParams({ _token: token, data, stock, from, to });
  const res = await fetch(`${BASE}/insights/export`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookies,
      "user-agent": "Maldex data collector (research preview)",
    },
    body,
  });
  if (!res.ok) throw new Error(`Export ${data} ${stock} failed: ${res.status}`);
  const text = await res.text();
  if (!text.includes(",")) throw new Error(`Export ${data} returned no CSV`);
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

const auth = await getToken();
await mkdir(OUT, { recursive: true });

// 1. MASIX index — full available history
const masixCsv = await exportCsv(auth, "masix", "*", "2006-11-14", "2026-11-24");
const masix = parseCsv(masixCsv)
  .map((r) => ({ date: toIso(r.Date), value: Number(r.Index) }))
  .filter((r) => r.date && Number.isFinite(r.value));
await writeFile(
  path.join(OUT, "masix.json"),
  JSON.stringify({ meta: { ...meta, dataset: "MASIX index", unit: "index points" }, observations: masix }, null, 2),
);
console.log(`MASIX: ${masix.length} observations`);

// 2. Market capitalisation — full available history
const capCsv = await exportCsv(auth, "market-cap", "*", "2006-11-14", "2026-11-24");
const capRows = parseCsv(capCsv);
const capCodes = Object.keys(capRows[0] ?? {}).filter((k) => k !== "Date");
const cap = capRows.map((r) => ({
  date: toIso(r.Date),
  total: Number(r.Total),
  bySecurity: Object.fromEntries(capCodes.filter((c) => c !== "Total").map((c) => [c, Number(r[c])])),
}));
await writeFile(
  path.join(OUT, "market-cap.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Market capitalisation", unit: "MVR" }, observations: cap }, null, 2),
);
console.log(`Market cap: ${cap.length} observations`);

// 3. Trade history (two years) — used for daily OHLC, volume and latest trades
const tradesCsv = await exportCsv(auth, "trades", "*", "2024-11-24", "2026-11-24");
const trades = parseCsv(tradesCsv)
  .map((r) => ({
    date: toIso(r.Date),
    code: r.Stock,
    quantity: Number(r.Quantity),
    price: Number(r["Price per Share (MVR)"]),
    value: Number(r["Value (MVR)"]),
  }))
  .filter((t) => t.date && t.code && Number.isFinite(t.price));
await writeFile(
  path.join(OUT, "trades.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Trade history", period: "2024-11-24 to 2026-11-24" }, trades }, null, 2),
);
console.log(`Trades: ${trades.length} rows`);

// 4. Derive daily bars + summary per security (still official inputs)
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
    previousClose: prev?.close,
    changePct: prev ? ((last.close - prev.close) / prev.close) * 100 : null,
    volume: last?.volume ?? 0,
    value: last?.value ?? 0,
    trades: last?.trades ?? 0,
  };
});
await writeFile(
  path.join(OUT, "latest-trades.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Latest daily trade summary" }, summary }, null, 2),
);

// 5. Equity order book snapshot (scraped from public insights table)
const page = await fetch(`${BASE}/insights`, {
  headers: { "user-agent": "Maldex data collector (research preview)" },
}).then((r) => r.text());
const orderBookSection = page.split('id="EquityOrderBook"')[1]?.split('id="BondOrderBook"')[0] ?? "";
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
await writeFile(
  path.join(OUT, "order-book.json"),
  JSON.stringify({ meta: { ...meta, dataset: "Equity order book snapshot" }, orders: orderBook }, null, 2),
);
console.log(`Order book: ${orderBook.length} rows`);

console.log(`Saved to ${OUT}`);
