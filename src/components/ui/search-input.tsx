"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  autoFocus = false,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-faint" strokeWidth={1.8} />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-sm border border-line bg-surface pl-8 pr-8 text-xs text-ink placeholder:text-faint focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 inline-flex h-5 w-5 items-center justify-center rounded-xs text-faint hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}
