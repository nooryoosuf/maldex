import Link from "next/link";
import { Trend } from "@/components/ui/trend";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/cn";

export function Stat({
  label,
  value,
  sub,
  trend,
  trendLabel,
  sparkline,
  source,
  href,
  badge,
  className,
  valueClassName,
  sparklinePositive,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  trend?: number | null;
  trendLabel?: string;
  sparkline?: number[];
  source?: React.ReactNode;
  href?: string;
  badge?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  sparklinePositive?: boolean;
}) {
  const body = (
    <div className={cn("flex h-full min-w-0 flex-col justify-between bg-surface px-4 py-3.5", href && "transition-colors hover:bg-surface-2/70", className)}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="mono-label leading-4">{label}</span>
          {badge}
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={cn("num font-mono text-[21px] font-medium leading-7 tracking-[-0.035em] text-ink", valueClassName)}>
            {value}
          </span>
          {trend !== undefined ? <Trend value={trend} size="sm" /> : null}
        </div>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {sub ? <div className="text-[11px] leading-4 text-muted">{sub}</div> : null}
          {trendLabel ? <div className="mt-0.5 font-mono text-[10px] text-faint">{trendLabel}</div> : null}
          {source ? <div className="mt-1.5">{source}</div> : null}
        </div>
        {sparkline && sparkline.length > 1 ? (
          <Sparkline data={sparkline} positive={sparklinePositive} width={72} height={24} className="shrink-0 opacity-90" />
        ) : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="group block focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatGrid({
  children,
  className,
  columns = "grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
}: {
  children: React.ReactNode;
  className?: string;
  columns?: string;
}) {
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-md border border-line bg-line", columns, className)}>
      {children}
    </div>
  );
}
