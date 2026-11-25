"use client";

import { useMemo, useState } from "react";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SegmentedControl } from "@/components/ui/segmented";
import { Trend } from "@/components/ui/trend";
import { Badge } from "@/components/ui/badge";
import { pctChange } from "@/lib/format";

const RANGES = ["1M", "3M", "6M", "1Y", "ALL"] as const;

export function CompanyPriceChart({
  seriesByRange,
  barsByRange,
  code,
  height = 300,
}: {
  seriesByRange: Record<string, { date: string; value: number }[]>;
  barsByRange?: Record<string, { date: string; close: number; volume: number }[]>;
  code: string;
  height?: number;
}) {
  const [range, setRange] = useState("1Y");
  const [mode, setMode] = useState<"price" | "priceVolume">("price");

  const data = seriesByRange[range] ?? [];
  const barData = barsByRange?.[range] ?? [];

  const rangeDelta = useMemo(() => {
    if (data.length < 2) return null;
    return pctChange(data.at(-1)?.value ?? null, data[0]?.value ?? null);
  }, [data]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            options={RANGES.map((value) => ({ value, label: value }))}
            value={range}
            onChange={setRange}
            ariaLabel={`${code} price chart range`}
            size="sm"
          />
          {barsByRange ? (
            <SegmentedControl
              options={[
                { value: "price", label: "Price" },
                { value: "priceVolume", label: "Price + Volume" },
              ]}
              value={mode}
              onChange={(v) => setMode(v as "price" | "priceVolume")}
              ariaLabel="Chart display mode"
              size="sm"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {rangeDelta !== null ? <Trend value={rangeDelta} size="sm" /> : null}
          <Badge variant="outline">{data.length} sessions</Badge>
        </div>
      </div>

      {mode === "priceVolume" && barData.length > 0 ? (
        <TimeSeriesChart
          data={barData as unknown as Record<string, unknown>[]}
          xKey="date"
          series={[
            {
              key: "volume",
              label: "Volume (units)",
              type: "bar",
              yAxisId: "right",
              format: "volume",
              color: "rgb(var(--chart-5))",
            },
            {
              key: "close",
              label: `${code} Close (MVR)`,
              type: "line",
              yAxisId: "left",
              format: "currency",
              color: "rgb(var(--chart-1))",
            },
          ]}
          kind="mixed"
          format="currency"
          rightFormat="volume"
          range={range}
          height={height}
          yWidth={58}
          rightYWidth={46}
          digits={2}
        />
      ) : (
        <TimeSeriesChart
          data={data as unknown as Record<string, unknown>[]}
          xKey="date"
          series={[{ key: "value", label: `${code} Close (MVR)`, color: "rgb(var(--chart-1))" }]}
          kind="area"
          format="currency"
          range={range}
          height={height}
          yWidth={58}
          digits={2}
        />
      )}
    </div>
  );
}
