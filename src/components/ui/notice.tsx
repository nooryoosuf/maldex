import { AlertTriangle, Database, FlaskConical, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const styles = {
  info: {
    wrapper: "border-line bg-surface-2/60",
    icon: "text-muted",
    title: "text-ink",
    Icon: Info,
  },
  official: {
    wrapper: "border-accent/20 bg-accent-soft/50",
    icon: "text-accent",
    title: "text-ink",
    Icon: ShieldCheck,
  },
  warning: {
    wrapper: "border-warning/25 bg-warning/[0.06]",
    icon: "text-warning",
    title: "text-ink",
    Icon: AlertTriangle,
  },
  demo: {
    wrapper: "border-warning/30 bg-warning/[0.07]",
    icon: "text-warning",
    title: "text-ink",
    Icon: FlaskConical,
  },
  source: {
    wrapper: "border-line bg-surface",
    icon: "text-muted",
    title: "text-ink",
    Icon: Database,
  },
} as const;

export function Notice({
  variant = "info",
  title,
  children,
  action,
  className,
  compact = false,
}: {
  variant?: keyof typeof styles;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const style = styles[variant];
  const Icon = style.Icon;
  return (
    <div className={cn("flex items-start gap-3 rounded-md border px-4 py-3", style.wrapper, compact && "px-3 py-2.5", className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} strokeWidth={1.8} />
      <div className="min-w-0 flex-1 text-xs leading-5 text-muted">
        {title ? <p className={cn("mb-0.5 text-xs font-medium", style.title)}>{title}</p> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
