"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DICTIONARIES, type Locale } from "@/lib/i18n/dictionaries";
import { RUBRIC_RULES } from "@/lib/auditor/rubric";
import type { SampleAudit } from "@/lib/auditor/sample-audits";

interface LandingClientProps {
  initialLocale: Locale;
  samples: SampleAudit[];
}

export function LandingClient({ initialLocale, samples }: LandingClientProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [urlInput, setUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const t = DICTIONARIES[locale];

  const handleLocaleChange = useCallback((next: Locale) => {
    setLocale(next);
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("lang", next);
      window.history.replaceState({}, "", nextUrl.toString());
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    if (!urlInput.trim()) {
      setErrorMsg(t.hero.invalidUrlError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), locale }),
      });
      const data = (await res.json()) as {
        error?: string;
        normalizedUrl?: string;
        liveCaptureEnabled?: boolean;
      };

      if (!res.ok) {
        setErrorMsg(data.error ?? t.hero.invalidUrlError);
        return;
      }

      if (data.liveCaptureEnabled && data.normalizedUrl) {
        router.push(`/audit/ledgerlane?lang=${locale}`);
        return;
      }

      setNoticeMsg(`${data.normalizedUrl ?? urlInput.trim()} — ${t.hero.pendingPipelineNotice}`);
    } catch {
      setErrorMsg(t.hero.invalidUrlError);
    } finally {
      setSubmitting(false);
    }
  };

  const benefitIcons = [Crosshair, ListOrdered, Sparkles] as const;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-zinc-950">
      <Navbar locale={locale} onSelectLocale={handleLocaleChange} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-5 py-12 sm:py-16">
        {/* Hero */}
        <section className="mx-auto max-w-3xl space-y-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 font-mono text-xs font-medium text-indigo-700">
            {t.hero.viewportTag}
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
            {t.hero.h1}
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            {t.hero.subheadline}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm sm:flex-row"
          >
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t.hero.urlPlaceholder}
              aria-label="Landing page URL"
              className="flex-1 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {errorMsg && (
            <div className="mx-auto flex max-w-2xl items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-xs font-medium text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {noticeMsg && (
            <div className="mx-auto flex max-w-2xl items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-xs leading-relaxed text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{noticeMsg}</span>
            </div>
          )}
        </section>

        {/* 3 Value Props */}
        <section className="grid gap-4 md:grid-cols-3">
          {t.benefits.map((item, idx) => {
            const Icon = benefitIcons[idx] ?? Sparkles;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-zinc-950">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Sample Audits */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
              {t.samples.heading}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">{t.samples.subheading}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {samples.map((sample) => {
              const topIssue = sample.issues[0];
              const topPenalty = topIssue ? RUBRIC_RULES[topIssue.id].penalty : 0;

              return (
                <Link
                  key={sample.id}
                  href={`/audit/${sample.id}?lang=${locale}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-indigo-300 hover:shadow-md"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-zinc-100 bg-zinc-50">
                      <Image
                        src={sample.captureUrl}
                        alt={sample.tagline}
                        width={640}
                        height={400}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-zinc-900/85 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                        {sample.segment}
                      </span>
                      <span className="absolute right-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 font-mono text-xs font-bold text-zinc-950 shadow">
                        {sample.score}/100
                      </span>
                    </div>

                    <div className="space-y-2 p-5">
                      <h3 className="text-base font-bold text-zinc-950 group-hover:text-indigo-700">
                        {sample.tagline}
                      </h3>

                      {topIssue && (
                        <div className="rounded-xl bg-zinc-50 p-3 text-xs">
                          <span className="font-mono font-semibold text-rose-700">
                            {t.samples.topIssueLabel} (-{topPenalty}) · {topIssue.id}
                          </span>
                          <p className="mt-1 line-clamp-2 text-zinc-600">
                            {topIssue.title}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3.5 text-xs font-semibold text-indigo-600">
                    <span>{t.samples.openAuditCta}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        {t.footer}
      </footer>
    </div>
  );
}
