import Link from "next/link";
import { ArrowUpRight, CircleDot } from "lucide-react";
import { getDisclosureStats } from "@/lib/data/disclosures";
import { getEconomyStats } from "@/lib/data/economy";
import { getMarketSnapshot } from "@/lib/data/market";
import { formatDate } from "@/lib/format";

export function DataStatusBar() {
  const market = getMarketSnapshot();
  const disclosures = getDisclosureStats();
  const economy = getEconomyStats();

  return (
    <div className="border-b border-line bg-surface-2/55">
      <div className="mx-auto flex h-8 max-w-shell items-center gap-3 overflow-hidden px-4 font-mono text-[9.5px] uppercase tracking-[0.055em] text-faint sm:px-5 lg:px-6">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-muted">
          <CircleDot className="h-2.5 w-2.5 text-positive" strokeWidth={2.2} />
          <span>Official Feed</span>
        </span>
        <span className="hidden h-3 w-px bg-line-strong sm:block" />
        <span className="hidden truncate sm:block">
          Market snapshot {formatDate(market.indexDate)} · MASIX {market.index?.toFixed(2) ?? "—"}
        </span>
        <span className="truncate sm:hidden">MSE {formatDate(market.indexDate, "short")}</span>
        <span className="hidden h-3 w-px bg-line-strong md:block" />
        <span className="hidden truncate md:block">Disclosures through {formatDate(disclosures.latestDate)}</span>
        <span className="hidden h-3 w-px bg-line-strong lg:block" />
        <span className="hidden truncate lg:block">Economy & MMA: {economy.fresh} current series</span>
        <span className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
          <span className="text-accent">MSE · MMA · CMDA Verified</span>
          <Link href="/sources" className="inline-flex items-center gap-0.5 text-muted transition-colors hover:text-ink">
            Sources <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </span>
        <Link href="/sources" className="ml-auto shrink-0 text-muted hover:text-ink sm:hidden" aria-label="Data sources">
          Sources <ArrowUpRight className="inline h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  );
}
