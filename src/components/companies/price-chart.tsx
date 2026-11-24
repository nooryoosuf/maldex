"use client";

import { useState } from "react";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SegmentedControl } from "@/components/ui/segmented";
import { Badge } from "@/components/ui/badge";

const RANGES = ["1M", "3M", "6M", "1Y", "ALL"] as const;

export function CompanyPriceChart({
  seriesByRange,
  code,
}: {
  seriesByRange: Record<string, { date: string; value: number }[]>;
  code: string;
}) {
  const [range, setRange] = useState("1Y");
  const data = seriesByRange[range] ?? [];

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <SegmentedControl
          options={RANGES.map((value) => ({ value, label: value }))}
          value={range}
          onChange={setRange}
          ariaLabel={`${code} price chart range`}
          size="sm"
        />
        <Badge variant="outline">{data.length} trading days</Badge>
      </div>
      <TimeSeriesChart
        data={data as unknown as Record<string, unknown>[]}
        xKey="date"
        series={[{ key: "value", label: `${code} close` }]}
        kind="area"
        format="currency"
        range={range}
        height={300}
        yWidth={62}
      />
    </div>
  );
}

export function QuarterlyChart({
  data,
}: {
  data: { label: string; revenue: number; netProfit: number }[];
}) {
  return (
    <TimeSeriesChart
      data={data as unknown as Record<string, unknown>[]}
      xKey="label"
      series={[
        { key: "revenue", label: "Revenue" },
        { key: "netProfit", label: "Net profit" },
      ]}
      kind="bar"
      format="number"
      labelType="category"
      height={220}
      yWidth={44}
    />
  );
}
