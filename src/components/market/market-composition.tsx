"use client";

import { useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { CompositionTreemap, type TreemapItem } from "@/components/charts/treemap-chart";
import { DonutChart, type DonutSlice } from "@/components/charts/donut-chart";
import { SegmentedControl } from "@/components/ui/segmented";
import { SourceLabel } from "@/components/ui/source-label";

export function MarketComposition({
  items,
  sectorSlices,
  defaultView = "treemap",
}: {
  items: TreemapItem[];
  sectorSlices: DonutSlice[];
  defaultView?: "treemap" | "sectors";
}) {
  const [view, setView] = useState<"treemap" | "sectors">(defaultView);

  return (
    <ChartCard
      eyebrow="Exchange Structure"
      title={view === "treemap" ? "Market Cap Map by Issuer" : "Market Cap Share by Sector"}
      description={
        view === "treemap"
          ? "Tile area reflects official MSE market capitalisation; tile tint reflects latest session price change. Click any company to open its profile."
          : "Distribution of combined equity market value across Maldivian economic sectors."
      }
      explanation="A small number of flagship issuers—led by banking and telecommunications—account for the vast majority of total Maldives Stock Exchange capitalisation. Viewing by treemap or sector makes this concentration immediately visible."
      actions={
        <SegmentedControl
          options={[
            { value: "treemap", label: "Issuer Map" },
            { value: "sectors", label: "By Sector" },
          ]}
          value={view}
          onChange={(v) => setView(v as "treemap" | "sectors")}
          ariaLabel="Composition chart mode"
          size="sm"
        />
      }
      tableData={items as unknown as Record<string, unknown>[]}
      tableColumns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Issuer" },
        { key: "marketCap", label: "Market Cap (MVR)", format: "compactCurrency" },
        { key: "changePct", label: "Move (%)", format: "percent", digits: 2 },
      ]}
      csvFilename="maldex-market-composition.csv"
      expandable
      footer={
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9.5px] text-faint">Published per-security market capitalisation</span>
          <SourceLabel sourceId="mse-market" showDate={false} />
        </div>
      }
    >
      {view === "treemap" ? (
        <CompositionTreemap items={items} height={255} />
      ) : (
        <DonutChart data={sectorSlices} format="compactCurrency" centerLabel="Total Cap" height={225} />
      )}
    </ChartCard>
  );
}
