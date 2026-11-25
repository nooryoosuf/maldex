"use client";

import { useMemo, useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SegmentedControl } from "@/components/ui/segmented";
import { SourceLabel } from "@/components/ui/source-label";
import { Trend } from "@/components/ui/trend";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMvr, formatNumber, pctChange } from "@/lib/format";
import type { MarketSnapshot, PricePoint } from "@/lib/types";

export type ActivityView = "index" | "cap" | "turnover" | "activity";

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
  const [range, setRange] = useState("1Y");
  const [view, setView] = useState<ActivityView>("index");

  const data = seriesByRange[range] ?? seriesByRange["1Y"] ?? seriesByRange["1M"];

  const chart = useMemo(() => {
    if (view === "index") {
      const pts = data.index.filter((p) => p.value !== null);
      const first = pts[0]?.value ?? null;
      const last = pts.at(-1)?.value ?? snapshot.index;
      return {
        title: "MASIX Exchange Index",
        description: "Official closing trajectory of the Maldives Stock Exchange benchmark index.",
        explanation:
          "MASIX measures the overall price level of listed Maldivian companies weighted by market size. Rising values mean listed shares gained aggregate market value over the selected window; flat segments reflect sessions without price changes.",
        headlineValue: last,
        headlineFormat: (v: number) => formatNumber(v, 2),
        periodDelta: pctChange(last, first),
        data: data.index as unknown as Record<string, unknown>[],
        series: [{ key: "value", label: "MASIX (pts)", color: "rgb(var(--chart-1))" }],
        format: "index" as const,
        kind: "area" as const,
        tableCols: [
          { key: "date", label: "Date" },
          { key: "value", label: "MASIX Close", format: "index" as const, digits: 2 },
        ],
        csv: `maldex-masix-${range.toLowerCase()}.csv`,
      };
    }
    if (view === "cap") {
      const first = data.cap[0]?.value ?? null;
      const last = data.cap.at(-1)?.value ?? snapshot.marketCap;
      return {
        title: "Total Market Capitalisation",
        description: "Combined equity valuation across all MSE listed issuers (share price × shares outstanding).",
        explanation:
          "Market capitalisation represents the total market value of all listed companies on the exchange. Because a few large issuers (such as Bank of Maldives, Dhiraagu, and Ooredoo) make up most of the exchange, movements in those stocks strongly shape the total.",
        headlineValue: last,
        headlineFormat: (v: number) => formatMvr(v, { compact: true }),
        periodDelta: pctChange(last, first),
        data: data.cap as unknown as Record<string, unknown>[],
        series: [{ key: "value", label: "Market Cap (MVR)", color: "rgb(var(--chart-2))" }],
        format: "compactCurrency" as const,
        kind: "area" as const,
        tableCols: [
          { key: "date", label: "Date" },
          { key: "value", label: "Market Cap (MVR)", format: "compactCurrency" as const },
        ],
        csv: `maldex-market-cap-${range.toLowerCase()}.csv`,
      };
    }
    if (view === "activity") {
      const totalVal = data.turnover.reduce((sum, r) => sum + r.value, 0);
      return {
        title: "Turnover Value & Trade Count",
        description: "Mixed view comparing daily MVR value traded (bars) against number of executed trades (line).",
        explanation:
          "Comparing turnover value with the number of trades helps distinguish broad retail trading from single institutional block trades. A tall bar with few trades indicates large block transactions.",
        headlineValue: totalVal,
        headlineFormat: (v: number) => formatMvr(v, { compact: true }),
        periodDelta: null,
        data: data.turnover as unknown as Record<string, unknown>[],
        series: [
          { key: "value", label: "Turnover (MVR)", type: "bar" as const, yAxisId: "left" as const, format: "compactCurrency" as const, color: "rgb(var(--chart-1))" },
          { key: "trades", label: "Executed trades", type: "line" as const, yAxisId: "right" as const, format: "number" as const, color: "rgb(var(--chart-3))" },
        ],
        format: "compactCurrency" as const,
        kind: "mixed" as const,
        tableCols: [
          { key: "date", label: "Date" },
          { key: "value", label: "Turnover (MVR)", format: "compactCurrency" as const },
          { key: "trades", label: "Trades", format: "number" as const, digits: 0 },
          { key: "volume", label: "Volume (units)", format: "volume" as const, digits: 0 },
        ],
        csv: `maldex-turnover-activity-${range.toLowerCase()}.csv`,
      };
    }
    const totalTurnover = data.turnover.reduce((sum, r) => sum + r.value, 0);
    return {
      title: "Daily Trading Turnover",
      description: "Total MVR value of shares traded on active sessions. Non-trading days are omitted rather than plotted as zero.",
      explanation:
        "Turnover shows how much money actually changed hands on each active trading day. Because the Maldives Stock Exchange is thinly traded, liquidity concentrates around results announcements and dividend dates.",
      headlineValue: totalTurnover,
      headlineFormat: (v: number) => formatMvr(v, { compact: true }),
      periodDelta: null,
      data: data.turnover as unknown as Record<string, unknown>[],
      series: [{ key: "value", label: "Turnover (MVR)", color: "rgb(var(--chart-3))" }],
      format: "compactCurrency" as const,
      kind: "bar" as const,
      tableCols: [
        { key: "date", label: "Date" },
        { key: "value", label: "Turnover (MVR)", format: "compactCurrency" as const },
        { key: "volume", label: "Volume", format: "volume" as const, digits: 0 },
      ],
      csv: `maldex-turnover-${range.toLowerCase()}.csv`,
    };
  }, [data, view, range, snapshot.index, snapshot.marketCap]);

  return (
    <section aria-labelledby="market-activity-heading">
      <ChartCard
        variant="featured"
        eyebrow="Exchange Workbench"
        title={chart.title}
        description={chart.description}
        explanation={chart.explanation}
        tableData={chart.data}
        tableColumns={chart.tableCols}
        csvFilename={chart.csv}
        expandable
        expandedChildren={
          <TimeSeriesChart
            data={chart.data}
            xKey="date"
            series={chart.series}
            kind={chart.kind}
            format={chart.format}
            rightFormat="number"
            range={range}
            height={420}
            yWidth={chart.format === "index" ? 46 : 62}
          />
        }
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
            <span className="font-mono text-[10px] text-faint">
              Active trading sessions · Official snapshot {formatDate(snapshot.indexDate, "long")}
            </span>
            <SourceLabel sourceId="mse-market" />
          </div>
        }
        bodyClassName="pt-3"
      >
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <AnimatedNumber
              value={chart.headlineValue}
              format={chart.headlineFormat}
              className="text-2xl font-semibold tracking-[-0.03em] text-ink"
            />
            {chart.periodDelta !== null ? (
              <span className="inline-flex items-center gap-1">
                <Trend value={chart.periodDelta} size="sm" />
                <span className="font-mono text-[10px] text-faint">({range})</span>
              </span>
            ) : (
              <Badge variant="outline">{range} cumulative</Badge>
            )}
          </div>

          <SegmentedControl
            options={[
              { value: "index", label: "MASIX" },
              { value: "cap", label: "Market Cap" },
              { value: "turnover", label: "Turnover" },
              { value: "activity", label: "Turnover + Trades" },
            ]}
            value={view}
            onChange={(value) => setView(value as ActivityView)}
            ariaLabel="Market chart metric"
            size="sm"
          />
        </div>

        <TimeSeriesChart
          data={chart.data}
          xKey="date"
          series={chart.series}
          kind={chart.kind}
          format={chart.format}
          rightFormat="number"
          range={range}
          height={295}
          yWidth={chart.format === "index" ? 46 : 60}
        />
      </ChartCard>

      <div className="mt-2.5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface px-4 py-3">
          <p className="mono-label">MASIX Close</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-mono text-lg font-semibold tracking-[-0.02em] text-ink">
              {formatNumber(snapshot.index, 2)}
            </span>
            <Trend value={snapshot.indexChangePct} size="sm" />
          </div>
          <p className="mt-0.5 font-mono text-[9.5px] text-faint">{formatDate(snapshot.indexDate)} · session close</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="mono-label">Equity Market Cap</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-mono text-lg font-semibold tracking-[-0.02em] text-ink">
              {formatMvr(snapshot.marketCap, { compact: true })}
            </span>
            <Trend value={snapshot.marketCapChangePct} size="sm" />
          </div>
          <p className="mt-0.5 font-mono text-[9.5px] text-faint">All listed equities · daily move</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="mono-label">Session Liquidity</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-mono text-lg font-semibold tracking-[-0.02em] text-ink">
              {formatMvr(snapshot.sessionValue, { compact: true })}
            </span>
            <span className="font-mono text-[10px] text-muted">{formatNumber(snapshot.sessionTrades)} trades</span>
          </div>
          <p className="mt-0.5 font-mono text-[9.5px] text-faint">
            {mostActive
              ? `Most active: ${mostActive.code} · ${formatMvr(mostActive.value, { compact: true })}`
              : "No trades in latest session"}
          </p>
        </div>
      </div>
    </section>
  );
}
