import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default: "border-line bg-surface-2 text-muted",
  outline: "border-line bg-transparent text-muted",
  accent: "border-accent/20 bg-accent-soft text-accent",
  positive: "border-positive/20 bg-positive/10 text-positive",
  negative: "border-negative/20 bg-negative/10 text-negative",
  warning: "border-warning/25 bg-warning/10 text-warning",
  ink: "border-transparent bg-ink text-bg",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-xs border font-mono font-medium uppercase tracking-[0.06em]",
        size === "sm" ? "px-1.5 py-0.5 text-[9.5px] leading-[14px]" : "px-2 py-1 text-2xs",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
