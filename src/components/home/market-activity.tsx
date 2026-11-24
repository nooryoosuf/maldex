"use client";

import { useMemo, useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SegmentedControl } from "@/components/ui/segmented";
import { SourceLabel } from "@/components/ui/source-label";
import { Trend } from "@/components/ui/trend";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMvr, formatNumber } from "@/lib/format";
import type { MarketSnapshot, PricePoint } from "@/lib/types";

export type ActivityView = "index" | "cap" | "turnover";

export interface ActivitySeries {
  index: PricePoint[];
  cap: { date: string; value: number }[];
  turnover: { date: string; value: number; volume: number; trades: number }[];
}

export function MarketActivity({
  seriesByRange,
  snapshot,
  mostActive,
}: {
  seriesByRange: Record<string, ActivitySeries>;
  snapshot: MarketSnapshot;
  mostActive: { code: string; value: number; changePct: number | null } | null;
}) {
  const [range, setRange] = useState("1M");
  const [view, setView] = useState<ActivityView>("index");

  const data = seriesByRange[range] ?? seriesByRange["1M"];
  const chart = useMemo(() => {
    if (view === "index") {
      return {
        title: "MASIX index",
        description: "Daily closing level of the Maldives Stock Exchange index.",
        data: data.index,
        series: [{ key: "value", label: "MASIX" }],
        format: "index" as const,
        kind: "area" as const,
      };
    }
    if (view === "cap") {
      return {
        title: "Market capitalisation",
        description: "Combined market value of listed equities, as published by MSE.",
        data: data.cap,
        series: [{ key: "value", label: "Market cap" }],
        format: "compactCurrency" as const,
        kind: "area" as const,
      };
    }
    return {
      title: "Trading turnover",
      description: "Value of trades executed on each trading day. Non-trading days are not plotted as zero.",
      data: data.turnover,
      series: [{ key: "value", label: "Turnover" }],
      format: "compactCurrency" as const,
      kind: "bar" as const,
    };
  }, [data, view]);

  return (
    <section aria-labelledby="market-activity-heading">
      <ChartCard
        eyebrow="Market activity"
        title={chart.title}
        description={chart.description}
        actions={
          <SegmentedControl
            options={[
              { value: "1W", label: "1W" },
              { value: "1M", label: "1M" },
              { value: "3M", label: "3M" },
              { value: "6M", label: "6M" },
              { value: "1Y", label: "1Y" },
              { value: "ALL", label: "ALL" },
            ]}
            value={range}
            onChange={setRange}
            ariaLabel="Chart time range"
            size="sm"
          />
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-faint">
              Trading days only · snapshot, not a live feed · {formatDate(snapshot.indexDate, "long")}
            </span>
            <SourceLabel sourceId="mse-market" />
          </div>
        }
        bodyClassName="pt-3"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <SegmentedControl
            options={[
              { value: "index", label: "Index" },
              { value: "cap", label: "Market cap" },
              { value: "turnover", label: "Turnover" },
            ]}
            value={view}
            onChange={(value) => setView(value as ActivityView)}
            ariaLabel="Market chart view"
            size="sm"
          />
          <div className="flex items-center gap-2">
            <Badge variant="outline">MSE</Badge>
            <span className="font-mono text-[10px] text-faint">{data.index.length} points in range</span>
          </div>
        </div>
        <TimeSeriesChart
          data={chart.data as unknown as Record<string, unknown>[]}
          xKey="date"
          series={chart.series}
          kind={chart.kind}
          format={chart.format}
          range={range}
          height={292}
          yWidth={chart.format === "index" ? 44 : 62}
        />
      </ChartCard>

      <div className="mt-2 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface px-4 py-3">
          <p className="mono-label">MASIX</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-mono text-lg font-medium tracking-[-0.02em] text-ink">{formatNumber(snapshot.index, 2)}</span>
            <Trend value={snapshot.indexChangePct} size="sm" />
          </div>
          <p className="mt-0.5 font-mono text-[9.5px] text-faint">{formatDate(snapshot.indexDate)} · daily change</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="mono-label">Market capitalisation</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-mono text-lg font-medium tracking-[-0.02em] text-ink">{formatMvr(snapshot.marketCap, { compact: true })}</span>
            <Trend value={snapshot.marketCapChangePct} size="sm" />
          </div>
          <p className="mt-0.5 font-mono text-[9.5px] text-faint">All listed equities · daily change</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="mono-label">Latest session</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-mono text-lg font-medium tracking-[-0.02em] text-ink">{formatMvr(snapshot.sessionValue, { compact: true })}</span>
            <span className="font-mono text-[10px] text-muted">{formatNumber(snapshot.sessionTrades)} trades</span>
          </div>
          <p className="mt-0.5 font-mono text-[9.5px] text-faint">
            {mostActive ? `Most active: ${mostActive.code} · ${formatMvr(mostActive.value, { compact: true })}` : "No trades in the latest session"}
          </p>
        </div>
      </div>
    </section>
  );
}
