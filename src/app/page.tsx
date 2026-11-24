import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleDot, Database, LineChart } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TodayBrief } from "@/components/home/today-brief";
import { MarketSnapshot } from "@/components/home/market-snapshot";
import { EconomicPulse } from "@/components/home/economic-pulse";
import { InsightsPanel } from "@/components/home/insights-panel";
import { MarketActivity } from "@/components/home/market-activity";
import { LatestDevelopments } from "@/components/home/developments";
import { CompanyRail } from "@/components/home/company-rail";
import { DataIntegrityPanel } from "@/components/home/data-integrity";
import { getViewingMode } from "@/lib/preferences";
import {
  TIME_RANGES,
  getEquityTurnoverSeries,
  getIndexSeries,
  getMarketCapSeries,
  getMarketSnapshot,
  getMostActiveEquity,
  getTurnoverSeries,
} from "@/lib/data/market";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "What is happening in the Maldivian economy: market snapshot, economic indicators, official disclosures and plain-language observations.",
};

export default async function HomePage() {
  const mode = await getViewingMode();
  const snapshot = getMarketSnapshot();
  const active = getMostActiveEquity();

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
      <section className="grid gap-6 pb-8 pt-8 md:pt-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-positive" />
            </span>
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-muted">
              Maldives financial intelligence
            </span>
          </div>

          <h1 className="mt-4 max-w-[680px] text-balance text-[38px] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-4xl md:text-5xl">
            The Maldives, in numbers you can trace.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-muted md:text-md md:leading-7">
            Official market data, corporate disclosures and economic indicators — explained in plain language, with the
            source behind every figure. Built for citizens and analysts alike.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link href="/market" className={buttonVariants({ variant: "primary", size: "md" })}>
              Explore the market <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/sources" className={buttonVariants({ variant: "outline", size: "md" })}>
              How the data works
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3.5 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <CircleDot className="h-2.5 w-2.5 text-positive" /> Snapshot {formatDate(snapshot.indexDate)}
            </span>
            <span className="h-3 w-px bg-line-strong" />
            <span className="font-mono">MSE · CMDA · World Bank</span>
            <span className="h-3 w-px bg-line-strong" />
            <span className="inline-flex items-center gap-1.5">
              <Badge variant={mode === "simple" ? "accent" : "default"}>{mode}</Badge>
              <span>viewing mode</span>
            </span>
          </div>
        </div>

        <TodayBrief />
      </section>

      <MarketSnapshot />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <EconomicPulse mode={mode} />
        <div className="space-y-5">
          <InsightsPanel />
          <DataIntegrityPanel />
        </div>
      </div>

      <div className="mt-8">
        <MarketActivity
          seriesByRange={seriesByRange}
          snapshot={snapshot}
          mostActive={active ? { code: active.code, value: active.value, changePct: active.changePct } : null}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <LatestDevelopments mode={mode} />
        <div className="space-y-5">
          <CompanyRail />
          <section className="rounded-md border border-line bg-surface p-4">
            <p className="mono-label mb-1">Open data</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Every table has a download</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Use Data Explorer to filter datasets, choose columns and export CSV files with source metadata.
            </p>
            <Link
              href="/data-explorer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
            >
              Open Data Explorer <ArrowUpRight className="h-3 w-3" />
            </Link>
          </section>
        </div>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <div className="grid gap-px bg-line md:grid-cols-2">
          <div className="bg-surface p-5">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
              <p className="mono-label">Simple mode</p>
            </div>
            <h2 className="mt-2 text-base font-semibold tracking-[-0.015em] text-ink">Understand what happened</h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Plain-language explanations, context for every indicator, simpler tables and short summaries. The actual
              figure is always shown underneath.
            </p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Default · for everyone</p>
          </div>
          <div className="bg-surface p-5">
            <div className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
              <p className="mono-label">Advanced mode</p>
            </div>
            <h2 className="mt-2 text-base font-semibold tracking-[-0.015em] text-ink">Investigate the underlying numbers</h2>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              Exact figures, historical series, ratios, quarterly and annual data, source metadata, CSV export and
              document-level traceability.
            </p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">For analysts & researchers</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-5 py-3">
          <span className="text-[10.5px] text-muted">
            The switch is in the header and is remembered across pages and sessions.
          </span>
          <Link href="/sources" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Read the data principles <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
