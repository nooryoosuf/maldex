import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataBadge } from "@/components/ui/data-badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { CompanyMark } from "@/components/ui/company-mark";
import { getCompanyByCode } from "@/lib/data/companies";
import {
  getDisclosureById,
  getDisclosuresForCompany,
  plainLanguageDisclosure,
  disclosureTypeTone,
} from "@/lib/data/disclosures";
import { getViewingMode } from "@/lib/preferences";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  // Avoid generating thousands; static generation on demand is fine.
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = getDisclosureById(id);
  if (!item) return { title: "Disclosure not found" };
  return {
    title: item.title,
    description: `${item.company} — ${item.type} published ${formatDate(item.publishedAt)}.`,
  };
}

export default async function DisclosureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getDisclosureById(id);
  if (!item) notFound();

  const mode = await getViewingMode();
  const company = item.code ? getCompanyByCode(item.code) : undefined;
  const related = item.code ? getDisclosuresForCompany(item.code, 6).filter((entry) => entry.id !== item.id) : [];

  return (
    <PageContainer>
      <div className="pt-4">
        <Link href="/disclosures" className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> All disclosures
        </Link>
      </div>

      <PageHeader
        eyebrow={`${item.type} · ${item.company}`}
        title={item.title}
        description={
          mode === "simple"
            ? plainLanguageDisclosure(item)
            : `Published ${formatDate(item.publishedAt, "long")} by ${item.company}${item.code ? ` (${item.code})` : ""}. Official document metadata only.`
        }
        actions={
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open official document
          </a>
        }
        meta={
          <>
            {company ? (
              <>
                <CompanyMark monogram={company.monogram} size="xs" />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{company.code}</span>
                <span className="h-3 w-px bg-line-strong" />
              </>
            ) : null}
            <Badge variant={disclosureTypeTone(item.type)}>{item.type}</Badge>
            <span className="h-3 w-px bg-line-strong" />
            <span>{formatDate(item.publishedAt, "long")}</span>
            <span className="h-3 w-px bg-line-strong" />
            <DataBadge status="official-reported" />
            <span className="h-3 w-px bg-line-strong" />
            <span className="font-mono text-[10px]">#{item.id}</span>
          </>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">What this disclosure is</h2>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted">
              {plainLanguageDisclosure(item)}
            </p>
            <div className="mt-4 rounded-md border border-line bg-surface-2/50 p-3 text-[11px] leading-5 text-muted">
              <strong className="font-medium text-ink">Important:</strong> Maldex has not read or extracted the contents
              of this document. The summary above is generated from the disclosure type and company name only. Open the
              official document for the reported figures, notes, dates and conditions.
            </div>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded border border-line bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open on InformInvestor (CMDA)
            </a>
          </section>

          {mode === "advanced" ? (
            <section className="overflow-hidden rounded-md border border-line bg-surface">
              <div className="border-b border-line px-4 py-3">
                <p className="mono-label mb-1">Metadata</p>
                <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Indexed fields</h2>
              </div>
              <dl className="divide-y divide-line text-xs">
                {[
                  ["Disclosure id", `#${item.id}`],
                  ["Company", item.company],
                  ["Security code", item.code ?? "Not linked to a security"],
                  ["Type", item.type],
                  ["Published", formatDate(item.publishedAt, "long")],
                  ["Source page", item.sourcePage],
                  ["Source URL", item.sourceUrl],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 px-4 py-2">
                    <dt className="text-muted">{label}</dt>
                    <dd className="num max-w-[60%] break-all text-right font-mono text-[10.5px] text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {related.length ? (
            <section className="overflow-hidden rounded-md border border-line bg-surface">
              <div className="border-b border-line px-4 py-3">
                <p className="mono-label mb-1">Related</p>
                <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Other disclosures by {item.company}</h2>
              </div>
              <div className="divide-y divide-line">
                {related.map((entry) => (
                  <Link key={entry.id} href={`/disclosures/${entry.id}`} className="block px-4 py-3 transition-colors hover:bg-surface-2/40">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={disclosureTypeTone(entry.type)}>{entry.type}</Badge>
                      <span className="font-mono text-[9px] text-faint">{formatDate(entry.publishedAt)}</span>
                    </div>
                    <p className="mt-1 text-[12px] font-medium leading-[18px] text-ink">{entry.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <p className="mono-label">Verification</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              This is an official document published by {item.company} and indexed by CMDA. Maldex records the headline
              and link; it does not verify the document’s contents.
            </p>
            <div className="mt-3">
              <DataBadge status="official-reported" />
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <SourceLabel sourceId="cmda-disclosures" />
            </div>
          </section>

          {company ? (
            <section className="rounded-md border border-line bg-surface p-4">
              <p className="mono-label mb-2">Issuer</p>
              <Link href={`/companies/${company.slug}`} className="flex items-center gap-3 hover:text-accent">
                <CompanyMark monogram={company.monogram} size="sm" />
                <span>
                  <span className="block text-[12px] font-medium text-ink">{company.name}</span>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.08em] text-faint">{company.code} · {company.sector}</span>
                </span>
              </Link>
              <Link href={`/companies/${company.slug}`} className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline">
                Company page <ArrowRight className="h-3 w-3" />
              </Link>
            </section>
          ) : null}

          <section className="rounded-md border border-line bg-surface p-4">
            <p className="mono-label mb-2">How to read</p>
            <ul className="space-y-2 text-[11px] leading-5 text-muted">
              <li>Open the official document before relying on any number.</li>
              <li>Check the reporting period and audit status in the document itself.</li>
              <li>Compare with prior disclosures from the same company rather than with other companies.</li>
              <li>Disclosures are announcements, not investment advice.</li>
            </ul>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}


