import { cookies } from "next/headers";
import type { Theme, ViewingMode } from "@/lib/types";
import { MODE_COOKIE, THEME_COOKIE } from "@/lib/preferences-constants";

export { MODE_COOKIE, PREFERENCE_MAX_AGE, THEME_COOKIE } from "@/lib/preferences-constants";

export async function getViewingMode(): Promise<ViewingMode> {
  const store = await cookies();
  const value = store.get(MODE_COOKIE)?.value;
  return value === "advanced" ? "advanced" : "simple";
}

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;
  return value === "dark" ? "dark" : "light";
}

export async function getPreferences(): Promise<{ mode: ViewingMode; theme: Theme }> {
  const [mode, theme] = await Promise.all([getViewingMode(), getTheme()]);
  return { mode, theme };
}
