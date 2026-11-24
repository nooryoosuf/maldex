"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function Popover({
  trigger,
  children,
  align = "end",
  className,
  panelClassName,
  label,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  panelClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="dialog"
          className={cn(
            "absolute top-full z-50 mt-2 min-w-[220px] rounded-md border border-line bg-surface p-1.5 shadow-pop animate-scale-in dark:shadow-pop-dark",
            align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
