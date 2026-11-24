import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { Header } from "@/components/shell/header";
import { DataStatusBar } from "@/components/shell/data-status-bar";
import { Footer } from "@/components/shell/footer";
import { getPreferences } from "@/lib/preferences";

export const metadata: Metadata = {
  title: {
    default: "Maldex — Maldives financial & economic intelligence",
    template: "%s · Maldex",
  },
  description:
    "Understand the Maldivian economy and listed companies. Official market data, corporate disclosures and economic indicators with plain-language explanations and traceable sources.",
  applicationName: "Maldex",
  keywords: ["Maldives", "finance", "economy", "MSE", "CMDA", "stocks", "bonds", "sukuk", "economic indicators"],
  authors: [{ name: "Maldex" }],
  openGraph: {
    title: "Maldex — Maldives financial & economic intelligence",
    description:
      "A clear view of the Maldivian market and economy, with two levels of understanding: Simple and Advanced.",
    type: "website",
    locale: "en_MV",
    siteName: "Maldex",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#090e13" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { mode, theme } = await getPreferences();

  return (
    <html lang="en" className={theme === "dark" ? "dark" : undefined} data-viewing-mode={mode} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only z-[200] rounded-sm bg-ink px-3 py-2 text-xs text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <PreferencesProvider initialMode={mode} initialTheme={theme}>
          <Header />
          <DataStatusBar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </PreferencesProvider>
      </body>
    </html>
  );
}
