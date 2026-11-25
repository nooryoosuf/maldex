"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SegmentedControl } from "@/components/ui/segmented";
import { SourceLabel } from "@/components/ui/source-label";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Badge } from "@/components/ui/badge";
import {
  MMA_MONTHLY_TOURISM,
  getLatestGrossReserves,
  getLatestUsableReserves,
  getReserveSeries,
} from "@/lib/data/mma";
import { formatNumber, formatPercent } from "@/lib/format";

type MacroTab = "reserves" | "tourism";

export function MacroReserveCard() {
  const [tab, setTab] = useState<MacroTab>("reserves");
  const reserveSeries = getReserveSeries();
  const latestGross = getLatestGrossReserves();
  const latestUsable = getLatestUsableReserves();
  const latestTourism = MMA_MONTHLY_TOURISM.at(-1)!;

  return (
    <ChartCard
      eyebrow="Central Bank · MMA"
      title={tab === "reserves" ? "Foreign Reserves Buffer" : "Monthly Tourism & Occupancy"}
      description={
        tab === "reserves"
          ? "Gross official reserves vs. immediately usable foreign currency reserves (US$ millions)."
          : "Monthly visitor arrivals (bars) alongside resort & hotel bed occupancy rates (line)."
      }
      explanation={
        tab === "reserves"
          ? "Gross reserves include all central bank foreign assets, while usable reserves subtract short-term foreign currency liabilities and predetermined drains—showing the net buffer available to support essential imports and the 15.42 MVR/USD peg."
          : "Tourism is the Maldives' primary source of foreign currency inflows. Tracking monthly arrivals alongside bed occupancy reveals seasonal peaks and resort capacity utilisation."
      }
      actions={
        <SegmentedControl
          options={[
            { value: "reserves", label: "Reserves" },
            { value: "tourism", label: "Tourism" },
          ]}
          value={tab}
          onChange={(v) => setTab(v as MacroTab)}
          ariaLabel="Macro chart view"
          size="sm"
        />
      }
      tableData={
        tab === "reserves"
          ? (reserveSeries as unknown as Record<string, unknown>[])
          : (MMA_MONTHLY_TOURISM as unknown as Record<string, unknown>[])
      }
      tableColumns={
        tab === "reserves"
          ? [
              { key: "period", label: "Period" },
              { key: "gross", label: "Gross (US$ m)", format: "usdMillions", digits: 1 },
              { key: "usable", label: "Usable (US$ m)", format: "usdMillions", digits: 1 },
            ]
          : [
              { key: "period", label: "Month" },
              { key: "arrivals", label: "Arrivals", format: "number", digits: 0 },
              { key: "occupancyRate", label: "Occupancy (%)", format: "percent", digits: 1 },
            ]
      }
      csvFilename={tab === "reserves" ? "maldex-mma-reserves.csv" : "maldex-mma-tourism.csv"}
      expandable
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SourceLabel sourceId="mma-statistics" showDate={false} />
          <Link href="/economy#mma" className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline">
            Central Bank analytics <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-1">
        {tab === "reserves" ? (
          <div className="flex flex-wrap items-baseline gap-2.5">
            <AnimatedNumber
              value={latestUsable.value}
              format={(v) => `US$ ${formatNumber(v, 1)}M`}
              className="text-xl font-semibold tracking-[-0.025em] text-ink"
            />
            <Badge variant="accent">Usable · {latestUsable.period}</Badge>
            <span className="font-mono text-[10.5px] text-muted">
              of US$ {formatNumber(latestGross.value, 1)}M Gross
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-2.5">
            <AnimatedNumber
              value={latestTourism.arrivals}
              format={(v) => `${formatNumber(v, 0)} arrivals`}
              className="text-xl font-semibold tracking-[-0.025em] text-ink"
            />
            <Badge variant="positive">
              {formatPercent(latestTourism.occupancyRate, 1)} occupancy · {latestTourism.period}
            </Badge>
          </div>
        )}
      </div>

      {tab === "reserves" ? (
        <TimeSeriesChart
          data={reserveSeries as unknown as Record<string, unknown>[]}
          xKey="period"
          series={[
            { key: "gross", label: "Gross Reserves", color: "rgb(var(--chart-1))" },
            { key: "usable", label: "Usable Reserves", color: "rgb(var(--chart-2))" },
          ]}
          kind="area"
          format="usdMillions"
          labelType="category"
          height={235}
          yWidth={52}
          digits={1}
        />
      ) : (
        <TimeSeriesChart
          data={MMA_MONTHLY_TOURISM as unknown as Record<string, unknown>[]}
          xKey="period"
          series={[
            {
              key: "arrivals",
              label: "Arrivals",
              type: "bar",
              yAxisId: "left",
              format: "number",
              color: "rgb(var(--chart-5))",
            },
            {
              key: "occupancyRate",
              label: "Occupancy (%)",
              type: "line",
              yAxisId: "right",
              format: "percent",
              color: "rgb(var(--chart-3))",
            },
          ]}
          kind="mixed"
          format="number"
          rightFormat="percent"
          labelType="category"
          height={235}
          yWidth={46}
          rightYWidth={40}
        />
      )}
    </ChartCard>
  );
}
