"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

export function Tabs({
  items,
  defaultId,
  className,
  variant = "underline",
  ariaLabel = "Tabs",
}: {
  items: TabItem[];
  defaultId?: string;
  className?: string;
  variant?: "underline" | "pills";
  ariaLabel?: string;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-1 overflow-x-auto no-scrollbar",
          variant === "underline" ? "border-b border-line" : "",
        )}
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const index = items.findIndex((entry) => entry.id === active);
                const next = event.key === "ArrowRight" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
                setActive(items[next].id);
                document.getElementById(`tab-${items[next].id}`)?.focus();
              }}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-xs font-medium transition-colors",
                variant === "underline"
                  ? cn(
                      "h-9 border-b-2 -mb-px",
                      selected
                        ? "border-accent text-ink"
                        : "border-transparent text-muted hover:border-line-strong hover:text-ink",
                    )
                  : cn(
                      "h-8 rounded-sm",
                      selected ? "bg-surface text-ink ring-1 ring-line" : "text-muted hover:bg-surface-2 hover:text-ink",
                    ),
              )}
            >
              {item.label}
              {typeof item.count === "number" ? (
                <span className={cn("font-mono text-[10px]", selected ? "text-accent" : "text-faint")}>{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {activeItem ? (
        <div
          role="tabpanel"
          id={`panel-${activeItem.id}`}
          aria-labelledby={`tab-${activeItem.id}`}
          className="animate-fade-in pt-5"
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}
