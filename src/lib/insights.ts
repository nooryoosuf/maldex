import { getDisclosures, plainLanguageDisclosure } from "@/lib/data/disclosures";
import { getIndicator } from "@/lib/data/economy";
import { getMarketSnapshot, getMostActiveEquity } from "@/lib/data/market";
import { formatDate, formatMvr, formatNumber, formatPercent } from "@/lib/format";

export interface BriefItem {
  number: string;
  title: string;
  body: string;
  href: string;
  source: string;
}

export function getTodayBrief(): BriefItem[] {
  const market = getMarketSnapshot();
  const active = getMostActiveEquity();
  const latest = getDisclosures(1)[0];
  const items: BriefItem[] = [];

  if (market.index !== null) {
    items.push({
      number: "01",
      title: `MASIX closed at ${formatNumber(market.index, 2)}`,
      body: `${market.indexChange30dPct !== null ? `${formatPercent(market.indexChange30dPct, 1, true)} over 30 days` : "30-day change unavailable"}${market.indexChange1yPct !== null ? ` and ${formatPercent(market.indexChange1yPct, 1, true)} over 12 months` : ""}.`,
      href: "/market",
      source: "MSE",
    });
  }

  if (market.sessionValue > 0) {
    items.push({
      number: "02",
      title: `${formatMvr(market.sessionValue, { compact: true })} traded in the latest session`,
      body: `${formatNumber(market.sessionTrades)} trades across ${formatNumber(market.sessionVolume)} units${active ? `. ${active.code} accounted for ${formatMvr(active.value, { compact: true })}` : ""}.`,
      href: "/market#recent-trades",
      source: "MSE",
    });
  }

  if (latest) {
    items.push({
      number: "03",
      title: latest.title,
      body: `${latest.company} · published ${formatDate(latest.publishedAt)}. The latest item in the official CMDA disclosure feed.`,
      href: `/disclosures/${latest.id}`,
      source: "CMDA",
    });
  }

  return items;
}

export interface HomeInsight {
  id: string;
  kind: "automated" | "official";
  category: "Market" | "Economy" | "Disclosure";
  title: string;
  body: string;
  note: string;
  href: string;
  sourceId: string;
  sourceUrl: string;
}

export function getHomeInsights(): HomeInsight[] {
  const market = getMarketSnapshot();
  const inflation = getIndicator("inflation");
  const gdp = getIndicator("gdpGrowth");
  const latest = getDisclosures(1)[0];
  const insights: HomeInsight[] = [];

  if (market.index !== null && market.indexChange30dPct !== null) {
    const direction = market.indexChange30dPct < 0 ? "fell" : "rose";
    insights.push({
      id: "market-month",
      kind: "automated",
      category: "Market",
      title: `The market index ${direction} ${formatPercent(Math.abs(market.indexChange30dPct), 1)} over the past month.`,
      body:
        "The MASIX index tracks the combined movement of listed shares. A lower index means the aggregate value of tracked shares declined; individual companies can still move differently.",
      note: `Automated from the official MSE snapshot on ${formatDate(market.indexDate)}.`,
      href: "/market",
      sourceId: "mse-market",
      sourceUrl: "https://stockexchange.mv/insights",
    });
  }

  if (inflation?.latest && inflation.observations.at(-2)) {
    const previous = inflation.observations.at(-2)!;
    const faster = inflation.latest.value > previous.value;
    insights.push({
      id: "inflation",
      kind: "automated",
      category: "Economy",
      title: `Consumer prices rose ${faster ? "faster" : "more slowly"} in ${inflation.latest.period} than in ${previous.period}.`,
      body: `Annual inflation was ${formatPercent(inflation.latest.value, 1)}, compared with ${formatPercent(previous.value, 1)} a year earlier. If incomes did not rise by a similar amount, households could buy less with the same money.`,
      note: "Automated from World Bank annual data. Inflation is an average over the year, not a monthly price level.",
      href: "/economy#inflation",
      sourceId: "worldbank",
      sourceUrl: "https://data.worldbank.org/country/maldives",
    });
  }

  if (gdp?.latest && gdp.observations.at(-2)) {
    const previous = gdp.observations.at(-2)!;
    insights.push({
      id: "gdp",
      kind: "automated",
      category: "Economy",
      title: `The economy grew ${gdp.latest.value >= previous.value ? "faster" : "more slowly"} in ${gdp.latest.period}.`,
      body: `Real GDP growth was ${formatPercent(gdp.latest.value, 1)}, compared with ${formatPercent(previous.value, 1)} in ${previous.period}. Growth can create jobs and support incomes, but annual estimates are revised.`,
      note: "Automated from World Bank annual data. GDP is an estimate and may be revised.",
      href: "/economy#gdpGrowth",
      sourceId: "worldbank",
      sourceUrl: "https://data.worldbank.org/country/maldives",
    });
  }

  if (latest) {
    insights.push({
      id: `disclosure-${latest.id}`,
      kind: "official",
      category: "Disclosure",
      title: latest.title,
      body: plainLanguageDisclosure(latest),
      note: `Official document published by ${latest.company} on ${formatDate(latest.publishedAt)}. Summary by Maldex, not the official text.`,
      href: `/disclosures/${latest.id}`,
      sourceId: "cmda-disclosures",
      sourceUrl: latest.sourceUrl,
    });
  }

  return insights;
}
