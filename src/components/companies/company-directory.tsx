"use client";

import { useMemo, useState } from "react";
import { Building2, SlidersHorizontal, FileText } from "lucide-react";
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
  shares: number | null;
  volume: number;
  value: number;
  filingsCount: number;
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
            { key: "shares", header: "Shares", type: "number", align: "right", compact: true, hideBelow: "md" },
            { key: "filingsCount", header: "CMDA Filings", type: "number", align: "right", hideBelow: "md" },
            { key: "sparkline", header: "30d", type: "sparkline", align: "right", hideBelow: "sm", sortable: false },
            { key: "lastDate", header: "Last trade", type: "date", align: "right", hideBelow: "lg" },
          ]}
          searchKeys={["company", "code", "sector"]}
          searchPlaceholder="Search by name, code or sector"
          csvFilename="maldex-companies.csv"
          caption="Official MSE listed equity issuers with trading prices, capitalisation, and CMDA filing links."
          pageSize={12}
        />
      )}
    </div>
  );
}
