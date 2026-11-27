"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Crosshair,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { PinCanvas } from "@/components/PinCanvas";
import { HeroRewriteCard } from "@/components/HeroRewriteCard";
import { DICTIONARIES, type Locale } from "@/lib/i18n/dictionaries";
import { RUBRIC_RULES, type AuditSeverity } from "@/lib/auditor/rubric";
import type { SampleAudit } from "@/lib/auditor/sample-audits";

interface AuditReportClientProps {
  initialLocale: Locale;
  audit: SampleAudit;
}

export function AuditReportClient({
  initialLocale,
  audit,
}: AuditReportClientProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [activeTab, setActiveTab] = useState<"pins" | "rewrite">("pins");
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditSeverity>("all");
  const [activeIssueId, setActiveIssueId] = useState<string | null>(
    audit.issues[0]?.id ?? null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = DICTIONARIES[locale];

  const handleLocaleChange = useCallback((next: Locale) => {
    setLocale(next);
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("lang", next);
      window.history.replaceState({}, "", nextUrl.toString());
    }
  }, []);

  const filteredIssues = useMemo(() => {
    if (severityFilter === "all") return audit.issues;
    return audit.issues.filter((i) => i.severity === severityFilter);
  }, [audit.issues, severityFilter]);

  const handleCopyFix = useCallback((issueId: string, fixText: string) => {
    void navigator.clipboard.writeText(fixText);
    setCopiedId(issueId);
    window.setTimeout(() => setCopiedId(null), 1800);
  }, []);

  const scoreTone =
    audit.score >= 80
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : audit.score >= 60
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-zinc-950">
      <Navbar locale={locale} onSelectLocale={handleLocaleChange} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-5 py-8">
        {/* Top bar & summary */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div className="space-y-2">
            <Link
              href={`/?lang=${locale}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t.auditView.backHome}</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                {audit.tagline}
              </h1>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-medium text-zinc-600">
                {audit.viewport.width} × {audit.viewport.height}
              </span>
            </div>

            <p className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500">
              <span>{audit.auditedUrl}</span>
              <ExternalLink className="h-3 w-3" />
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-baseline gap-1 rounded-2xl border px-5 py-3 ${scoreTone}`}
            >
              <span className="text-3xl font-extrabold">{audit.score}</span>
              <span className="text-sm font-semibold opacity-80">
                {t.auditView.scoreOutOf}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Category Bars */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t.auditView.categoriesTitle}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {audit.categoryScores.map((cat) => {
              const pct = Math.round((cat.earned / cat.max) * 100);
              return (
                <div
                  key={cat.category}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 p-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800">
                      {t.categories[cat.category]}
                    </span>
                    <span className="font-mono font-bold text-zinc-700">
                      {cat.earned}/{cat.max}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${
                        pct === 100
                          ? "bg-emerald-500"
                          : pct >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("pins")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === "pins"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>{t.auditView.tabPins}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rewrite")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === "rewrite"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.auditView.tabRewrite}</span>
            </button>
          </div>

          {activeTab === "pins" && (
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: t.auditView.filterAll },
                  { id: "critical", label: t.auditView.filterCritical },
                  { id: "warning", label: t.auditView.filterWarning },
                  { id: "tip", label: t.auditView.filterTip },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSeverityFilter(pill.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    severityFilter === pill.id
                      ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Workspace */}
        {activeTab === "pins" ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <PinCanvas
                captureUrl={audit.captureUrl}
                brandName={audit.brandName}
                anchors={audit.anchors}
                issues={filteredIssues}
                activeIssueId={activeIssueId}
                onSelectIssue={(id) => setActiveIssueId(id)}
              />
            </div>

            <div className="space-y-3 lg:col-span-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                {t.auditView.issuesTitle} ({filteredIssues.length})
              </h2>

              {filteredIssues.map((issue, idx) => {
                const isActive = activeIssueId === issue.id;
                const penalty = RUBRIC_RULES[issue.id].penalty;
                const sevBadge =
                  issue.severity === "critical"
                    ? "bg-rose-100 text-rose-800"
                    : issue.severity === "warning"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-sky-100 text-sky-800";

                return (
                  <div
                    key={issue.id}
                    onClick={() => setActiveIssueId(issue.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isActive
                        ? "border-indigo-400 bg-white shadow-md ring-2 ring-indigo-100"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-semibold text-zinc-500">
                          {issue.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${sevBadge}`}>
                          {t.severities[issue.severity]}
                        </span>
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-800">
                          -{penalty}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-2.5 text-sm font-bold text-zinc-950">
                      {issue.title}
                    </h3>

                    {isActive && (
                      <div className="mt-3 space-y-2.5 border-t border-zinc-100 pt-3 text-xs leading-relaxed">
                        <div>
                          <span className="font-semibold text-zinc-900">
                            {t.auditView.problemLabel}:{" "}
                          </span>
                          <span className="text-zinc-700">{issue.problem}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900">
                            {t.auditView.impactLabel}:{" "}
                          </span>
                          <span className="text-zinc-700">{issue.impact}</span>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-indigo-950">
                              {t.auditView.fixLabel}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyFix(issue.id, issue.concreteFix);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-700 shadow-sm hover:bg-indigo-100"
                            >
                              {copiedId === issue.id ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>{t.auditView.copied}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>{t.auditView.copyFix}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="mt-1 text-indigo-900">{issue.concreteFix}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <HeroRewriteCard rewrite={audit.heroRewrite} t={t} />
        )}

        {/* Next milestones callout */}
        <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-xs text-zinc-600">
          <Layers className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          <div>
            <p className="font-bold text-zinc-900">{t.auditView.proBannerTitle}</p>
            <p className="mt-0.5 leading-relaxed">{t.auditView.proBannerBody}</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        {t.footer}
      </footer>
    </div>
  );
}
