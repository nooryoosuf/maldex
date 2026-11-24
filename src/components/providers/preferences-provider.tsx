"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Theme, ViewingMode } from "@/lib/types";
import { MODE_COOKIE, PREFERENCE_MAX_AGE, THEME_COOKIE } from "@/lib/preferences-constants";

interface PreferencesContextValue {
  mode: ViewingMode;
  theme: Theme;
  setMode: (mode: ViewingMode) => void;
  toggleTheme: () => void;
  isPending: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${PREFERENCE_MAX_AGE}; samesite=lax`;
}

export function PreferencesProvider({
  initialMode,
  initialTheme,
  children,
}: {
  initialMode: ViewingMode;
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<ViewingMode>(initialMode);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setMode = useCallback(
    (next: ViewingMode) => {
      if (next === mode) return;
      setModeState(next);
      writeCookie(MODE_COOKIE, next);
      document.documentElement.dataset.viewingMode = next;
      startTransition(() => {
        router.refresh();
      });
    },
    [mode, router, startTransition],
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    writeCookie(THEME_COOKIE, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#090e13" : "#fafaf8");
  }, [theme]);

  const value = useMemo(
    () => ({ mode, theme, setMode, toggleTheme, isPending }),
    [mode, theme, setMode, toggleTheme, isPending],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used within PreferencesProvider");
  return context;
}
