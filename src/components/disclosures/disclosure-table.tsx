"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, SlidersHorizontal, X } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SegmentedControl } from "@/components/ui/segmented";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export interface DisclosureRow {
  id: string;
  date: string;
  company: string;
  code: string;
  type: string;
  title: string;
  source: string;
}

const QUICK_TYPES = ["All", "Financial report", "Annual report", "Dividend", "AGM", "Board & governance"];

export function DisclosureTable({ rows }: { rows: DisclosureRow[] }) {
  const [type, setType] = useState("All");
  const [company, setCompany] = useState("All");
  const [year, setYear] = useState("All");

  // Support URL query parameters ?type= or ?company=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qType = params.get("type");
    const qCompany = params.get("company");
    if (qType && rows.some((r) => r.type === qType)) setType(qType);
    if (qCompany && rows.some((r) => r.company === qCompany)) setCompany(qCompany);
  }, [rows]);

  const allTypes = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.type))).sort()],
    [rows],
  );
  const companies = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.company))).sort()],
    [rows],
  );
  const years = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.date.slice(0, 4)))).sort().reverse()],
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (type !== "All" && row.type !== type) return false;
      if (company !== "All" && row.company !== company) return false;
      if (year !== "All" && !row.date.startsWith(year)) return false;
      return true;
    });
  }, [rows, type, company, year]);

  const selectClass =
    "h-8 rounded-md border border-line bg-surface px-2.5 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15";

  const hasFilters = type !== "All" || company !== "All" || year !== "All";

  return (
    <div className="space-y-3">
      <div className="surface-panel p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="overflow-x-auto no-scrollbar">
            <SegmentedControl
              options={QUICK_TYPES.filter((t) => t === "All" || rows.some((r) => r.type === t)).map((val) => ({
                value: val,
                label: val === "All" ? "All filings" : val,
              }))}
              value={QUICK_TYPES.includes(type) ? type : "All"}
              onChange={setType}
              ariaLabel="Quick filter by disclosure type"
              size="sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden h-3.5 w-3.5 text-faint sm:inline" />
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className={selectClass}
              aria-label="Filter by all disclosure types"
            >
              {allTypes.map((value) => (
                <option key={value} value={value}>
                  {value === "All" ? "All types" : value}
                </option>
              ))}
            </select>
            <select
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className={selectClass}
              aria-label="Filter by company"
            >
              {companies.map((value) => (
                <option key={value} value={value}>
                  {value === "All" ? "All issuers" : value}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className={selectClass}
              aria-label="Filter by year"
            >
              {years.map((value) => (
                <option key={value} value={value}>
                  {value === "All" ? "All years" : value}
                </option>
              ))}
            </select>

            <Badge variant="outline">
              <FileText className="h-2.5 w-2.5" /> {filtered.length}
            </Badge>

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setType("All");
                  setCompany("All");
                  setYear("All");
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface-panel">
          <EmptyState
            icon={<FileText className="h-4 w-4" />}
            title="No disclosures match these filters"
            description="Try a different type, company or year, or clear the filters."
          />
        </div>
      ) : (
        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          idKey="id"
          initialSort={{ key: "date", direction: "desc" }}
          columns={[
            { key: "date", header: "Published", type: "date" },
            { key: "company", header: "Issuer" },
            { key: "code", header: "Code", type: "mono", hideBelow: "md" },
            {
              key: "type",
              header: "Category",
              type: "badge",
              toneMap: {
                "Financial report": "accent",
                "Annual report": "accent",
                Dividend: "positive",
                AGM: "warning",
                EGM: "warning",
                "Board & governance": "default",
                ESG: "positive",
                "Press release": "default",
              },
            },
            { key: "title", header: "Headline", type: "link", hrefTemplate: "/disclosures/{id}" },
            { key: "source", header: "Document", type: "link", hrefTemplate: "{source}", align: "right" },
          ]}
          searchKeys={["company", "code", "title", "type"]}
          searchPlaceholder="Search headline, issuer or code…"
          csvFilename="maldex-disclosures.csv"
          caption="Corporate disclosures indexed from CMDA InformInvestor."
          pageSize={12}
          footerNote="Official CMDA document links"
        />
      )}
    </div>
  );
}
