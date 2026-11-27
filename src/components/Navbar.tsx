"use client";

import Link from "next/link";
import { Globe, ScanEye } from "lucide-react";
import {
  DICTIONARIES,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/dictionaries";

interface NavbarProps {
  locale: Locale;
  onSelectLocale: (next: Locale) => void;
}

export function Navbar({ locale, onSelectLocale }: NavbarProps) {
  const t = DICTIONARIES[locale];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href={`/?lang=${locale}`}
          className="flex items-center gap-2.5 text-zinc-950"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <ScanEye className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">
              {t.brand.name}
            </span>
            <span className="hidden text-[11px] text-zinc-500 sm:block">
              {t.brand.tagline}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-mono text-[11px] font-medium text-indigo-700 md:inline-block">
            {t.brand.proBadge}
          </span>

          <div
            className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5"
            role="group"
            aria-label="Language switcher"
          >
            <Globe className="mx-1.5 h-3.5 w-3.5 text-zinc-400" />
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => onSelectLocale(loc.code)}
                className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                  locale === loc.code
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
