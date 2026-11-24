const numberFormatter = new Intl.NumberFormat("en-GB");
const numberFormatter2 = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (digits === 2) return numberFormatter2.format(value);
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatSigned(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const formatted = formatNumber(Math.abs(value), digits);
  return value > 0 ? `+${formatted}` : value < 0 ? `−${formatted}` : formatted;
}

export function formatPercent(value: number | null | undefined, digits = 1, signed = false): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const formatted = `${formatNumber(Math.abs(value), digits)}%`;
  if (!signed) return value < 0 ? `−${formatted}` : formatted;
  return value > 0 ? `+${formatted}` : value < 0 ? `−${formatted}` : formatted;
}

export function formatCompact(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1e12) return `${sign}${formatNumber(abs / 1e12, digits)}tn`;
  if (abs >= 1e9) return `${sign}${formatNumber(abs / 1e9, digits)}bn`;
  if (abs >= 1e6) return `${sign}${formatNumber(abs / 1e6, digits)}m`;
  if (abs >= 1e3) return `${sign}${formatNumber(abs / 1e3, digits)}k`;
  return `${sign}${formatNumber(abs, digits)}`;
}

export function formatMvr(value: number | null | undefined, opts: { compact?: boolean; digits?: number } = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const { compact = false, digits = 0 } = opts;
  return compact
    ? `MVR ${formatCompact(value, 2)}`
    : `MVR ${formatNumber(value, digits)}`;
}

export function formatUsd(value: number | null | undefined, opts: { compact?: boolean; digits?: number } = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const { compact = false, digits = 0 } = opts;
  return compact ? `US$ ${formatCompact(value, 2)}` : `US$ ${formatNumber(value, digits)}`;
}

export function formatDate(value: string | Date | null | undefined, style: "short" | "long" | "month" | "year" = "short"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00Z`) : value;
  if (Number.isNaN(date.getTime())) return "—";
  if (style === "long") {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }
  if (style === "month") {
    return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  }
  if (style === "year") {
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "UTC" }).format(date);
  }
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Male",
    timeZoneName: "short",
  }).format(date);
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

export function formatAxisDate(value: string, range: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  if (range === "ALL" || range === "1Y") {
    return new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

export function formatPeriod(period: string, unit?: string): string {
  if (!period) return "—";
  if (unit === "% annual" || unit === "% of GDP") return period;
  return period;
}

export function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : pluralForm ?? `${singular}s`;
}

export function safeDivide(a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return a / b;
}

export function pctChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || !Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function formatUnitValue(value: number | null, unit: string, options: { compact?: boolean } = {}): string {
  if (value === null || Number.isNaN(value)) return "—";
  if (unit === "US$") return formatUsd(value, { compact: options.compact });
  if (unit === "MVR") return formatMvr(value, { compact: options.compact });
  if (unit === "% annual" || unit === "% of GDP" || unit === "% of labour force" || unit === "years") {
    return unit === "years" ? `${formatNumber(value, 1)} yrs` : formatPercent(value, 1, true);
  }
  if (unit === "people" || unit === "arrivals") return options.compact ? formatCompact(value, 2) : formatNumber(value, 0);
  if (unit === "MVR per US$") return formatNumber(value, 2);
  if (unit === "index points") return formatNumber(value, 2);
  return formatNumber(value, 1);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replaceAll('"', '""')}"`;
  return str;
}

export function toCsv(columns: { key: string; label: string }[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => csvEscape(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function truncate(value: string, length = 120): string {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}
