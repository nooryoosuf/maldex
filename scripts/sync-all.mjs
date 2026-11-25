/**
 * Maldex — Orchestrated Daily Data Sync.
 *
 * Runs each official collector independently in a child process so a temporary
 * outage on any single government/exchange server never prevents the remaining
 * sources from updating cleanly.
 *
 * Usage: node scripts/sync-all.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const COLLECTORS = [
  { name: "MSE Market Data", script: "scripts/fetch-mse.mjs" },
  { name: "CMDA Disclosures", script: "scripts/fetch-disclosures.mjs" },
  { name: "MMA Monetary & FX", script: "scripts/fetch-mma.mjs" },
  { name: "World Bank Indicators", script: "scripts/fetch-worldbank.mjs" },
];

console.log(`=== Maldex Daily Data Sync (${new Date().toISOString()}) ===\n`);

const results = [];
for (const item of COLLECTORS) {
  console.log(`→ Syncing ${item.name} (${item.script})...`);
  const run = spawnSync(process.execPath, [path.join(process.cwd(), item.script)], {
    stdio: "inherit",
    timeout: 120_000,
  });
  const ok = run.status === 0;
  results.push({ name: item.name, ok });
  console.log(ok ? `✓ ${item.name} succeeded\n` : `⚠ ${item.name} kept existing snapshot (exit ${run.status})\n`);
}

console.log("=== Sync Summary ===");
for (const r of results) {
  console.log(`  ${r.ok ? "✓" : "⚠"} ${r.name}`);
}

const succeeded = results.filter((r) => r.ok).length;
console.log(`\nCompleted: ${succeeded}/${results.length} live feeds refreshed.`);
