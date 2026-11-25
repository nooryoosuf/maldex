import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
  rangeBar,
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
  rangeBar?: { min: number; max: number; current: number; lowLabel?: string; highLabel?: string };
}) {
  const rangePct =
    rangeBar && rangeBar.max > rangeBar.min
      ? Math.max(0, Math.min(100, ((rangeBar.current - rangeBar.min) / (rangeBar.max - rangeBar.min)) * 100))
      : null;

  const body = (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-col justify-between bg-surface px-4 py-3.5 transition-colors",
        href && "hover:bg-surface-2/65",
        className,
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="mono-label leading-4">{label}</span>
          {badge ?? (href ? <ArrowUpRight className="h-3 w-3 text-faint opacity-0 transition-opacity group-hover:opacity-100" /> : null)}
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={cn("num font-mono text-[21px] font-semibold leading-7 tracking-[-0.03em] text-ink", valueClassName)}>
            {value}
          </span>
          {trend !== undefined ? <Trend value={trend} size="sm" /> : null}
        </div>
      </div>

      {rangePct !== null && rangeBar ? (
        <div className="mt-2.5">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{ width: `${rangePct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[9px] text-faint">
            <span>{rangeBar.lowLabel ?? rangeBar.min.toFixed(2)}</span>
            <span>{rangeBar.highLabel ?? rangeBar.max.toFixed(2)}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {sub ? <div className="truncate text-[11px] leading-4 text-muted">{sub}</div> : null}
          {trendLabel ? <div className="mt-0.5 truncate font-mono text-[9.5px] text-faint">{trendLabel}</div> : null}
          {source ? <div className="mt-1.5">{source}</div> : null}
        </div>
        {sparkline && sparkline.length > 1 ? (
          <Sparkline data={sparkline} positive={sparklinePositive} width={72} height={24} className="shrink-0" />
        ) : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="group block h-full focus-visible:outline-none">
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
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-lg border border-line bg-line shadow-[0_1px_2px_rgba(15,23,32,0.03)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.035)]",
        columns,
        className,
      )}
    >
      {children}
    </div>
  );
}
