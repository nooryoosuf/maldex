"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, GitCompareArrows, X } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { DataBadge } from "@/components/ui/data-badge";
import { formatMvr, formatNumber, formatPercent, formatDate } from "@/lib/format";
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
  format: (value: any) => string;
  provenance: "official" | "derived";
  group: string;
}[] = [
  { group: "Market", label: "Last trade price", key: "price", format: (v) => formatMvr(v, { digits: 2 }), provenance: "official" },
  { group: "Market", label: "Previous close", key: "previousClose", format: (v) => formatMvr(v, { digits: 2 }), provenance: "official" },
  { group: "Market", label: "Price change", key: "changePct", format: (v) => formatPercent(v, 2, true), provenance: "official" },
  { group: "Market", label: "Market capitalisation", key: "marketCap", format: (v) => formatMvr(v, { compact: true }), provenance: "official" },
  { group: "Trading", label: "Traded volume (units)", key: "volume", format: (v) => formatNumber(v), provenance: "official" },
  { group: "Trading", label: "Turnover value", key: "value", format: (v) => formatMvr(v, { compact: true }), provenance: "official" },
  { group: "Trading", label: "Total trades", key: "trades", format: (v) => formatNumber(v), provenance: "official" },
  { group: "Trading", label: "Last trade date", key: "lastDate", format: (v) => v ? formatDate(v, "long") : "—", provenance: "official" },
  { group: "Corporate", label: "Shares outstanding", key: "shares", format: (v) => formatNumber(v), provenance: "derived" },
  { group: "Corporate", label: "CMDA Disclosures", key: "filingsCount", format: (v) => formatNumber(v), provenance: "official" },
];

export function CompareTool({ companies }: { companies: CompareCompany[] }) {
  const [selected, setSelected] = useState<string[]>(companies.slice(0, 3).map((company) => company.code));
  const [group, setGroup] = useState("All");

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

  const chartData = selectedCompanies.map((company) => ({
    code: company.code,
    marketCap: (company.marketCap ?? 0) / 1_000_000,
    turnover: company.value / 1_000,
  }));

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-line bg-surface p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="mono-label">Select companies · up to four</p>
          <Badge variant="outline">{selected.length} selected</Badge>
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
                  "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-[11px] transition-colors",
                  active
                    ? "border-accent/30 bg-accent-soft text-ink"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <CompanyMark code={company.code} monogram={company.monogram} size="xs" />
                <span className="font-medium">{company.code}</span>
                <span className="hidden text-[10px] text-muted sm:inline">{company.name}</span>
                {active ? <Check className="h-3 w-3 text-accent" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div>
            <p className="mono-label mb-1">Side by side</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Market & Corporate Parameters</h2>
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
          <table className="w-full min-w-[620px] border-collapse text-xs">
            <caption className="sr-only">Company comparison across official MSE and CMDA metrics.</caption>
            <thead>
              <tr className="border-b border-line bg-surface-2/50">
                <th scope="col" className="sticky left-0 z-10 bg-surface-2 px-4 py-2.5 text-left font-mono text-[9.5px] uppercase tracking-[0.09em] text-muted">
                  Metric
                </th>
                {selectedCompanies.map((company) => (
                  <th key={company.code} scope="col" className="min-w-[140px] px-4 py-2.5 text-right">
                    <Link href={`/companies/${company.slug}`} className="inline-flex flex-col items-end gap-1 hover:text-accent">
                      <span className="text-[12px] font-medium text-ink">{company.name}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint">{company.code} · {company.sectorGroup}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-line/60 last:border-0 hover:bg-surface-2/30">
                  <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-left font-normal">
                    <span className="block text-[11.5px] text-ink">{row.label}</span>
                    <span className="mt-0.5 block">
                      <DataBadge status={row.provenance === "official" ? "official-reported" : "derived"} />
                    </span>
                  </th>
                  {selectedCompanies.map((company) => {
                    const raw = company[row.key];
                    return (
                      <td key={company.code} className="px-4 py-2.5 text-right">
                        <span className="num font-mono text-[12px] text-ink">
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
        <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[9.5px] leading-4 text-faint">
          All data sourced from official Maldives Stock Exchange daily trade exports and CMDA InformInvestor disclosure registry.
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-line bg-surface">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
          <div>
            <p className="mono-label mb-1">Scale comparison</p>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Market Capitalisation</h2>
            <p className="mt-0.5 text-[10.5px] text-muted">Official market capitalization in MVR millions.</p>
          </div>
          <DataBadge status="official-reported" />
        </div>
        <div className="px-2 pb-3 pt-4">
          <TimeSeriesChart
            data={chartData as unknown as Record<string, unknown>[]}
            xKey="code"
            series={[
              { key: "marketCap", label: "Market Cap (MVR m)" },
            ]}
            kind="bar"
            format="number"
            labelType="category"
            height={240}
            yWidth={48}
          />
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface p-4">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-accent" />
          <p className="text-xs text-muted">
            Compare official trading volume, capitalisation, and regulatory filing activity across MSE listed issuers.
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setSelected(companies.slice(0, 3).map((company) => company.code))}>
          <X className="h-3 w-3" /> Reset selection
        </Button>
      </section>
    </div>
  );
}
