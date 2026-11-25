"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: React.ReactNode;
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
  const tabGroupId = useId();
  const reduced = useReducedMotion();
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-1 overflow-x-auto no-scrollbar",
          variant === "underline" ? "border-b border-line" : "rounded-md border border-line bg-surface-2/60 p-1 w-fit max-w-full",
        )}
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              role="tab"
              id={`tab-${tabGroupId}-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tabGroupId}-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const index = items.findIndex((entry) => entry.id === active);
                const next = event.key === "ArrowRight" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
                setActive(items[next].id);
                document.getElementById(`tab-${tabGroupId}-${items[next].id}`)?.focus();
              }}
              className={cn(
                "relative z-0 flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 text-xs font-medium transition-colors",
                variant === "underline"
                  ? cn(
                      "h-10",
                      selected ? "text-ink" : "text-muted hover:text-ink",
                    )
                  : cn(
                      "h-8 rounded-sm",
                      selected ? "text-ink" : "text-muted hover:text-ink",
                    ),
              )}
            >
              {selected && variant === "underline" ? (
                <motion.span
                  layoutId={reduced ? undefined : `tab-line-${tabGroupId}`}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] bg-accent"
                />
              ) : null}
              {selected && variant === "pills" ? (
                <motion.span
                  layoutId={reduced ? undefined : `tab-pill-${tabGroupId}`}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  className="pointer-events-none absolute inset-0 -z-10 rounded-sm bg-surface shadow-sm ring-1 ring-line"
                />
              ) : null}
              <span>{item.label}</span>
              {typeof item.count === "number" ? (
                <span
                  className={cn(
                    "rounded-xs px-1.5 py-0.2 font-mono text-[10px]",
                    selected ? "bg-accent-soft text-accent" : "bg-surface-2 text-faint",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {activeItem ? (
        <motion.div
          key={activeItem.id}
          role="tabpanel"
          id={`panel-${tabGroupId}-${activeItem.id}`}
          aria-labelledby={`tab-${tabGroupId}-${activeItem.id}`}
          initial={reduced ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="pt-5"
        >
          {activeItem.content}
        </motion.div>
      ) : null}
    </div>
  );
}
