"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, HelpCircle, Table2 } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Reusable plain-language progressive disclosure ("What does this mean?")
 * designed so citizens can reveal clear context without visual clutter.
 */
export function WhatDoesThisMean({
  children,
  title = "What does this mean?",
  defaultOpen = false,
  className,
  compact = false,
}: {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const reduced = useReducedMotion();

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          compact ? "text-[10.5px]" : "text-[11.5px]",
        )}
      >
        <HelpCircle className={cn("shrink-0 text-accent/80 transition-colors group-hover:text-accent", compact ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={1.9} />
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-faint transition-transform duration-150",
            open && "rotate-180 text-ink",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-2 rounded-md border border-line/80 bg-surface-2/55 px-3 py-2.5 text-[11.5px] leading-[18px] text-muted">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Reusable technical / Level-3 progressive disclosure ("View detailed data")
 * for historical observations, technical formulas, and dense metadata.
 */
export function DetailDrawer({
  children,
  label = "View detailed data",
  hideLabel = "Hide detailed data",
  badge,
  defaultOpen = false,
  className,
}: {
  children: React.ReactNode;
  label?: string;
  hideLabel?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const reduced = useReducedMotion();

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="group inline-flex items-center gap-1.5 rounded-sm font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-ink"
        >
          <Table2 className="h-3 w-3 text-faint transition-colors group-hover:text-accent" />
          <span>{open ? hideLabel : label}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-faint transition-transform duration-150",
              open && "rotate-180 text-ink",
            )}
          />
        </button>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-2.5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
