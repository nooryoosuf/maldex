"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Inbox,
  Rows3,
  Rows4,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanyMark } from "@/components/ui/company-mark";
import { Sparkline } from "@/components/ui/sparkline";
import { Trend } from "@/components/ui/trend";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { downloadCsv, formatDate, formatMvr, formatNumber, formatPercent, toCsv } from "@/lib/format";
import { cn } from "@/lib/cn";

export type DataTableColumnType =
  | "text"
  | "number"
  | "currency"
  | "percent"
  | "date"
  | "mono"
  | "change"
  | "link"
  | "company"
  | "sparkline"
  | "badge";

export interface DataTableColumn {
  key: string;
  header: string;
  type?: DataTableColumnType;
  align?: "left" | "right";
  digits?: number;
  signed?: boolean;
  compact?: boolean;
  hrefTemplate?: string;
  secondaryKey?: string;
  hideBelow?: "sm" | "md" | "lg";
  sortable?: boolean;
  toneMap?: Record<string, "default" | "outline" | "accent" | "positive" | "negative" | "warning" | "ink">;
  width?: string;
}

type Row = Record<string, unknown>;

function initials(value: string): string {
  return value
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function hrefFor(template: string | undefined, row: Row): string {
  if (!template) return "#";
  if (template === "{url}" || template === "{source}") {
    const key = template.slice(1, -1);
    return String(row[key] ?? "#");
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(String(row[key] ?? "")));
}

function displayValue(row: Row, column: DataTableColumn): React.ReactNode {
  const raw = row[column.key];
  if (raw === null || raw === undefined || raw === "") {
    return <span className="text-faint">—</span>;
  }
  switch (column.type) {
    case "number":
      return (
        <span className="num font-mono">
          {column.compact ? formatNumber(Number(raw), 0) : formatNumber(Number(raw), column.digits ?? 0)}
        </span>
      );
    case "currency":
      return (
        <span className="num font-mono">
          {formatMvr(Number(raw), { compact: column.compact, digits: column.digits ?? 0 })}
        </span>
      );
    case "percent":
      return <span className="num font-mono">{formatPercent(Number(raw), column.digits ?? 1, column.signed)}</span>;
    case "date":
      return <span className="num font-mono text-[11px] text-muted">{formatDate(String(raw))}</span>;
    case "mono":
      return <span className="font-mono text-[11.5px] font-medium">{String(raw)}</span>;
    case "change":
      return <Trend value={Number(raw)} digits={column.digits ?? 2} size="sm" />;
    case "sparkline":
      return <Sparkline data={(raw as (number | null)[]) ?? []} width={68} height={22} />;
    case "badge":
      return (
        <Badge variant={column.toneMap?.[String(raw)] ?? "default"} className="normal-case tracking-[0.02em]">
          {String(raw)}
        </Badge>
      );
    case "company": {
      const name = String(raw);
      const secondary = column.secondaryKey ? row[column.secondaryKey] : null;
      const code = String(secondary ?? row.code ?? "");
      return (
        <Link href={hrefFor(column.hrefTemplate, row)} className="group inline-flex min-w-0 items-center gap-2.5">
          <CompanyMark code={code} monogram={initials(name)} size="xs" />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium text-ink transition-colors group-hover:text-accent">
              {name}
            </span>
            {secondary ? (
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">
                {String(secondary)}
              </span>
            ) : null}
          </span>
        </Link>
      );
    }
    case "link": {
      const resolvedHref = hrefFor(column.hrefTemplate, row);
      const isExternal = /^https?:\/\//i.test(resolvedHref);
      const text = String(raw);
      if (isExternal) {
        const label = /^https?:\/\//i.test(text) ? "Official document" : text;
        return (
          <a
            href={resolvedHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            <span className="truncate max-w-[260px]">{label}</span>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-75" />
          </a>
        );
      }
      return (
        <Link href={resolvedHref} className="font-medium text-ink transition-colors hover:text-accent hover:underline">
          {text}
        </Link>
      );
    }
    default:
      return <span>{String(raw)}</span>;
  }
}

function csvValue(row: Row, column: DataTableColumn): unknown {
  const raw = row[column.key];
  if (raw === null || raw === undefined) return "";
  if (column.type === "sparkline") return Array.isArray(raw) ? raw.join("|") : "";
  return raw;
}

function sortableValue(row: Row, column: DataTableColumn): string | number | null {
  const raw = row[column.key];
  if (raw === null || raw === undefined || raw === "") return null;
  if (column.type === "sparkline") {
    const data = raw as (number | null)[];
    const last = [...data].reverse().find((value) => typeof value === "number");
    return last ?? null;
  }
  if (typeof raw === "number") return raw;
  if (column.type === "date") return String(raw);
  return String(raw).toLowerCase();
}

export function DataTable({
  data,
  columns,
  searchKeys,
  searchPlaceholder = "Filter rows…",
  pageSize = 10,
  initialSort,
  csvFilename,
  toolbar,
  dense: initialDense = false,
  emptyTitle = "No matching rows",
  emptyDescription = "Try a different search or clear the filters.",
  caption,
  idKey,
  maxHeight,
  hideSearch = false,
  footerNote,
}: {
  data: Row[];
  columns: DataTableColumn[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  pageSize?: number;
  initialSort?: { key: string; direction: "asc" | "desc" };
  csvFilename?: string;
  toolbar?: React.ReactNode;
  dense?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  caption?: string;
  idKey?: string;
  maxHeight?: number;
  hideSearch?: boolean;
  footerNote?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(initialSort?.key ?? null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSort?.direction ?? "asc");
  const [page, setPage] = useState(1);
  const [isDense, setIsDense] = useState(initialDense);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      const keys = searchKeys?.length ? searchKeys : Object.keys(row);
      return keys.some((key) => String(row[key] ?? "").toLowerCase().includes(q));
    });
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const column = columns.find((entry) => entry.key === sortKey);
    if (!column) return filtered;
    const rows = [...filtered];
    rows.sort((a, b) => {
      const av = sortableValue(a, column);
      const bv = sortableValue(b, column);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const comparison =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "en", { numeric: true });
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return rows;
  }, [filtered, sortKey, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  const toggleSort = (column: DataTableColumn) => {
    if (column.sortable === false) return;
    if (sortKey === column.key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const exportCsv = () => {
    if (!csvFilename) return;
    const exportColumns = columns
      .filter((column) => column.type !== "sparkline")
      .map((column) => ({
        key: column.key,
        label: column.header,
      }));
    const rows = sorted.map((row) =>
      Object.fromEntries(
        exportColumns.map((column) => {
          const config = columns.find((entry) => entry.key === column.key)!;
          return [column.key, csvValue(row, config)];
        }),
      ),
    );
    downloadCsv(csvFilename, toCsv(exportColumns, rows));
  };

  const alignClass = (align?: "left" | "right") => (align === "right" ? "text-right" : "text-left");
  const hideClass = (hideBelow?: "sm" | "md" | "lg") =>
    hideBelow === "sm"
      ? "hidden sm:table-cell"
      : hideBelow === "md"
        ? "hidden md:table-cell"
        : hideBelow === "lg"
          ? "hidden lg:table-cell"
          : "";

  const primaryCol = useMemo(
    () => columns.find((c) => c.type === "company" || c.type === "link") ?? columns[0],
    [columns],
  );
  const mobileDetailCols = useMemo(
    () => columns.filter((c) => c.key !== primaryCol?.key && c.type !== "sparkline").slice(0, 4),
    [columns, primaryCol],
  );
  const mobileSparkCol = useMemo(
    () => columns.find((c) => c.type === "sparkline"),
    [columns],
  );

  return (
    <div className="surface-panel overflow-hidden">
      {!hideSearch || toolbar || csvFilename || footerNote ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/80 px-3.5 py-2.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {!hideSearch ? (
              <div className="relative flex w-full items-center sm:w-auto">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-faint" strokeWidth={1.8} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="h-8 w-full rounded-md border border-line bg-surface pl-8 pr-7 text-xs text-ink placeholder:text-faint transition-colors focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15 sm:w-[225px] [&::-webkit-search-cancel-button]:hidden"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                    aria-label="Clear table search"
                    className="absolute right-1.5 inline-flex h-5 w-5 items-center justify-center text-faint hover:text-ink"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            ) : null}
            {toolbar}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-faint">{sorted.length} rows</span>
            <button
              type="button"
              onClick={() => setIsDense((d) => !d)}
              aria-label={isDense ? "Switch to comfortable row spacing" : "Switch to compact row spacing"}
              title={isDense ? "Comfortable rows" : "Compact rows"}
              className="hidden h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              {isDense ? <Rows3 className="h-3.5 w-3.5" /> : <Rows4 className="h-3.5 w-3.5" />}
            </button>
            {csvFilename ? (
              <Button size="sm" variant="outline" onClick={exportCsv} title="Download filtered rows as CSV" className="h-7 px-2">
                <Download className="h-3 w-3" /> CSV
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-4 w-4" />}
          title={emptyTitle}
          description={emptyDescription}
          action={
            query ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Mobile Responsive Card Layout (prevents horizontal squeeze/overflow on phones) */}
          <div className="divide-y divide-line/70 sm:hidden">
            {visible.map((row, index) => (
              <div key={idKey ? String(row[idKey] ?? index) : index} className="space-y-2.5 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 text-xs font-medium text-ink">
                    {primaryCol ? displayValue(row, primaryCol) : null}
                  </div>
                  {mobileSparkCol ? <div className="shrink-0">{displayValue(row, mobileSparkCol)}</div> : null}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md bg-surface-2/45 px-2.5 py-2 text-[11.5px]">
                  {mobileDetailCols.map((col) => (
                    <div key={col.key} className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-faint">
                        {col.header}
                      </span>
                      <span className="shrink-0 text-right text-ink">{displayValue(row, col)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Clean Data Table */}
          <div className="hidden scrollbar-thin overflow-x-auto sm:block" style={maxHeight ? { maxHeight } : undefined}>
            <table className="w-full border-collapse text-[12.5px]">
              {caption ? <caption className="sr-only">{caption}</caption> : null}
              <thead className="sticky top-0 z-10 bg-surface-2/90 backdrop-blur-md">
                <tr className="border-b border-line">
                  {columns.map((column) => {
                    const active = sortKey === column.key;
                    const sortable = column.sortable !== false;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        style={column.width ? { width: column.width } : undefined}
                        aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                        className={cn(
                          "group/th whitespace-nowrap px-3.5 py-2.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.09em] text-muted",
                          alignClass(column.align),
                          hideClass(column.hideBelow),
                        )}
                      >
                        {sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-xs transition-colors hover:text-ink",
                              active && "text-ink",
                              column.align === "right" && "flex-row-reverse",
                            )}
                          >
                            <span>{column.header}</span>
                            {active ? (
                              sortDirection === "asc" ? (
                                <ArrowUp className="h-3 w-3 text-accent" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-accent" />
                              )
                            ) : (
                              <ArrowUpDown className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover/th:opacity-55" />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, index) => (
                  <tr
                    key={idKey ? String(row[idKey] ?? index) : index}
                    className="border-b border-line/50 transition-colors last:border-0 hover:bg-surface-2/45"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-3.5 align-middle text-ink",
                          isDense ? "py-1.5" : "py-2.5",
                          alignClass(column.align),
                          hideClass(column.hideBelow),
                        )}
                      >
                        {displayValue(row, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/80 bg-surface-2/25 px-3.5 py-2">
        <div className="flex items-center gap-3">
          <span className="num font-mono text-[10px] text-faint">
            {sorted.length === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, sorted.length)}`} of {sorted.length}
          </span>
          {footerNote ? <span className="hidden text-[10px] text-faint md:inline">· {footerNote}</span> : null}
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={safePage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="num px-1.5 font-mono text-[10px] text-muted">
              {safePage} / {totalPages}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={safePage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
