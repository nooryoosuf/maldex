import worldBankData from "@/data/worldbank/indicators.json";
import type { EconomicIndicator, IndicatorObservation } from "@/lib/types";
import { formatCompact, formatNumber, formatPercent, formatUnitValue } from "@/lib/format";

export const ECONOMIC_INDICATORS: EconomicIndicator[] = worldBankData.indicators as EconomicIndicator[];
export const WORLD_BANK_META = worldBankData.meta;

export const INDICATOR_BY_KEY = Object.fromEntries(
  ECONOMIC_INDICATORS.map((indicator) => [indicator.key, indicator]),
) as Record<string, EconomicIndicator>;

export interface EconomyCategory {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  keys: string[];
  unavailable?: { title: string; description: string; source: string; sourceUrl: string }[];
}

export const ECONOMY_CATEGORIES: EconomyCategory[] = [
  {
    id: "national",
    title: "National economy",
    eyebrow: "Output & population",
    description:
      "The size and growth of the Maldivian economy, and the number of people it serves. Annual national accounts are published with a lag.",
    keys: ["gdpGrowth", "gdpUsd", "gdpPerCapita", "population"],
  },
  {
    id: "prices",
    title: "Inflation & cost of living",
    eyebrow: "Prices",
    description:
      "How quickly consumer prices are changing. A higher rate means household purchasing power is eroding faster, unless incomes rise at least as quickly.",
    keys: ["inflation"],
    unavailable: [
      {
        title: "Monthly consumer price index",
        description:
          "A current monthly CPI series, including food and non-food components, has not yet been connected. Annual inflation is shown above.",
        source: "Maldives Bureau of Statistics",
        sourceUrl: "https://statisticsmaldives.gov.mv/",
      },
    ],
  },
  {
    id: "tourism",
    title: "Tourism",
    eyebrow: "Visitor economy",
    description:
      "Tourism is a central driver of Maldivian output, foreign exchange and employment. Current monthly arrivals are not yet integrated; the annual series below is the latest available.",
    keys: ["touristArrivals", "tourismReceipts"],
  },
  {
    id: "fiscal",
    title: "Government finance",
    eyebrow: "Fiscal",
    description:
      "Government spending and tax revenue as a share of the economy. Current monthly fiscal outturns from the Ministry of Finance are not yet integrated.",
    keys: ["govExpense", "taxRevenue"],
    unavailable: [
      {
        title: "Monthly government revenue & expenditure",
        description:
          "A current monthly fiscal series, including tax revenue, grants and expenditure, is awaiting integration from the Ministry of Finance.",
        source: "Ministry of Finance",
        sourceUrl: "https://www.finance.gov.mv/",
      },
    ],
  },
  {
    id: "trade",
    title: "Foreign trade & external balance",
    eyebrow: "External sector",
    description:
      "Exports, imports and the current account show how the Maldives earns and spends foreign currency. A large import bill relative to GDP is typical for a small, import-dependent economy.",
    keys: ["exports", "imports", "trade", "currentAccount", "fdi", "remittances"],
  },
  {
    id: "monetary",
    title: "Money, reserves & exchange rate",
    eyebrow: "Monetary",
    description:
      "Official reserves, domestic credit and the exchange rate. Reserves support the currency peg and the country's ability to pay for imports.",
    keys: ["reserves", "privateCredit", "exchangeRate"],
  },
  {
    id: "debt",
    title: "Public debt",
    eyebrow: "Debt",
    description:
      "Debt sustainability is a central economic question for the Maldives. A current, verified public-debt series is not yet connected; historical World Bank observations are retained for reference only.",
    keys: ["govDebt"],
    unavailable: [
      {
        title: "Current central government debt",
        description:
          "A current debt stock and debt-service series from the Ministry of Finance or MMA has not yet been integrated. Do not treat the historical 2011 observation as current.",
        source: "Ministry of Finance — Debt Management",
        sourceUrl: "https://www.finance.gov.mv/",
      },
    ],
  },
  {
    id: "social",
    title: "Labour & society",
    eyebrow: "People",
    description:
      "Unemployment and life expectancy provide context on household conditions and long-term development.",
    keys: ["unemployment", "lifeExpectancy"],
  },
];

export const ECONOMY_PULSE_KEYS = ["gdpGrowth", "inflation", "reserves", "currentAccount", "population"];

export function getIndicator(key: string): EconomicIndicator | undefined {
  return INDICATOR_BY_KEY[key];
}

export function getPreviousObservation(indicator: EconomicIndicator): IndicatorObservation | null {
  return indicator.observations.at(-2) ?? null;
}

export function getIndicatorChange(indicator: EconomicIndicator): {
  absolute: number | null;
  percent: number | null;
  direction: "up" | "down" | "flat" | null;
} {
  const latest = indicator.latest;
  const previous = getPreviousObservation(indicator);
  if (!latest || !previous) return { absolute: null, percent: null, direction: null };
  const absolute = latest.value - previous.value;
  const percent = previous.value !== 0 ? ((latest.value - previous.value) / Math.abs(previous.value)) * 100 : null;
  return {
    absolute,
    percent,
    direction: absolute > 0 ? "up" : absolute < 0 ? "down" : "flat",
  };
}

export type Freshness = "fresh" | "lagging" | "stale";

export function getFreshness(indicator: EconomicIndicator): Freshness {
  const year = Number(indicator.latest?.period?.slice(0, 4) ?? 0);
  const currentYear = 2026;
  if (!year) return "stale";
  if (currentYear - year <= 2) return "fresh";
  if (currentYear - year <= 3) return "lagging";
  return "stale";
}

export function freshnessLabel(freshness: Freshness): string {
  return freshness === "fresh" ? "Latest available" : freshness === "lagging" ? "Lagging release" : "Stale — reference only";
}

