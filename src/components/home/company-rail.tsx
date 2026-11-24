import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CompanyMark } from "@/components/ui/company-mark";
import { Trend } from "@/components/ui/trend";
import { getCompanyByCode } from "@/lib/data/companies";
import { getCompanyMarketRows } from "@/lib/data/market";
import { formatMvr, formatNumber } from "@/lib/format";

export function CompanyRail() {
  const rows = [...getCompanyMarketRows()]
    .filter((row) => row.marketCap !== null)
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
    .slice(0, 5);

  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface" aria-labelledby="company-rail-heading">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="mono-label mb-1">Companies</p>
          <h2 id="company-rail-heading" className="text-sm font-semibold tracking-[-0.01em] text-ink">
            By market value
          </h2>
        </div>
        <Link href="/companies" className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline">
          Directory <ArrowUpRight className="h-2.5 w-2.5" />
        </Link>
      </div>
      <div className="divide-y divide-line">
        {rows.map((row) => {
          const company = getCompanyByCode(row.code);
          return (
            <Link
              key={row.code}
              href={`/companies/${row.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2/50"
            >
              <CompanyMark monogram={company?.monogram ?? row.code.slice(0, 2)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-ink">{company?.shortName ?? row.company}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-faint">
                  {row.code} · {formatMvr(row.marketCap, { compact: true })}
                </p>
              </div>
              <div className="text-right">
                <p className="num font-mono text-[12px] text-ink">{formatNumber(row.price, 2)}</p>
                <Trend value={row.changePct} size="sm" />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="border-t border-line bg-surface-2/40 px-4 py-2">
        <Link href="/companies/compare" className="text-[10px] font-medium text-muted hover:text-ink">
          Compare companies side by side →
        </Link>
      </div>
    </section>
  );
}
