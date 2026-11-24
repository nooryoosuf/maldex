"use client";

import { useId, useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function InfoTip({
  label,
  children,
  side = "top",
  className,
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-faint transition-colors hover:text-ink"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "absolute z-50 w-64 rounded-md border border-line bg-surface p-3 text-xs font-normal leading-5 text-muted shadow-pop animate-scale-in dark:shadow-pop-dark",
            side === "top" ? "bottom-full left-1/2 mb-2 -translate-x-1/2" : "left-1/2 top-full mt-2 -translate-x-1/2",
          )}
        >
          <span className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-2xs font-medium uppercase tracking-[0.1em] text-ink">{label}</span>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-faint hover:text-ink">
              <X className="h-3 w-3" />
            </button>
          </span>
          {children}
        </span>
      ) : null}
    </span>
  );
}

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm border border-line bg-ink px-2 py-1 font-mono text-[10px] text-bg opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
