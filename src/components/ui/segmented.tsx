"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  title?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
  fullWidth = false,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
}) {
  const groupId = useId();
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-surface-2/85 p-0.5",
        fullWidth && "flex w-full",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-0 flex-1 select-none whitespace-nowrap rounded-sm font-medium transition-colors",
              size === "sm" ? "h-6 px-2.5 text-[10.5px]" : "h-7 px-3 text-xs",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId={reduced ? undefined : `seg-${groupId}`}
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-sm bg-surface shadow-[0_1px_2px_rgba(15,23,30,0.08)] ring-1 ring-line dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
              />
            ) : null}
            <span className="inline-flex items-center justify-center gap-1.5">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
