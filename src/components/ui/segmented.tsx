"use client";

import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
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
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-surface-2/80 p-0.5",
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
              "relative flex-1 rounded-sm font-medium transition-colors",
              size === "sm" ? "h-6 px-2 text-[10.5px]" : "h-7 px-2.5 text-xs",
              active
                ? "bg-surface text-ink shadow-[0_1px_2px_rgba(15,23,30,0.08)] ring-1 ring-line"
                : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
