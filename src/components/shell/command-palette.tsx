"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Building2,
  FileText,
  Landmark,
  LineChart,
  Newspaper,
  Search,
  X,
} from "lucide-react";
import { SEARCH_INDEX, type SearchItem } from "@/lib/search-index";
import { cn } from "@/lib/cn";

const CATEGORY_ICON: Record<SearchItem["category"], React.ElementType> = {
  Company: Building2,
  Security: LineChart,
  Disclosure: Newspaper,
  Report: FileText,
  Economy: Landmark,
  Page: ArrowRight,
  Bond: FileText,
};

const CATEGORY_ORDER: SearchItem["category"][] = ["Page", "Company", "Bond", "Economy", "Report", "Disclosure", "Security"];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const preferred = SEARCH_INDEX.filter((item) =>
        ["Page", "Company"].includes(item.category),
      ).slice(0, 12);
      return preferred;
    }
    const terms = q.split(/\s+/).filter(Boolean);
    return SEARCH_INDEX.filter((item) => {
      const haystack = `${item.title} ${item.subtitle} ${item.keywords} ${item.category}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    }).slice(0, 40);
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const grouped = useMemo(() => {
    const groups = new Map<SearchItem["category"], SearchItem[]>();
    for (const item of results) {
      groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
    }
    return [...groups.entries()].sort(
      ([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
    );
  }, [results]);

  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  const go = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((value) => Math.min(flat.length - 1, value + 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((value) => Math.max(0, value - 1));
      }
      if (event.key === "Enter" && flat[active]) {
        event.preventDefault();
        go(flat[active]);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  if (!mounted || !open) return null;

  let runningIndex = -1;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-start justify-center px-3 pt-[8vh] sm:px-6 sm:pt-[12vh]" role="presentation">
      <div className="absolute inset-0 bg-[#071018]/55 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Maldex"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-surface shadow-pop animate-fade-up dark:shadow-pop-dark"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-faint" strokeWidth={1.8} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search companies, securities, reports, indicators…"
            aria-label="Search Maldex"
            aria-controls="search-results"
            aria-activedescendant={flat[active] ? `search-${flat[active].id}` : undefined}
            className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 items-center gap-1 rounded-sm border border-line px-2 font-mono text-[10px] text-muted hover:bg-surface-2"
          >
            ESC <X className="h-3 w-3" />
          </button>
        </div>

        <div id="search-results" className="scrollbar-thin max-h-[58vh] overflow-y-auto p-2" role="listbox" aria-label="Search results">
          {flat.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-ink">No results for “{query}”</p>
              <p className="mt-1 text-xs text-muted">Try a company code, report type or economic indicator.</p>
            </div>
          ) : (
            grouped.map(([category, items]) => {
              const Icon = CATEGORY_ICON[category];
              return (
                <div key={category} className="mb-1.5 last:mb-0">
                  <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">{category}</div>
                  {items.map((item) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const selected = index === active;
                    return (
                      <button
                        key={item.id}
                        id={`search-${item.id}`}
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(item)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left transition-colors",
                          selected ? "bg-surface-2" : "hover:bg-surface-2/60",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-line",
                            selected ? "bg-surface text-accent" : "bg-surface text-muted",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">{item.title}</span>
                          <span className="block truncate text-[10.5px] text-muted">{item.subtitle}</span>
                        </span>
                        <ArrowRight className={cn("h-3.5 w-3.5 shrink-0 text-faint", selected && "text-ink")} />
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-4 py-2 font-mono text-[9.5px] text-faint">
          <span className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span className="hidden sm:inline">esc close</span>
          </span>
          <span>{SEARCH_INDEX.length} indexed records</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
