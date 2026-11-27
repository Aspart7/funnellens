"use client";

import { ArrowRight, Info, Sparkles } from "lucide-react";
import type { HeroRewrite } from "@/lib/auditor/rubric";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeroRewriteCardProps {
  rewrite: HeroRewrite;
  t: Dictionary;
}

export function HeroRewriteCard({ rewrite, t }: HeroRewriteCardProps) {
  const rows: {
    label: string;
    before: string | null;
    after: string | null;
  }[] = [
    {
      label: t.auditView.headlineLabel,
      before: rewrite.beforeHeadline,
      after: rewrite.afterHeadline,
    },
    {
      label: t.auditView.subheadlineLabel,
      before: rewrite.beforeSubheadline,
      after: rewrite.afterSubheadline,
    },
    {
      label: t.auditView.ctaLabel,
      before: rewrite.beforeCta,
      after: rewrite.afterCta,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Before column */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-600">
            {t.auditView.beforeLabel}
          </span>
          <div className="mt-5 space-y-4">
            {rows.map((row) => (
              <div
                key={`before-${row.label}`}
                className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {row.label}
                </p>
                {row.before ? (
                  <p className="mt-1.5 text-sm font-medium text-zinc-800">
                    {row.before}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs italic text-zinc-400">
                    {t.auditView.noOriginalText}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* After column */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-white p-6 shadow-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 font-mono text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.auditView.afterLabel}</span>
          </span>
          <div className="mt-5 space-y-4">
            {rows.map((row) => {
              const unchanged = row.before === row.after && row.after !== null;
              return (
                <div
                  key={`after-${row.label}`}
                  className="rounded-xl border border-indigo-100 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                      {row.label}
                    </p>
                    {unchanged && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Kept strong copy
                      </span>
                    )}
                  </div>
                  {row.after !== null ? (
                    <p className="mt-1.5 text-sm font-semibold text-zinc-950">
                      {row.after}
                    </p>
                  ) : (
                    <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span>{t.auditView.missingFactFallback}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why it converts better */}
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
        <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
        <div>
          <h3 className="text-sm font-bold text-zinc-950">
            {t.auditView.whyConvertsTitle}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-700">
            {rewrite.whyItConvertsBetter}
          </p>
        </div>
      </div>
    </div>
  );
}
