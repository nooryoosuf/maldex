"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Database, LineChart } from "lucide-react";
import { DATASETS } from "@/lib/data/datasets";
import type { Dataset } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { SegmentedControl } from "@/components/ui/segmented";
import { SourceLabel } from "@/components/ui/source-label";
import { DataBadge } from "@/components/ui/data-badge";
import { TimeSeriesChart, type ChartSeries, type TimeSeriesKind } from "@/components/charts/time-series-chart";
import type { ChartFormat } from "@/components/charts/chart-tooltip";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

const CATEGORIES = ["All", ...Array.from(new Set(DATASETS.map((dataset) => dataset.category)))];

function inferChartFormat(dataset: Dataset): ChartFormat {
  const id = dataset.id;
  if (id === "masix-index") return "index";
  if (id === "market-cap" || id === "daily-turnover" || id === "mse-companies") return "compactCurrency";
  if (id === "mma-reserves") return "usdMillions";
  if (
    id === "mma-treasury-bills" ||
    id === "gdp-growth" ||
    id === "inflation" ||
    id === "current-account" ||
    id === "bonds"
  ) {
    return "percent";
  }
  return "number";
}

function buildDatasetSeries(dataset: Dataset): ChartSeries[] {
  if (dataset.id === "mma-reserves") {
    return [
      { key: "gross", label: "Gross Reserves (US$ m)", color: "rgb(var(--chart-1))" },
      { key: "usable", label: "Usable Reserves (US$ m)", color: "rgb(var(--chart-2))" },
    ];
  }
  if (dataset.id === "mma-monetary-aggregates") {
    return [
      { key: "domesticCredit", label: "Domestic Credit (MVR m)", color: "rgb(var(--chart-1))" },
      { key: "broadMoneyM2", label: "Broad Money M2 (MVR m)", color: "rgb(var(--chart-2))" },
      { key: "privateCredit", label: "Private Credit (MVR m)", color: "rgb(var(--chart-4))" },
    ];
  }
  if (!dataset.chart) return [];
  const label = dataset.columns.find((col) => col.key === dataset.chart!.y)?.label ?? dataset.chart.y;
  return [{ key: dataset.chart.y, label }];
}

