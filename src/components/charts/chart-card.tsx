import { cn } from "@/lib/cn";

export function ChartCard({
  eyebrow,
  title,
  description,
  actions,
  children,
  footer,
  className,
  bodyClassName,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-md border border-line bg-surface", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          {eyebrow ? <p className="mono-label mb-1">{eyebrow}</p> : null}
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</h3>
          {description ? <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className={cn("px-2 pb-2 pt-4 sm:px-3", bodyClassName)}>{children}</div>
      {footer ? <div className="border-t border-line px-4 py-2">{footer}</div> : null}
    </section>
  );
}
