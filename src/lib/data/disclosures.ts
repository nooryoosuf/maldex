import disclosureData from "@/data/cmda/disclosures.json";
import { COMPANIES } from "@/lib/data/companies";
import type { Disclosure } from "@/lib/types";

export const DISCLOSURES: Disclosure[] = disclosureData.disclosures as Disclosure[];
export const DISCLOSURE_META = disclosureData.meta;

export function getDisclosures(limit?: number): Disclosure[] {
  const sorted = [...DISCLOSURES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getDisclosuresForCompany(code: string, limit?: number): Disclosure[] {
  const rows = DISCLOSURES.filter((item) => item.code === code).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  return limit ? rows.slice(0, limit) : rows;
}

export function getLatestDisclosureDate(): string | null {
  return getDisclosures(1)[0]?.publishedAt ?? null;
}

export function getDisclosureStats() {
  const latest = getDisclosures(1)[0];
  const reports = DISCLOSURES.filter(
    (item) => item.type === "Financial report" || item.type === "Annual report",
  );
  return {
    total: DISCLOSURES.length,
    latestDate: latest?.publishedAt ?? null,
    reports: reports.length,
    companies: new Set(DISCLOSURES.map((item) => item.company)).size,
    currentYear: DISCLOSURES.filter((item) => item.publishedAt.startsWith("2026")).length,
  };
}

export function getDisclosureById(id: string): Disclosure | undefined {
  return DISCLOSURES.find((item) => item.id === id);
}

export function getDisclosureTypes(): string[] {
  return [...new Set(DISCLOSURES.map((item) => item.type))].sort();
}

export function getDisclosureCompanies(): string[] {
  return [...new Set(DISCLOSURES.map((item) => item.company))].sort();
}

export function getCompanyMonogramForDisclosure(item: Disclosure): string {
  const company = COMPANIES.find((c) => c.code === item.code);
  if (company) return company.monogram;
  return item.company
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function plainLanguageDisclosure(item: Disclosure): string {
  switch (item.type) {
    case "Financial report":
      return `${item.company} has published a financial report. Open the official document to read the reported figures and notes.`;
    case "Annual report":
      return `${item.company} has published an annual report or audited financial statements. The original document is the authoritative source.`;
    case "Dividend":
      return `${item.company} has published a dividend-related announcement. Check the official document for the declared amount and dates.`;
    case "AGM":
      return `${item.company} has published an annual general meeting notice, decision or related update.`;
    case "EGM":
      return `${item.company} has published an extraordinary general meeting notice, decision or related update.`;
    case "Board & governance":
      return `${item.company} has published a board or governance update. The official notice contains the names and effective dates.`;
    case "ESG":
      return `${item.company} has published an environmental, social and governance report.`;
    case "Press release":
      return `${item.company} has published a press release.`;
    default:
      return `${item.company} has published a new corporate disclosure. Open the official document for the full details.`;
  }
}

export function disclosureTypeTone(type: string): "accent" | "positive" | "warning" | "default" | "negative" {
  switch (type) {
    case "Financial report":
    case "Annual report":
      return "accent";
    case "Dividend":
      return "positive";
    case "AGM":
    case "EGM":
      return "warning";
    case "Board & governance":
      return "default";
    default:
      return "default";
  }
}
