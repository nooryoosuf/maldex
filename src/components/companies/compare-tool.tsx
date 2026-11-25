"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, GitCompareArrows, X } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented";
import { ChartCard } from "@/components/charts/chart-card";
import { TimeSeriesChart, CHART_PALETTE } from "@/components/charts/time-series-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { DataBadge } from "@/components/ui/data-badge";
import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface CompareCompany {
  code: string;
  name: string;
  slug: string;
  sectorGroup: string;
  monogram: string;
  price: number | null;
  previousClose: number | null;
  changePct: number | null;
  marketCap: number | null;
  shares: number | null;
  volume: number;
  value: number;
  trades: number;
  lastDate: string | null;
  filingsCount: number;
}

const ROWS: {
  label: string;
  key: keyof CompareCompany;
  format: (value: unknown) => string;
  provenance: "official" | "derived";
  group: string;
}[] = [
  { group: "Market", label: "Last trade price", key: "price", format: (v) => formatMvr(v as number | null, { digits: 2 }), provenance: "official" },
  { group: "Market", label: "Previous close", key: "previousClose", format: (v) => formatMvr(v as number | null, { digits: 2 }), provenance: "official" },
  { group: "Market", label: "Price change", key: "changePct", format: (v) => formatPercent(v as number | null, 2, true), provenance: "official" },
  { group: "Market", label: "Market capitalisation", key: "marketCap", format: (v) => formatMvr(v as number | null, { compact: true }), provenance: "official" },
  { group: "Trading", label: "Traded volume (units)", key: "volume", format: (v) => formatNumber(v as number | null), provenance: "official" },
  { group: "Trading", label: "Turnover value", key: "value", format: (v) => formatMvr(v as number | null, { compact: true }), provenance: "official" },
  { group: "Trading", label: "Total trades", key: "trades", format: (v) => formatNumber(v as number | null), provenance: "official" },
  { group: "Trading", label: "Last trade date", key: "lastDate", format: (v) => (v ? formatDate(String(v), "long") : "—"), provenance: "official" },
  { group: "Corporate", label: "Shares outstanding", key: "shares", format: (v) => formatNumber(v as number | null), provenance: "derived" },
  { group: "Corporate", label: "CMDA Disclosures", key: "filingsCount", format: (v) => formatNumber(v as number | null), provenance: "official" },
];

