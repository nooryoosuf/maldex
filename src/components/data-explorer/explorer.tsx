"use client";

import { useMemo, useState } from "react";
import { Database, Download, LineChart } from "lucide-react";
import { DATASETS } from "@/lib/data/datasets";
import type { Dataset } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { SourceLabel } from "@/components/ui/source-label";
import { DataBadge } from "@/components/ui/data-badge";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/format";

const CATEGORIES = ["All", ...Array.from(new Set(DATASETS.map((dataset) => dataset.category)))];

export function DataExplorer({ datasets }: { datasets: Dataset[] }) {
  const [category, setCategory] = useState("All");
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const [showChart, setShowChart] = useState(true);

  const filteredByCategory = useMemo(
    () => (category === "All" ? datasets : datasets.filter((dataset) => dataset.category === category)),
    [datasets, category],
  );

  const dataset = useMemo(
    () => datasets.find((entry) => entry.id === datasetId) ?? filteredByCategory[0] ?? datasets[0],
    [datasets, datasetId, filteredByCategory],
  );

  // Keep selection valid when category changes.
  useMemo(() => {
    if (!filteredByCategory.some((entry) => entry.id === datasetId) && filteredByCategory.length) {
      setDatasetId(filteredByCategory[0].id);
    }
  }, [filteredByCategory, datasetId]);

  const columns = dataset?.columns ?? [];
  const rows = dataset?.rows ?? [];
  const chart = dataset?.chart;

  const chartData = useMemo(() => {
    if (!chart) return [];
    return rows.filter((row: Record<string, unknown>) => row[chart.x] !== undefined && row[chart.y] !== undefined);
  }, [rows, chart]);

  const chartSeries = chart ? [{ key: chart.y, label: columns.find((col) => col.key === chart.y)?.label ?? chart.y }] : [];

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Database className="h-4 w-4 text-accent" />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-8 rounded-sm border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
            aria-label="Filter datasets by category"
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{value === "All" ? "All categories" : value}</option>
            ))}
          </select>
          <select
            value={dataset?.id ?? ""}
            onChange={(event) => setDatasetId(event.target.value)}
            className="h-8 min-w-[260px] flex-1 rounded-sm border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15"
            aria-label="Select dataset"
          >
            {filteredByCategory.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} · {formatNumber(entry.rows.length)} rows
              </option>
            ))}
          </select>
          <Badge variant="outline">
            {formatNumber(datasets.length)} datasets
          </Badge>
        </div>
      </section>

      {dataset ? (
        <>
          <section className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mono-label">{dataset.category}</p>
                  <DataBadge status={dataset.verification} />
                </div>
                <h2 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">{dataset.name}</h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">{dataset.description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <SourceLabel sourceId={dataset.sourceId} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2/40 px-4 py-2 text-[10px] text-faint">
              <span>
                {formatNumber(rows.length)} rows · updated {dataset.updatedAt.slice(0, 10)} · {dataset.verification}
              </span>
              {chart ? (
                <button
                  type="button"
                  onClick={() => setShowChart((value) => !value)}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  <LineChart className="h-3 w-3" /> {showChart ? "Hide chart" : "Show chart"}
                </button>
              ) : null}
            </div>

            {chart && showChart ? (
              <div className="border-b border-line px-2 pb-3 pt-4">
                <TimeSeriesChart
                  data={chartData as unknown as Record<string, unknown>[]}
                  xKey={chart.x}
                  series={chartSeries}
                  kind={chart.kind}
                  format={dataset.id.includes("bond") ? "percent" : dataset.id.includes("gdp") || dataset.id.includes("inflation") ? "number" : "number"}
                  labelType={chart.x === "period" ? "year" : chart.x === "date" ? "date" : "category"}
                  height={240}
                  yWidth={56}
                />
              </div>
            ) : null}

            <div className="p-0">
              <DataTable
                data={rows as unknown as Record<string, unknown>[]}
                columns={columns.map((column) => ({
                  key: column.key,
                  header: column.label,
                  type: column.type as "text" | "number" | "currency" | "percent" | "date" | "mono",
                  align: column.align,
                }))}
                idKey={columns[0]?.key}
                searchKeys={columns.map((column) => column.key)}
                searchPlaceholder={`Search ${dataset.name.toLowerCase()}`}
                csvFilename={`${dataset.id}.csv`}
                pageSize={12}
                caption={dataset.description}
                footerNote={`Source: ${dataset.sourceId}`}
              />
            </div>
          </section>

          <section className="grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="mono-label mb-1">Using the data</p>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Every table exports to CSV</h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                CSV export includes the rows currently filtered by your search. Column headers carry the original
                labels. Source metadata is shown on every dataset.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Download className="h-3.5 w-3.5" /> Use the CSV button in the table toolbar.
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-md border border-line bg-surface">
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
