import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { SOURCE_LIST } from "@/lib/data/sources";

const explore = [
  { label: "Overview", href: "/" },
  { label: "Market", href: "/market" },
  { label: "Companies", href: "/companies" },
  { label: "Company comparison", href: "/companies/compare" },
  { label: "Bonds & Sukuk", href: "/bonds" },
  { label: "Maturity calendar", href: "/bonds#maturities" },
];

const intelligence = [
  { label: "Economy", href: "/economy" },
  { label: "Disclosures", href: "/disclosures" },
  { label: "Financial reports", href: "/disclosures?type=Financial+report" },
  { label: "Data Explorer", href: "/data-explorer" },
  { label: "Sources & methodology", href: "/sources" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-shell px-4 py-10 sm:px-5 lg:px-6">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-xs leading-5 text-muted">
              A financial and economic intelligence platform for the Maldives. Built to make official information
              understandable, traceable and useful.
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
              Independent research preview · Malé, Maldives
            </p>
          </div>

          <div>
            <p className="mono-label mb-3">Explore</p>
            <ul className="space-y-1.5">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs text-muted transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mono-label mb-3">Intelligence</p>
            <ul className="space-y-1.5">
              {intelligence.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs text-muted transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mono-label mb-3">Primary sources</p>
            <ul className="space-y-1.5">
              {SOURCE_LIST.filter((source) => source.verification === "official-reported").map((source) => (
                <li key={source.id}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
                  >
                    {source.organisation}
                    <ArrowUpRight className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/sources" className="mt-3 inline-flex text-[11px] font-medium text-accent hover:underline">
              Verification status →
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-4 text-[10px] leading-5 text-faint md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">
            Maldex is not investment advice. Market data are exchange snapshots, not a live feed. Economic data are
            latest-available annual observations and may lag current conditions. Company financial figures in this
            preview are illustrative sample data and must not be used for decisions. Always verify against the linked
            official document.
          </p>
          <p className="shrink-0 font-mono uppercase tracking-[0.08em]">© 2026 Maldex</p>
        </div>
      </div>
    </footer>
  );
}
