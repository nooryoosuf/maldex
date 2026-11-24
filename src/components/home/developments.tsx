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

export function LatestDevelopments({ mode }: { mode: ViewingMode }) {
  const items = getDisclosures(8);
  const stats = getDisclosureStats();

  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface" aria-labelledby="developments-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="mono-label mb-1">Latest developments</p>
          <h2 id="developments-heading" className="text-lg font-semibold tracking-[-0.015em] text-ink">
            Official disclosures, in order
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Company announcements, reports and meetings published through CMDA InformInvestor.
          </p>
        </div>
        <Link href="/disclosures" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
          All {stats.total} disclosures <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-line">
        {items.map((item) => {
          const monogram = getCompanyMonogramForDisclosure(item);
          return (
            <article key={item.id} className="grid gap-2 px-4 py-3.5 transition-colors hover:bg-surface-2/35 sm:grid-cols-[74px_1fr] sm:gap-4">
              <div className="flex items-center gap-2 sm:block">
                <span className="num font-mono text-[10px] text-muted">{formatDate(item.publishedAt, "short")}</span>
                <span className="font-mono text-[9px] text-faint sm:mt-0.5 sm:block">{item.publishedAt.slice(0, 4)}</span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CompanyMark monogram={monogram} size="xs" />
                  <span className="text-[11px] font-medium text-ink">{item.company}</span>
                  <Badge variant={disclosureTypeTone(item.type)}>{item.type}</Badge>
                  {mode === "advanced" ? (
                    <span className="font-mono text-[9px] text-faint">#{item.id}</span>
                  ) : null}
                </div>
                <h3 className="mt-1.5 text-[12.5px] font-medium leading-[18px] text-ink">
                  <Link href={`/disclosures/${item.id}`} className="hover:text-accent">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-1 text-[11px] leading-[17px] text-muted">
                  {mode === "simple" ? plainLanguageDisclosure(item) : `${item.type} published on ${formatDate(item.publishedAt, "long")}. Official document metadata only; figures have not been extracted by Maldex.`}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.07em] text-muted transition-colors hover:text-ink"
                  >
                    Official document <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <Link href={`/disclosures/${item.id}`} className="text-[10px] font-medium text-accent hover:underline">
                    Details
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-4 py-2.5">
        <span className="text-[10px] text-faint">Headlines and document links indexed from CMDA · contents not verified by Maldex</span>
        <SourceLabel sourceId="cmda-disclosures" />
      </div>
    </section>
  );
}
