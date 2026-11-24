import { cn } from "@/lib/cn";

export const selectClass =
  "h-8 rounded-sm border border-line bg-surface px-2 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:opacity-50";

export function Select({
  label,
  className,
  children,
  hideLabel = false,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hideLabel?: boolean }) {
  return (
    <label className={cn("inline-flex flex-col gap-1", className)}>
      {label && !hideLabel ? <span className="mono-label">{label}</span> : null}
      <select className={selectClass} aria-label={hideLabel ? label : undefined} {...props}>
        {children}
      </select>
    </label>
  );
}
