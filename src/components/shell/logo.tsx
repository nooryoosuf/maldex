import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Maldex home">
      <span className="relative flex h-6 w-6 items-center justify-center rounded-[4px] bg-ink text-bg transition-transform duration-200 group-hover:-translate-y-px">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M4.5 17.5V6.5L12 14l7.5-7.5v11" stroke="currentColor" strokeWidth="2.1" strokeLinecap="square" />
          <circle cx="19.5" cy="5" r="1.6" fill="rgb(var(--accent))" />
        </svg>
      </span>
      {!compact ? (
        <span className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-semibold tracking-[-0.045em] text-ink">maldex</span>
          <span className="hidden font-mono text-[8.5px] uppercase tracking-[0.14em] text-faint sm:inline">MV</span>
        </span>
      ) : null}
    </Link>
  );
}