export function CompareTool({
  companies,
  priceSeriesByCode,
}: {
  companies: CompareCompany[];
  priceSeriesByCode?: Record<string, { date: string; value: number }[]>;
}) {
  const [selected, setSelected] = useState<string[]>(companies.slice(0, 3).map((company) => company.code));
  const [group, setGroup] = useState("All");
  const [visualMode, setVisualMode] = useState<"performance" | "scale">("performance");

  const selectedCompanies = useMemo(
    () => companies.filter((company) => selected.includes(company.code)),
    [companies, selected],
  );

  const groups = ["All", "Market", "Trading", "Corporate"];
  const rows = ROWS.filter((row) => group === "All" || row.group === group);

  const toggle = (code: string) => {
    setSelected((current) =>
      current.includes(code)
        ? current.length === 1
          ? current
          : current.filter((entry) => entry !== code)
        : current.length >= 4
          ? current
          : [...current, code],
    );
  };

  // Build normalized % performance overlay from the earliest date in 1Y window for each selected stock
  const normalizedData = useMemo(() => {
    if (!priceSeriesByCode) return [];
    const dateSet = new Set<string>();
    const baselines: Record<string, number> = {};
    const lookups: Record<string, Map<string, number>> = {};

    for (const comp of selectedCompanies) {
      const series = priceSeriesByCode[comp.code] ?? [];
      if (!series.length) continue;
      baselines[comp.code] = series[0].value;
      const map = new Map<string, number>();
      for (const pt of series) {
        dateSet.add(pt.date);
        map.set(pt.date, pt.value);
      }
      lookups[comp.code] = map;
    }

    const sortedDates = [...dateSet].sort();
    const lastSeen: Record<string, number> = {};

    return sortedDates.map((date) => {
      const row: Record<string, unknown> = { date };
      for (const comp of selectedCompanies) {
        const base = baselines[comp.code];
        const map = lookups[comp.code];
        if (!base || !map) continue;
        if (map.has(date)) {
          lastSeen[comp.code] = map.get(date)!;
        }
        if (lastSeen[comp.code] !== undefined) {
          row[comp.code] = Number((((lastSeen[comp.code] - base) / base) * 100).toFixed(2));
        }
      }
      return row;
    });
  }, [priceSeriesByCode, selectedCompanies]);

  const scaleData = selectedCompanies.map((company) => ({
    code: company.code,
    marketCap: Number(((company.marketCap ?? 0) / 1_000_000).toFixed(1)),
    filings: company.filingsCount,
  }));

  return (
    <div className="space-y-5">
      {/* Issuer Selector Bar */}
      <section className="surface-panel p-4">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="mono-label">Select issuers · up to four</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selected.length} / 4 selected</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(companies.slice(0, 3).map((c) => c.code))}
            >
              <X className="h-3 w-3" /> Reset
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {companies.map((company) => {
            const active = selected.includes(company.code);
            return (
              <button
                key={company.code}
                type="button"
                onClick={() => toggle(company.code)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11.5px] transition-all",
                  active
                    ? "border-accent/35 bg-accent-soft text-ink shadow-sm"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <CompanyMark code={company.code} monogram={company.monogram} size="xs" />
                <span className="font-mono font-semibold">{company.code}</span>
                <span className="hidden text-[11px] text-muted sm:inline">{company.name}</span>
                {active ? <Check className="h-3 w-3 text-accent" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Multi-Company Visual Comparison Chart */}
      <ChartCard
        eyebrow="Visual Comparison"
        title={
          visualMode === "performance" && normalizedData.length > 0
            ? "12-Month Relative Price Performance (%)"
            : "Market Capitalisation Comparison"
        }
        description={
          visualMode === "performance" && normalizedData.length > 0
            ? "Normalized percentage change from each company's first traded close in the 12-month window (0% = starting baseline)."
            : "Side-by-side comparison of official market capitalisation in MVR millions."
        }
        explanation="Because listed shares trade at very different nominal MVR prices, normalizing to percentage change from a common starting point lets you compare relative price performance fairly on a single chart."
        actions={
          priceSeriesByCode ? (
            <SegmentedControl
              options={[
                { value: "performance", label: "Relative Return (%)" },
                { value: "scale", label: "Market Cap Scale" },
              ]}
              value={visualMode}
              onChange={(v) => setVisualMode(v as "performance" | "scale")}
              ariaLabel="Visual comparison mode"
              size="sm"
            />
          ) : undefined
        }
        expandable
      >
        {visualMode === "performance" && normalizedData.length > 0 ? (
          <TimeSeriesChart
            data={normalizedData}
            xKey="date"
            series={selectedCompanies.map((comp, idx) => ({
              key: comp.code,
              label: `${comp.code} (${comp.name})`,
              color: CHART_PALETTE[idx % CHART_PALETTE.length],
            }))}
            kind="line"
            format="percent"
            range="1Y"
            zeroLine
            height={265}
            yWidth={48}
            digits={1}
          />
        ) : (
          <TimeSeriesChart
            data={scaleData as unknown as Record<string, unknown>[]}
            xKey="code"
            series={[
              { key: "marketCap", label: "Market Cap (MVR m)", color: "rgb(var(--chart-1))" },
            ]}
            kind="bar"
            format="number"
            labelType="category"
            height={250}
            yWidth={52}
            digits={1}
          />
        )}
      </ChartCard>

      {/* Side-by-Side Matrix */}
      <section className="surface-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3.5">
          <div>
            <p className="mono-label mb-0.5">Parameter Matrix</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Side-by-side metrics</h2>
          </div>
          <SegmentedControl
            options={groups.map((value) => ({ value, label: value }))}
            value={group}
            onChange={setGroup}
            ariaLabel="Filter comparison rows"
            size="sm"
          />
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <caption className="sr-only">Company comparison across official MSE and CMDA metrics.</caption>
            <thead>
              <tr className="border-b border-line bg-surface-2/60">
                <th scope="col" className="sticky left-0 z-10 bg-surface-2 px-4 py-2.5 text-left font-mono text-[9.5px] uppercase tracking-[0.09em] text-muted">
                  Parameter
                </th>
                {selectedCompanies.map((company) => (
                  <th key={company.code} scope="col" className="min-w-[145px] px-4 py-2.5 text-right">
                    <Link href={`/companies/${company.slug}`} className="inline-flex flex-col items-end gap-0.5 hover:text-accent">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                        <CompanyMark code={company.code} size="xs" />
                        {company.name}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                        {company.code} · {company.sectorGroup}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-line/60 last:border-0 hover:bg-surface-2/35">
                  <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-left font-normal">
                    <span className="block text-xs font-medium text-ink">{row.label}</span>
                    <span className="mt-0.5 block">
                      <DataBadge status={row.provenance === "official" ? "official-reported" : "derived"} />
                    </span>
                  </th>
                  {selectedCompanies.map((company) => {
                    const raw = company[row.key];
                    return (
                      <td key={company.code} className="px-4 py-2.5 text-right">
                        <span className="num font-mono text-xs font-medium text-ink">
                          {row.format(raw)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line bg-surface-2/35 px-4 py-2.5 text-[10px] text-faint">
          <span className="inline-flex items-center gap-1.5">
            <GitCompareArrows className="h-3.5 w-3.5 text-accent" /> Official MSE trade exports & CMDA InformInvestor registry
          </span>
        </div>
      </section>
    </div>
  );
}
