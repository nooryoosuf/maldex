import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-line pb-6 pt-8 md:pb-8 md:pt-10", className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="mono-label mb-2.5 text-accent">{eyebrow}</p> : null}
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-ink md:text-4xl">{title}</h1>
          {description ? (
            <div className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted md:text-md">{description}</div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {meta ? <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/70 pt-3 text-xs text-muted">{meta}</div> : null}
    </header>
  );
}
