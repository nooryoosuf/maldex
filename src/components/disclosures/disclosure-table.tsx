"use client";

import { useMemo, useState } from "react";
import { FileText, Filter } from "lucide-react";
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

const TYPES = ["All", "Financial report", "Annual report", "Dividend", "AGM", "EGM", "Board & governance", "ESG", "Press release", "Other"];

export function DisclosureTable({ rows }: { rows: DisclosureRow[] }) {
  const [type, setType] = useState("All");
  const [company, setCompany] = useState("All");
  const [year, setYear] = useState("All");

  const companies = useMemo(() => ["All", ...Array.from(new Set(rows.map((row) => row.company))).sort()], [rows]);
  const years = useMemo(() => ["All", ...Array.from(new Set(rows.map((row) => row.date.slice(0, 4)))).sort().reverse()], [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (type !== "All" && row.type !== type) return false;
      if (company !== "All" && row.company !== company) return false;
      if (year !== "All" && !row.date.startsWith(year)) return false;
      return true;
    });
  }, [rows, type, company, year]);

  const selectClass = "h-8 rounded-sm border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-faint" />
        <select value={type} onChange={(event) => setType(event.target.value)} className={selectClass} aria-label="Filter by disclosure type">
          {TYPES.filter((value) => value === "All" || rows.some((row) => row.type === value)).map((value) => (
            <option key={value} value={value}>{value === "All" ? "All types" : value}</option>
          ))}
        </select>
        <select value={company} onChange={(event) => setCompany(event.target.value)} className={selectClass} aria-label="Filter by company">
          {companies.map((value) => (
            <option key={value} value={value}>{value === "All" ? "All companies" : value}</option>
          ))}
        </select>
        <select value={year} onChange={(event) => setYear(event.target.value)} className={selectClass} aria-label="Filter by year">
          {years.map((value) => (
            <option key={value} value={value}>{value === "All" ? "All years" : value}</option>
          ))}
        </select>
        <Badge variant="outline">
          <FileText className="h-2.5 w-2.5" /> {filtered.length} of {rows.length}
        </Badge>
        {(type !== "All" || company !== "All" || year !== "All") ? (
          <button
            type="button"
            onClick={() => {
              setType("All");
              setCompany("All");
              setYear("All");
            }}
            className="text-[10.5px] font-medium text-accent hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-line bg-surface">
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
            { key: "company", header: "Company" },
            { key: "code", header: "Code", type: "mono", hideBelow: "md" },
            { key: "type", header: "Type", type: "badge", toneMap: { "Financial report": "accent", "Annual report": "accent", Dividend: "positive", AGM: "warning", EGM: "warning", "Board & governance": "default", ESG: "positive", "Press release": "default" } },
            { key: "title", header: "Title", type: "link", hrefTemplate: "/disclosures/{id}" },
            { key: "source", header: "Official document", type: "link", hrefTemplate: "{source}" },
          ]}
          searchKeys={["company", "code", "title", "type"]}
          searchPlaceholder="Search title, company or code"
          csvFilename="maldex-disclosures.csv"
          caption="Corporate disclosures indexed from CMDA InformInvestor."
          pageSize={12}
          footerNote="Metadata only — document contents are not extracted"
        />
      )}
    </div>
  );
}
