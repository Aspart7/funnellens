import { notFound } from "next/navigation";
import { AuditReportClient } from "@/components/AuditReportClient";
import { getSampleAuditById, SAMPLE_AUDITS } from "@/lib/auditor/sample-audits";
import { resolveLocale } from "@/lib/i18n/dictionaries";

export function generateStaticParams() {
  return SAMPLE_AUDITS.map((sample) => ({ id: sample.id }));
}

export default async function AuditDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const audit = getSampleAuditById(id);

  if (!audit) {
    notFound();
  }

  const initialLocale = resolveLocale(resolvedSearch.lang);
  return <AuditReportClient initialLocale={initialLocale} audit={audit} />;
}
