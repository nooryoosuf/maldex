import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getHomeInsights } from "@/lib/insights";
import { cn } from "@/lib/cn";

export function InsightsPanel() {
  const insights = getHomeInsights();

  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface" aria-labelledby="insights-heading">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
          <p className="mono-label">What this means</p>
        </div>
        <h2 id="insights-heading" className="mt-1 text-lg font-semibold tracking-[-0.015em] text-ink">
          Plain-language observations
        </h2>
        <p className="mt-1 text-[11px] leading-5 text-muted">
          Generated only from connected data. Every observation is labelled and linked to its source.
        </p>
      </div>

      <div className="divide-y divide-line">
        {insights.map((insight) => (
          <article key={insight.id} className="px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={insight.kind === "official" ? "positive" : "accent"}>
                {insight.kind === "official" ? "Official document" : "Automated observation"}
              </Badge>
              <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-faint">{insight.category}</span>
            </div>
            <h3 className="mt-2 text-[12.5px] font-medium leading-[19px] text-ink">{insight.title}</h3>
            <p className="mt-1 text-[11.5px] leading-[18px] text-muted">{insight.body}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <p className={cn("max-w-[260px] font-mono text-[8.5px] leading-[14px] text-faint")}>{insight.note}</p>
              <Link href={insight.href} className="inline-flex items-center gap-1 text-[10.5px] font-medium text-accent hover:underline">
                Read more <ArrowUpRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-line bg-surface-2/40 px-4 py-2.5 text-[9.5px] leading-4 text-faint">
        No insight is generated when the underlying data is unavailable. Automated observations describe data; they are
        not forecasts or investment advice.
      </div>
    </section>
  );
}
