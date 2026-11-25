"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowUpRight, Moon, Search, Sun, X } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { NAV_ITEMS } from "@/lib/nav";
import { SegmentedControl } from "@/components/ui/segmented";
import { usePreferences } from "@/components/providers/preferences-provider";
import { cn } from "@/lib/cn";

export function MobileNav({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { mode, setMode, theme, toggleTheme } = usePreferences();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!mounted || !open) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return createPortal(
    <div className="fixed inset-0 z-[105] xl:hidden" role="presentation">
      <div className="absolute inset-0 bg-[#071018]/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col border-l border-line bg-surface shadow-pop animate-fade-in dark:shadow-pop-dark"
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          <button
            type="button"
            onClick={onSearch}
            className="mb-4 flex h-9 w-full items-center gap-2 rounded-sm border border-line bg-surface-2/60 px-3 text-xs text-muted"
          >
            <Search className="h-3.5 w-3.5" />
            Search companies, reports, indicators…
          </button>

          <nav aria-label="Mobile navigation" className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href) ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2/70 hover:text-ink",
                )}
              >
                {item.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-faint" />
              </Link>
            ))}
          </nav>

          <div className="mt-5 border-t border-line pt-4">
            <p className="mono-label mb-2">Viewing mode</p>
            <SegmentedControl
              options={[
                { value: "simple", label: "Simple", title: "Plain-language explanations" },
                { value: "advanced", label: "Advanced", title: "Full figures and ratios" },
              ]}
              value={mode}
              onChange={setMode}
              ariaLabel="Viewing mode"
              fullWidth
            />
            <p className="mt-2 text-[11px] leading-5 text-muted">
              {mode === "simple"
                ? "Plain language, context and simpler tables."
                : "Exact figures, ratios, source metadata and denser tables."}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="mt-4 flex w-full items-center justify-between rounded-sm border border-line px-3 py-2.5 text-xs text-muted hover:bg-surface-2 hover:text-ink"
          >
            <span className="inline-flex items-center gap-2">
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === "dark" ? "Light theme" : "Dark theme"}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{theme}</span>
          </button>
        </div>

        <div className="border-t border-line bg-surface-2/50 px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">Data status</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Market, economic and central bank data verified from MSE, MMA, CMDA and World Bank official records.
          </p>
          <Link href="/sources" onClick={onClose} className="mt-1 inline-flex text-[11px] font-medium text-accent hover:underline">
            View sources & methodology
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
