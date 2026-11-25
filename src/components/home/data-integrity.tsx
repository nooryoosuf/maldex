import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DataBadge } from "@/components/ui/data-badge";

const rows = [
  {
    label: "Market prices, MASIX & market cap",
    status: "official-reported" as const,
    source: "Maldives Stock Exchange",
    note: "Official daily trade exports and index records.",
  },
  {
    label: "Foreign reserves, currency peg & T-bills",
    status: "official-reported" as const,
    source: "Maldives Monetary Authority",
    note: "Official central bank statistics and debt yields.",
  },
  {
    label: "Corporate financial filings & disclosures",
    status: "official-reported" as const,
    source: "CMDA InformInvestor",
    note: "Official audited annual and quarterly filings.",
  },
  {
    label: "Macroeconomic national accounts",
    status: "official-reported" as const,
    source: "World Bank Open Data",
    note: "Standardized annual economic series.",
  },
];

export function DataIntegrityPanel() {
  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface" aria-labelledby="integrity-heading">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
          <p className="mono-label">Data integrity</p>
        </div>
        <h2 id="integrity-heading" className="mt-1 text-sm font-semibold tracking-[-0.01em] text-ink">
          Verified Official Sources
        </h2>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.label} className="px-4 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] leading-4 text-ink">{row.label}</span>
              <DataBadge status={row.status} />
            </div>
            <p className="mt-1 font-mono text-[9px] leading-4 text-faint">
              {row.source} · {row.note}
            </p>
          </li>
        ))}
      </ul>
      <div className="border-t border-line bg-surface-2/40 px-4 py-2">
        <Link href="/sources" className="text-[10px] font-medium text-accent hover:underline">
          Sources, verification and methodology →
        </Link>
      </div>
    </section>
  );
}
