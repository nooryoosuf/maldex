"use client";

import { useState } from "react";
import { BarChart3, Download, Maximize2, Table2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { WhatDoesThisMean } from "@/components/ui/disclosure-panel";
import { formatChartValue, type ChartFormat } from "@/components/charts/chart-tooltip";
import { downloadCsv, toCsv } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface ChartTableColumn {
  key: string;
  label: string;
  format?: ChartFormat;
  digits?: number;
}

export function ChartCard({
  eyebrow,
  title,
  description,
  actions,
  children,
  expandedChildren,
  footer,
  explanation,
  tableData,
  tableColumns,
  csvFilename,
  expandable = false,
  variant = "default",
  className,
  bodyClassName,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  expandedChildren?: React.ReactNode;
  footer?: React.ReactNode;
  explanation?: React.ReactNode;
  tableData?: Record<string, unknown>[];
  tableColumns?: ChartTableColumn[];
  csvFilename?: string;
  expandable?: boolean;
  variant?: "default" | "minimal" | "featured";
  className?: string;
  bodyClassName?: string;
}) {
  const [mode, setMode] = useState<"chart" | "table">("chart");
  const [expanded, setExpanded] = useState(false);

  const hasTable = Boolean(tableData?.length && tableColumns?.length);
  const canDownload = Boolean(csvFilename && tableData?.length && tableColumns?.length);

  const handleDownload = () => {
    if (!csvFilename || !tableData || !tableColumns) return;
    downloadCsv(
      csvFilename,
      toCsv(
        tableColumns.map((col) => ({ key: col.key, label: col.label })),
        tableData,
      ),
    );
  };

  return (
    <>
      <section
        className={cn(
          "overflow-hidden transition-colors",
          variant === "minimal"
            ? "border-t border-line pt-4"
            : variant === "featured"
              ? "rounded-lg border border-line-strong/80 bg-surface shadow-[0_2px_12px_-4px_rgba(15,23,32,0.06)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.45)]"
              : "surface-panel",
          className,
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-3",
            variant === "minimal" ? "pb-3" : "border-b border-line/80 px-4 py-3.5",
          )}
        >
          <div className="min-w-0 flex-1">
            {eyebrow ? <p className="mono-label mb-1">{eyebrow}</p> : null}
            <h3 className="text-[14.5px] font-semibold tracking-[-0.015em] text-ink">{title}</h3>
            {description ? (
              <div className="mt-0.5 max-w-2xl text-[11.5px] leading-5 text-muted">{description}</div>
            ) : null}
          </div>

          {actions || hasTable || canDownload || expandable ? (
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {actions}
              {hasTable ? (
                <div className="inline-flex items-center rounded-md border border-line bg-surface-2/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode("chart")}
                    aria-label="Chart view"
                    title="Chart view"
                    aria-pressed={mode === "chart"}
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors",
                      mode === "chart" ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
                    )}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("table")}
                    aria-label="Table view"
                    title="Table view"
                    aria-pressed={mode === "table"}
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors",
                      mode === "table" ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
                    )}
                  >
                    <Table2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
              {canDownload ? (
                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label="Download chart data as CSV"
                  title="Download CSV"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {expandable ? (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  aria-label={`Expand ${title}`}
                  title="Expand chart"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={cn(variant === "minimal" ? "pt-2" : "px-3 pb-3 pt-4 sm:px-4", bodyClassName)}>
          {mode === "table" && hasTable && tableData && tableColumns ? (
            <div className="max-h-[280px] overflow-auto rounded-md border border-line scrollbar-thin">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-surface-2/95 backdrop-blur-sm">
                  <tr className="border-b border-line">
                    {tableColumns.map((col, idx) => (
                      <th
                        key={col.key}
                        className={cn(
                          "px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted",
                          idx === 0 ? "text-left" : "text-right",
                        )}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...tableData].reverse().map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-line/50 last:border-0 hover:bg-surface-2/40">
                      {tableColumns.map((col, cIdx) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-3 py-1.5 num font-mono",
                            cIdx === 0 ? "text-left text-muted" : "text-right text-ink",
                          )}
                        >
                          {cIdx === 0
                            ? String(row[col.key] ?? "—")
                            : formatChartValue(
                                row[col.key] as number | string | null,
                                col.format ?? "number",
                                col.digits ?? 1,
                              )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            children
          )}

          {explanation ? (
            <div className="mt-3 border-t border-line/60 pt-2.5">
              <WhatDoesThisMean compact>{explanation}</WhatDoesThisMean>
            </div>
          ) : null}
        </div>

        {footer ? (
          <div className={cn(variant === "minimal" ? "pt-2" : "border-t border-line/80 bg-surface-2/30 px-4 py-2.5")}>
            {footer}
          </div>
        ) : null}
      </section>

      {expandable ? (
        <Modal
          open={expanded}
          onClose={() => setExpanded(false)}
          title={title}
          description={typeof description === "string" ? description : undefined}
          size="xl"
          footer={footer}
        >
          <div className="min-h-[360px] py-2">{expandedChildren ?? children}</div>
        </Modal>
      ) : null}
    </>
  );
}