export function DataExplorer({ datasets }: { datasets: Dataset[] }) {
  const [category, setCategory] = useState("All");
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const [showChart, setShowChart] = useState(true);
  const [chartKindOverride, setChartKindOverride] = useState<TimeSeriesKind | null>(null);

  // Support deep linking ?dataset=<id> on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("dataset");
    if (requested && datasets.some((d) => d.id === requested)) {
      setDatasetId(requested);
    }
  }, [datasets]);

  const filteredByCategory = useMemo(
    () => (category === "All" ? datasets : datasets.filter((dataset) => dataset.category === category)),
    [datasets, category],
  );

  const dataset = useMemo(
    () => filteredByCategory.find((entry) => entry.id === datasetId) ?? filteredByCategory[0] ?? datasets[0],
    [datasets, datasetId, filteredByCategory],
  );

  useEffect(() => {
    setChartKindOverride(null);
  }, [dataset?.id]);

  const columns = dataset?.columns ?? [];
  const rows = dataset?.rows ?? [];
  const chart = dataset?.chart;

  const chartData = useMemo(() => {
    if (!chart) return [];
    return rows.filter((row: Record<string, unknown>) => row[chart.x] !== undefined && row[chart.y] !== undefined);
  }, [rows, chart]);

  const chartSeries = useMemo(() => (dataset ? buildDatasetSeries(dataset) : []), [dataset]);
  const activeKind: TimeSeriesKind = chartKindOverride ?? chart?.kind ?? "area";

  return (
    <div className="space-y-5">
      {/* Category & Dataset Selector Workbench */}
      <section className="surface-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Database className="h-4 w-4 shrink-0 text-accent" />
            <SegmentedControl
              options={CATEGORIES.map((value) => ({
                value,
                label: value === "All" ? "All domains" : value,
              }))}
              value={category}
              onChange={(val) => {
                setCategory(val);
                const firstInCat = val === "All" ? datasets[0] : datasets.find((d) => d.category === val);
                if (firstInCat) setDatasetId(firstInCat.id);
              }}
              ariaLabel="Filter datasets by category"
              size="sm"
            />
          </div>
          <Badge variant="outline">{filteredByCategory.length} datasets</Badge>
        </div>

        {/* Dataset Picker Pills */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredByCategory.map((entry) => {
            const selected = entry.id === dataset?.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setDatasetId(entry.id)}
                aria-pressed={selected}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-all",
                  selected
                    ? "border-accent/40 bg-accent-soft/70 text-ink shadow-sm"
                    : "border-line bg-surface-2/30 text-muted hover:border-line-strong hover:bg-surface-2/70 hover:text-ink",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink">{entry.name}</p>
                  <p className="font-mono text-[9.5px] text-faint">
                    {entry.category} · {formatNumber(entry.rows.length)} rows
                  </p>
                </div>
                {entry.chart ? <BarChart3 className={cn("h-3.5 w-3.5 shrink-0", selected ? "text-accent" : "text-faint")} /> : null}
              </button>
            );
          })}
        </div>
      </section>

      {dataset ? (
        <section className="space-y-4">
          <div className="surface-panel overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mono-label">{dataset.category}</p>
                  <DataBadge status={dataset.verification} />
                </div>
                <h2 className="mt-1 text-base font-semibold tracking-[-0.015em] text-ink">{dataset.name}</h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">{dataset.description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <SourceLabel sourceId={dataset.sourceId} />
              </div>
            </div>

            {chart ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/35 px-4 py-2 text-[10.5px] text-muted">
                <span>
                  {formatNumber(rows.length)} records · Updated {dataset.updatedAt.slice(0, 10)}
                </span>
                <div className="flex items-center gap-2">
                  {showChart ? (
                    <SegmentedControl
                      options={[
                        { value: "area", label: "Area" },
                        { value: "line", label: "Line" },
                        { value: "bar", label: "Bar" },
                      ]}
                      value={activeKind === "area" || activeKind === "line" || activeKind === "bar" ? activeKind : "line"}
                      onChange={(k) => setChartKindOverride(k as TimeSeriesKind)}
                      ariaLabel="Chart style"
                      size="sm"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowChart((value) => !value)}
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    <LineChart className="h-3 w-3" /> {showChart ? "Hide chart" : "Show chart"}
                  </button>
                </div>
              </div>
            ) : null}

            {chart && showChart ? (
              <div className="px-3 pb-3 pt-4 sm:px-4">
                <TimeSeriesChart
                  data={chartData as unknown as Record<string, unknown>[]}
                  xKey={chart.x}
                  series={chartSeries}
                  kind={activeKind}
                  format={inferChartFormat(dataset)}
                  labelType={chart.x === "date" ? "date" : chart.x === "period" ? "year" : "category"}
                  range="ALL"
                  height={265}
                  yWidth={56}
                />
              </div>
            ) : null}
          </div>

          <DataTable
            data={rows as unknown as Record<string, unknown>[]}
            columns={columns.map((column) => ({
              key: column.key,
              header: column.label,
              type: column.key === "source" ? "link" : (column.type as "text" | "number" | "currency" | "percent" | "date" | "mono"),
              hrefTemplate: column.key === "source" ? "{source}" : undefined,
              align: column.align,
            }))}
            idKey={columns[0]?.key}
            searchKeys={columns.map((column) => column.key)}
            searchPlaceholder={`Filter ${dataset.name.toLowerCase()}…`}
            csvFilename={`maldex-${dataset.id}.csv`}
            pageSize={12}
            caption={dataset.description}
            footerNote={`Source: ${dataset.sourceId}`}
          />
        </section>
      ) : (
        <div className="surface-panel">
          <EmptyState
            icon={<Database className="h-4 w-4" />}
            title="No dataset selected"
            description="Choose a category and dataset to begin exploring."
          />
        </div>
      )}
    </div>
  );
}
