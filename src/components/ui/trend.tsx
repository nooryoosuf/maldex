import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Trend({
  value,
  digits = 2,
  className,
  showArrow = true,
  prefix,
  plain = false,
  size = "md",
  invert = false,
}: {
  value: number | null | undefined;
  digits?: number;
  className?: string;
  showArrow?: boolean;
  prefix?: string;
  plain?: boolean;
  size?: "sm" | "md";
  invert?: boolean;
}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={cn("font-mono text-muted", className)}>—</span>;
  }
  const positive = value > 0;
  const negative = value < 0;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono tabular-nums",
        size === "sm" ? "text-[10.5px]" : "text-xs",
        positive ? (invert ? "text-negative" : "text-positive") : negative ? (invert ? "text-positive" : "text-negative") : "text-muted",
        className,
      )}
    >
      {showArrow ? <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2} /> : null}
      {prefix ? <span className="text-faint">{prefix}</span> : null}
      {plain && positive ? "Up " : plain && negative ? "Down " : null}
      {formatPercent(Math.abs(value), digits)}
    </span>
  );
}

export function TrendLabel({
  value,
  label,
  className,
}: {
  value: number | null | undefined;
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <Trend value={value} size="sm" />
      <span className="text-[11px] text-muted">{label}</span>
    </span>
  );
}
