import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";
import { SourceLabel } from "@/components/ui/source-label";
import { Stat, StatGrid } from "@/components/ui/stat";
import { DisclosureTable } from "@/components/disclosures/disclosure-table";
import { getDisclosures, getDisclosureStats, getDisclosureTypes } from "@/lib/data/disclosures";

export const metadata: Metadata = {
  title: "Disclosures",
  description:
    "Corporate disclosures published through CMDA InformInvestor: announcements, financial reports, dividends, meetings and governance updates.",
};

export default function DisclosuresPage() {
  const stats = getDisclosureStats();
  const disclosures = getDisclosures();
  const rows = disclosures.map((item) => ({
    id: item.id,
    date: item.publishedAt,
    company: item.company,
    code: item.code ?? "",
    type: item.type,
    title: item.title,
    source: item.sourceUrl,
  }));

  const types = getDisclosureTypes();
  const yearCounts = disclosures.reduce<Record<string, number>>((acc, item) => {
    const year = item.publishedAt.slice(0, 4);
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});
  const latestYear = Object.keys(yearCounts).sort().at(-1) ?? "";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Disclosures"
        title="What companies have officially said"
        description={
          <>
            Headlines and official document links from the CMDA InformInvestor disclosure index. Maldex indexes the
            metadata only — the published document is always the authoritative source.
          </>
        }
        meta={
          <>
            <SourceLabel sourceId="cmda-disclosures" />
            <span className="h-3 w-px bg-line-strong" />
            <span>{stats.total} indexed disclosures</span>
            <span className="h-3 w-px bg-line-strong" />
            <span>{stats.currentYear} in {latestYear}</span>
          </>
        }
      />

      <div className="mt-6">
        <StatGrid columns="grid-cols-2 md:grid-cols-4">
          <Stat label="Total disclosures" value={stats.total} sub="Indexed from CMDA" badge={<FileText className="h-3 w-3 text-faint" />} />
          <Stat label="This year" value={stats.currentYear} sub={`${latestYear} publications`} />
          <Stat label="Reporting issuers" value={stats.companies} sub="Distinct companies" />
          <Stat label="Financial reports" value={stats.reports} sub="Financial or annual reports" />
        </StatGrid>
      </div>

      <div className="mt-6">
        <Notice variant="info" title="Metadata only, not extracted figures">
          Maldex does not extract numbers from these documents. Use the official document link in each row to read the
          reported figures, notes and audit opinions.
        </Notice>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="mono-label mb-1">Index</p>
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">All disclosures</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Filter by type, company or year, search the title, or export the filtered set.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.slice(0, 5).map((type) => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>
        </div>
        <DisclosureTable rows={rows} />
      </section>

      <section className="mt-8 grid gap-4 rounded-md border border-line bg-surface p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mono-label mb-1">How to read a disclosure</p>
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">Metadata is not the document</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
            A disclosure headline tells you that something was published and when. It does not summarise the contents.
            Open the official document before relying on any figure.
          </p>
        </div>
        <Link href="/sources" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
          Methodology <ArrowUpRight className="h-3 w-3" />
        </Link>
      </section>
    </PageContainer>
  );
}
