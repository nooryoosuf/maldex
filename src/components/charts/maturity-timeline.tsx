"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import type { BondInstrument } from "@/lib/types";
import { nominalIssueValue } from "@/lib/data/bonds";
import { formatDate, formatMvr, formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";

export function MaturityTimeline({
  bonds,
  className,
}: {
  bonds: BondInstrument[];
  className?: string;
}) {
  const years = useMemo(() => {
    const map = new Map<
      number,
      {
        year: number;
        government: number;
        corporate: number;
        sukuk: number;
        total: number;
        instruments: BondInstrument[];
      }
    >();

    for (const bond of bonds) {
      const yr = Number(bond.maturityDate.slice(0, 4));
      if (!Number.isFinite(yr)) continue;
      const entry = map.get(yr) ?? {
        year: yr,
        government: 0,
        corporate: 0,
        sukuk: 0,
        total: 0,
        instruments: [],
      };
      const val = nominalIssueValue(bond);
      if (bond.instrumentType === "Sukuk") {
        entry.sukuk += val;
      } else if (bond.issuerShort === "Government") {
        entry.government += val;
      } else {
        entry.corporate += val;
      }
      entry.total += val;
      entry.instruments.push(bond);
      map.set(yr, entry);
    }

    return [...map.values()].sort((a, b) => a.year - b.year);
  }, [bonds]);

  const [selectedYear, setSelectedYear] = useState<number | null>(years[0]?.year ?? null);

  const selectedEntry = useMemo(
    () => years.find((y) => y.year === selectedYear) ?? years[0] ?? null,
    [years, selectedYear],
  );

  return (
    <div className={cn("space-y-4", className)}>
      <TimeSeriesChart
        data={years as unknown as Record<string, unknown>[]}
        xKey="year"
        series={[
          { key: "government", label: "Government bonds", color: "rgb(var(--chart-1))" },
          { key: "corporate", label: "Corporate bonds", color: "rgb(var(--chart-2))" },
          { key: "sukuk", label: "Sukuk", color: "rgb(var(--chart-3))" },
        ]}
        kind="stacked-bar"
        format="compactCurrency"
        labelType="year"
        height={250}
        yWidth={56}
      />

      {/* Interactive Year Selector Strip */}
      <div className="border-t border-line pt-3.5">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="mono-label">Inspect maturities by year</span>
          {selectedEntry ? (
            <span className="font-mono text-[10.5px] text-muted">
              {selectedEntry.instruments.length} instrument{selectedEntry.instruments.length === 1 ? "" : "s"} ·{" "}
              <strong className="font-semibold text-ink">{formatMvr(selectedEntry.total, { compact: true })}</strong>
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {years.map((item) => {
            const active = item.year === selectedEntry?.year;
            return (
              <button
                key={item.year}
                type="button"
                onClick={() => setSelectedYear(item.year)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-all",
                  active
                    ? "border-accent/40 bg-accent-soft text-ink shadow-sm"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <span className="font-semibold">{item.year}</span>
                <span className="rounded-xs bg-surface-2 px-1 text-[9.5px] text-faint">{item.instruments.length}</span>
              </button>
            );
          })}
        </div>

        {selectedEntry ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedEntry.instruments.map((bond) => (
              <div
                key={bond.id}
                className="flex items-start justify-between gap-3 rounded-md border border-line bg-surface-2/40 p-3 transition-colors hover:bg-surface-2/80"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-ink">{bond.code}</span>
                    <Badge
                      variant={
                        bond.instrumentType === "Sukuk"
                          ? "warning"
                          : bond.issuerShort === "Government"
                            ? "accent"
                            : "default"
                      }
                    >
                      {bond.instrumentType === "Sukuk" ? "Sukuk" : bond.issuerShort === "Government" ? "Sovereign" : "Corporate"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted">{bond.issuerShort}</p>
                  <p className="mt-1 font-mono text-[10px] text-faint">Matures {formatDate(bond.maturityDate)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="num block font-mono text-xs font-semibold text-ink">
                    {bond.returnRate !== null ? formatPercent(bond.returnRate, 2) : "Unrated"}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-muted">
                    {formatMvr(nominalIssueValue(bond), { compact: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
