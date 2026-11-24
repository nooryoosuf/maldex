import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mono-label mb-1.5">{eyebrow}</p> : null}
        <h2 id={id} className="text-lg font-semibold tracking-[-0.015em] text-ink">
          {title}
        </h2>
        {description ? <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
