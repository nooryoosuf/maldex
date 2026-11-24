import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTodayBrief } from "@/lib/insights";
import { formatDate } from "@/lib/format";
import { getMarketSnapshot } from "@/lib/data/market";

export function TodayBrief() {
  const items = getTodayBrief();
  const market = getMarketSnapshot();

  return (
    <section className="relative overflow-hidden rounded-md border border-[#26323d] bg-[#0e141a] text-[#e8eef3]">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#8fa2b0]">Today’s brief</p>
            <h2 className="mt-0.5 text-[13px] font-medium tracking-[-0.01em] text-[#f1f5f8]">What changed, from the data</h2>
          </div>
          <span className="rounded-xs border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#9fb1be]">
            {formatDate(market.indexDate, "short")}
          </span>
        </div>

        <div className="divide-y divide-white/[0.07]">
          {items.map((item) => (
            <Link key={item.number} href={item.href} className="group grid grid-cols-[22px_1fr_16px] gap-2.5 px-4 py-3 transition-colors hover:bg-white/[0.025]">
              <span className="pt-0.5 font-mono text-[9.5px] text-[#7d9bd6]">{item.number}</span>
              <span className="min-w-0">
                <span className="block text-[12px] font-medium leading-[18px] text-[#e9eff4] group-hover:text-white">{item.title}</span>
                <span className="mt-0.5 block text-[10.5px] leading-[16px] text-[#91a2af]">{item.body}</span>
                <span className="mt-1.5 block font-mono text-[8.5px] uppercase tracking-[0.1em] text-[#6f8492]">{item.source} · official source</span>
              </span>
              <ArrowRight className="mt-1 h-3 w-3 text-[#5e7484] transition-colors group-hover:text-[#a9c2da]" />
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.09em] text-[#708593]">Generated from official data · not editorial advice</span>
          <Link href="/sources" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#a7c2e8] hover:text-white">
            Methodology <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