export function getPulseSeries(key: string, points = 10): number[] {
  const indicator = getIndicator(key);
  if (!indicator) return [];
  return indicator.observations.slice(-points).map((obs) => obs.value);
}

function isPercentagePointIndicator(indicator: EconomicIndicator): boolean {
  return indicator.unit === "% annual" || indicator.unit === "% of GDP" || indicator.unit === "% of labour force";
}

export function buildObservation(indicator: EconomicIndicator): { simple: string; advanced: string } {
  const latest = indicator.latest;
  const previous = getPreviousObservation(indicator);
  if (!latest) {
    return { simple: "No verified observation is available yet.", advanced: "No observations in the connected dataset." };
  }
  const latestValue = formatUnitValue(latest.value, indicator.unit);
  if (!previous) {
    return {
      simple: `The latest available figure is ${latestValue} for ${latest.period}.`,
      advanced: `${indicator.name}: ${latestValue} in ${latest.period}. No prior observation is available for comparison.`,
    };
  }
  const previousValue = formatUnitValue(previous.value, indicator.unit);
  const change = latest.value - previous.value;
  const pct = getIndicatorChange(indicator).percent;
  const direction = change > 0 ? "higher" : change < 0 ? "lower" : "unchanged";
  const pp = isPercentagePointIndicator(indicator)
    ? `${formatNumber(Math.abs(change), 1)} percentage points`
    : pct !== null
      ? `${formatPercent(Math.abs(pct), 1)}`
      : `${formatNumber(Math.abs(change), 1)} ${indicator.unit}`;

  const simple = (() => {
    switch (indicator.key) {
      case "gdpGrowth":
        return change >= 0
          ? `The economy grew by ${latestValue} in ${latest.period}, faster than ${previousValue} in ${previous.period}.`
          : `The economy grew by ${latestValue} in ${latest.period}, slower than ${previousValue} in ${previous.period}.`;
      case "inflation":
        return change >= 0
          ? `Consumer prices rose ${latestValue} in ${latest.period}, faster than ${previousValue} in ${previous.period}.`
          : `Consumer prices rose ${latestValue} in ${latest.period}, more slowly than ${previousValue} in ${previous.period}.`;
      case "reserves":
        return change >= 0
          ? `Official reserves stood at ${latestValue} in ${latest.period}, higher than ${previousValue} in ${previous.period}.`
          : `Official reserves stood at ${latestValue} in ${latest.period}, lower than ${previousValue} in ${previous.period}.`;
      case "currentAccount":
        return change >= 0
          ? `The current-account deficit was ${formatPercent(Math.abs(latest.value), 1)} of GDP in ${latest.period}, smaller than ${formatPercent(Math.abs(previous.value), 1)} in ${previous.period}.`
          : `The current-account deficit was ${formatPercent(Math.abs(latest.value), 1)} of GDP in ${latest.period}, larger than ${formatPercent(Math.abs(previous.value), 1)} in ${previous.period}.`;
      case "population":
        return `The population was estimated at ${latestValue} in ${latest.period}, ${direction} than ${previousValue} in ${previous.period}.`;
      case "exports":
        return `Exports were equal to ${latestValue} of GDP in ${latest.period}, ${direction} than ${previousValue} in ${previous.period}.`;
      case "imports":
        return `Imports were equal to ${latestValue} of GDP in ${latest.period}, ${direction} than ${previousValue} in ${previous.period}.`;
      default:
        return `${indicator.name} was ${latestValue} in ${latest.period}, ${direction} than ${previousValue} in ${previous.period}.`;
    }
  })();

  const advanced = `${indicator.name}: ${latestValue} (${latest.period}) versus ${previousValue} (${previous.period}); change ${change >= 0 ? "+" : "−"}${pp}. Indicator ${indicator.id}.`;

  return { simple, advanced };
}

export function getIndicatorSummary(key: string): string {
  const indicator = getIndicator(key);
  if (!indicator) return "—";
  return buildObservation(indicator).simple;
}

export function getEconomyStats() {
  const fresh = ECONOMIC_INDICATORS.filter((indicator) => getFreshness(indicator) === "fresh").length;
  const latestYear = Math.max(...ECONOMIC_INDICATORS.map((i) => Number(i.latest?.period?.slice(0, 4) ?? 0)));
  return {
    indicators: ECONOMIC_INDICATORS.length,
    fresh,
    latestYear,
    categories: ECONOMY_CATEGORIES.length,
  };
}

export function formatIndicatorCompact(indicator: EconomicIndicator): string {
  return formatUnitValue(indicator.latest?.value ?? null, indicator.unit, { compact: true });
}

export function formatIndicatorFull(indicator: EconomicIndicator): string {
  return formatUnitValue(indicator.latest?.value ?? null, indicator.unit);
}

export function getIndicatorRows() {
  return ECONOMIC_INDICATORS.flatMap((indicator) =>
    indicator.observations.map((obs) => ({
      indicator: indicator.name,
      key: indicator.key,
      unit: indicator.unit,
      period: obs.period,
      value: obs.value,
      category: indicator.category,
      source: "World Bank Open Data",
    })),
  );
}

export function getCompactIndicatorValue(indicator: EconomicIndicator): string {
  if (indicator.unit === "US$") return `US$ ${formatCompact(indicator.latest?.value ?? null, 2)}`;
  if (indicator.unit === "people" || indicator.unit === "arrivals") {
    return formatCompact(indicator.latest?.value ?? null, 2);
  }
  if (indicator.unit === "% annual" || indicator.unit === "% of GDP" || indicator.unit === "% of labour force") {
    return formatPercent(indicator.latest?.value ?? null, 1);
  }
  return formatNumber(indicator.latest?.value ?? null, 1);
}
