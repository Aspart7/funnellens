import { LandingClient } from "@/components/LandingClient";
import { SAMPLE_AUDITS } from "@/lib/auditor/sample-audits";
import { resolveLocale } from "@/lib/i18n/dictionaries";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const resolved = await searchParams;
  const initialLocale = resolveLocale(resolved.lang);
  return <LandingClient initialLocale={initialLocale} samples={SAMPLE_AUDITS} />;
}
