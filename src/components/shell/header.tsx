"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { Logo } from "@/components/shell/logo";
import { CommandPalette } from "@/components/shell/command-palette";
import { MobileNav } from "@/components/shell/mobile-nav";
import { SegmentedControl } from "@/components/ui/segmented";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const { mode, setMode, theme, toggleTheme, isPending } = usePreferences();
  const reduced = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K");
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-shell items-center gap-3 px-4 sm:px-5 lg:px-6">
          <Logo />

          <nav className="ml-4 hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative z-0 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                    active ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId={reduced ? undefined : "header-nav-pill"}
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                      className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-surface-2 ring-1 ring-line/80"
                    />
                  ) : null}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group inline-flex h-8 items-center gap-2 rounded-md border border-line bg-surface px-2 text-muted shadow-[0_1px_1px_rgba(15,23,32,0.02)] transition-all hover:border-line-strong hover:text-ink sm:w-44 sm:justify-between sm:px-2.5"
              aria-label="Search Maldex"
            >
              <span className="inline-flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-faint transition-colors group-hover:text-ink" strokeWidth={1.8} />
                <span className="hidden text-[11.5px] sm:inline">Search…</span>
              </span>
              <kbd className="hidden items-center rounded-xs border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-faint sm:inline-flex">
                {shortcut}
              </kbd>
            </button>

            <div className="hidden md:block">
              <SegmentedControl
                options={[
                  { value: "simple", label: "Simple", title: "Plain-language explanations" },
                  { value: "advanced", label: "Advanced", title: "Full figures, ratios and source detail" },
                ]}
                value={mode}
                onChange={setMode}
                ariaLabel="Viewing mode"
                size="sm"
              />
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-surface hover:text-ink"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.7} /> : <Moon className="h-4 w-4" strokeWidth={1.7} />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-surface hover:text-ink xl:hidden"
            >
              <Menu className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
        {isPending ? (
          <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">
            <div className="h-full w-full animate-pulse bg-accent/60" />
          </div>
        ) : null}
      </header>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
      />
    </>
  );
}
