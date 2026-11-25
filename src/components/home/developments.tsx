import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanyMark } from "@/components/ui/company-mark";
import { SourceLabel } from "@/components/ui/source-label";
import {
  disclosureTypeTone,
  getCompanyMonogramForDisclosure,
  getDisclosureStats,
  getDisclosures,
  plainLanguageDisclosure,
} from "@/lib/data/disclosures";
import { formatDate } from "@/lib/format";
import type { ViewingMode } from "@/lib/types";

export function LatestDevelopments({ mode: _mode }: { mode?: ViewingMode }) {
  const items = getDisclosures(7);
  const stats = getDisclosureStats();

  return (
    <section className="surface-panel overflow-hidden" aria-labelledby="developments-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5">
        <div>
          <p className="mono-label mb-1">Corporate Stream</p>
          <h2 id="developments-heading" className="text-[15px] font-semibold tracking-[-0.015em] text-ink">
            Latest Official Disclosures
          </h2>
          <p className="mt-0.5 text-[11.5px] leading-5 text-muted">
            Audited filings, notices, and governance announcements via CMDA InformInvestor.
          </p>
        </div>
        <Link href="/disclosures" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
          All {stats.total} filings <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-line/70">
        {items.map((item) => {
          const monogram = getCompanyMonogramForDisclosure(item);
          return (
            <article
              key={item.id}
              className="group grid gap-2 px-4 py-3 transition-colors hover:bg-surface-2/40 sm:grid-cols-[78px_1fr] sm:gap-4"
            >
              <div className="flex items-center gap-2 sm:block">
                <span className="num font-mono text-[10px] font-medium text-muted">
                  {formatDate(item.publishedAt, "short")}
                </span>
                <span className="font-mono text-[9px] text-faint sm:mt-0.5 sm:block">
                  #{item.id}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CompanyMark code={item.code ?? undefined} monogram={monogram} size="xs" />
                  <span className="text-[11.5px] font-medium text-ink">{item.company}</span>
                  <Badge variant={disclosureTypeTone(item.type)}>{item.type}</Badge>
                </div>
                <h3 className="mt-1 text-[12.5px] font-medium leading-[18px] text-ink group-hover:text-accent transition-colors">
                  <Link href={`/disclosures/${item.id}`}>
                    {item.title}
                  </Link>
                </h3>
                <p className="simple-only mt-1 text-[11px] leading-[17px] text-muted">
                  {plainLanguageDisclosure(item)}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted transition-colors hover:text-ink"
                  >
                    Official PDF <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <Link href={`/disclosures/${item.id}`} className="text-[10.5px] font-medium text-accent hover:underline">
                    Filing summary →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/35 px-4 py-2.5">
        <span className="text-[10px] text-faint">Direct regulatory links indexed from CMDA InformInvestor</span>
        <SourceLabel sourceId="cmda-disclosures" />
      </div>
    </section>
  );
}
