"use client";

import { useMemo, useState } from "react";
import { Building2, SlidersHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SegmentedControl } from "@/components/ui/segmented";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export interface DirectoryRow {
  code: string;
  company: string;
  slug: string;
  sector: string;
  sectorGroup: string;
  price: number | null;
  changePct: number | null;
  marketCap: number | null;
  pe: number | null;
  dividendYield: number | null;
  revenueGrowth: number | null;
  roe: number | null;
  sparkline: number[];
  lastDate: string | null;
}

const GROUPS = ["All", "Financials", "Telecom", "Consumer & trade", "Transport", "Tourism", "Insurance"];

export function CompanyDirectory({ rows }: { rows: DirectoryRow[] }) {
  const [group, setGroup] = useState("All");
  const filtered = useMemo(
    () => (group === "All" ? rows : rows.filter((row) => row.sectorGroup === group)),
    [rows, group],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-faint" />
          <SegmentedControl
            options={GROUPS.map((value) => ({ value, label: value === "All" ? "All sectors" : value }))}
            value={group}
            onChange={setGroup}
            ariaLabel="Filter companies by sector"
            size="sm"
          />
        </div>
        <Badge variant="outline">
          <Building2 className="h-2.5 w-2.5" /> {filtered.length} issuers
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-line bg-surface">
          <EmptyState
            icon={<Building2 className="h-4 w-4" />}
            title="No companies in this sector"
            description="Choose another sector filter to see the tracked issuers."
          />
        </div>
      ) : (
        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          idKey="code"
          initialSort={{ key: "marketCap", direction: "desc" }}
          columns={[
            { key: "company", header: "Company", type: "company", hrefTemplate: "/companies/{slug}", secondaryKey: "code" },
            { key: "sector", header: "Sector", hideBelow: "lg" },
            { key: "price", header: "Last price", type: "currency", align: "right", digits: 2 },
            { key: "changePct", header: "Change", type: "change", align: "right" },
            { key: "marketCap", header: "Market cap", type: "currency", align: "right", compact: true },
            { key: "pe", header: "P/E*", type: "number", align: "right", digits: 1, hideBelow: "md" },
            { key: "dividendYield", header: "Yield*", type: "percent", align: "right", digits: 1, hideBelow: "lg" },
            { key: "roe", header: "ROE*", type: "percent", align: "right", digits: 1, hideBelow: "lg" },
            { key: "sparkline", header: "30d", type: "sparkline", align: "right", hideBelow: "sm", sortable: false },
            { key: "lastDate", header: "Last trade", type: "date", align: "right", hideBelow: "lg" },
          ]}
          searchKeys={["company", "code", "sector"]}
          searchPlaceholder="Search by name, code or sector"
          csvFilename="maldex-companies.csv"
          caption="Tracked listed companies with official market prices and illustrative financial ratios."
          footerNote="* Ratios use illustrative financial statements, not official filings."
          pageSize={12}
        />
      )}
    </div>
  );
}
