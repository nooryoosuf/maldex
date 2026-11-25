import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleDot, Database, Landmark, Layers, LineChart } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TodayBrief } from "@/components/home/today-brief";
import { MarketSnapshot } from "@/components/home/market-snapshot";
import { EconomicPulse } from "@/components/home/economic-pulse";
import { InsightsPanel } from "@/components/home/insights-panel";
import { MarketActivity } from "@/components/home/market-activity";
import { MacroReserveCard } from "@/components/home/macro-reserve-card";
import { LatestDevelopments } from "@/components/home/developments";
import { CompanyRail } from "@/components/home/company-rail";
import { DataIntegrityPanel } from "@/components/home/data-integrity";

import {
  TIME_RANGES,
  getEquityTurnoverSeries,
  getIndexSeries,
  getMarketCapSeries,
  getMarketSnapshot,
  getMostActiveEquity,
  getTurnoverSeries,
} from "@/lib/data/market";
import { getLatestUsableReserves } from "@/lib/data/mma";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Maldives financial and economic intelligence: official MSE market snapshots, MMA central bank reserves, corporate disclosures and plain-language observations.",
};

export default async function HomePage() {
  const snapshot = getMarketSnapshot();
  const active = getMostActiveEquity();
  const usableReserves = getLatestUsableReserves();

  const seriesByRange = Object.fromEntries(
    TIME_RANGES.map((range) => [
      range,
      {
        index: getIndexSeries(range),
        cap: getMarketCapSeries(range),
        turnover: getTurnoverSeries(range),
        equityTurnover: getEquityTurnoverSeries(range),
      },
    ]),
  );

  return (
    <PageContainer>
      {/* Level 1 — Editorial Header, Live Pulse Strip & Today's Brief */}
      <section className="grid gap-6 pb-7 pt-7 md:pt-10 lg:grid-cols-[minmax(0,1.42fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 shadow-[0_1px_2px_rgba(15,23,32,0.03)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
              </span>
              <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted">
                Maldives Economic & Market Intelligence
              </span>
            </div>

            <h1 className="mt-4 max-w-[660px] text-balance text-[36px] font-semibold leading-[1.03] tracking-[-0.045em] text-ink sm:text-4xl md:text-5xl">
              The Maldives, in numbers you can trace.
            </h1>
            <p className="mt-3.5 max-w-xl text-pretty text-sm leading-6 text-muted md:text-[15px] md:leading-[25px]">
              Official stock exchange activity, central bank reserve buffers, corporate filings, and macroeconomic
              indicators—structured with plain-language context and direct institutional links.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link href="/market" className={buttonVariants({ variant: "primary", size: "md" })}>
                Explore Market <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/economy" className={buttonVariants({ variant: "outline", size: "md" })}>
                <Landmark className="h-3.5 w-3.5 text-accent" /> Economy & MMA
              </Link>
              <Link href="/data-explorer" className={buttonVariants({ variant: "ghost", size: "md" })}>
                Data Explorer
              </Link>
            </div>
          </div>

          {/* High-Signal Macro & Exchange Ticker Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">MASIX Index</p>
              <p className="num mt-0.5 font-mono text-sm font-semibold text-ink">
                {formatNumber(snapshot.index, 2)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Usable Reserves</p>
              <p className="num mt-0.5 font-mono text-sm font-semibold text-ink">
                US$ {formatNumber(usableReserves.value, 1)}M
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Currency Peg</p>
              <p className="num mt-0.5 font-mono text-sm font-semibold text-ink">15.42 MVR/USD</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Snapshot Date</p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-muted">
                <CircleDot className="h-2.5 w-2.5 text-positive" />
                {formatDate(snapshot.indexDate)}
              </p>
            </div>
          </div>
        </div>

        <TodayBrief />
      </section>

      {/* Level 1 — Key Exchange KPIs */}
      <MarketSnapshot />

      {/* Level 2 — Primary Interactive Visual Exploration (Promoted Hero Charts) */}
      <div className="mt-8">
        <MarketActivity
          seriesByRange={seriesByRange}
          snapshot={snapshot}
          mostActive={active ? { code: active.code, value: active.value, changePct: active.changePct } : null}
        />
      </div>

      {/* Level 2 — Central Bank Visuals + Plain-Language Macro Pulse */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <MacroReserveCard />
        <InsightsPanel />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <EconomicPulse mode="simple" />
        <CompanyRail />
      </div>

      {/* Level 3 — Detailed Stream, Open Data & Verification */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <LatestDevelopments mode="simple" />
        <div className="space-y-5">
          <DataIntegrityPanel />

          <section className="surface-panel p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
              <p className="mono-label">Open datasets</p>
            </div>
            <h2 className="mt-1 text-sm font-semibold tracking-[-0.01em] text-ink">
              Inspect, chart & export any table
            </h2>
            <p className="mt-1 text-[11.5px] leading-5 text-muted">
              Switch between chart and table views across 17 official datasets or export UTF-8 CSV extracts with full provenance metadata.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/data-explorer"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline"
              >
                Open Data Explorer <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link
                href="/bonds"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted hover:text-ink"
              >
                Bonds & Sukuk <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Viewing Mode Explainer Strip */}
      <section className="mt-10 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="grid gap-px bg-line md:grid-cols-2">
          <div className="bg-surface p-5">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
              <p className="mono-label">Simple mode · Default</p>
            </div>
            <h2 className="mt-1.5 text-[15px] font-semibold tracking-[-0.015em] text-ink">
              Plain-language clarity first
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Designed for everyday citizens: clear context, human-readable summaries, and interactive{" "}
              <span className="font-medium text-ink">“What does this mean?”</span> explainers alongside every verified figure.
            </p>
          </div>
          <div className="bg-surface p-5">
            <div className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
              <p className="mono-label">Advanced mode · Research</p>
            </div>
            <h2 className="mt-1.5 text-[15px] font-semibold tracking-[-0.015em] text-ink">
              Technical precision & raw series
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Built for analysts and researchers: World Bank & MMA series codes, historical observation drawers,
              derived capital-structure parameters, and instant CSV exports.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/35 px-5 py-2.5">
          <span className="text-[11px] text-muted">
            Switch between <Badge variant="outline">Simple</Badge> and <Badge variant="outline">Advanced</Badge> anytime in the top navigation bar.
          </span>
          <Link href="/sources" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Verification & methodology <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
