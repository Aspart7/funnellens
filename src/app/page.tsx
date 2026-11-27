import { DICTIONARIES, resolveLocale } from "@/lib/i18n/dictionaries";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const resolved = await searchParams;
  const locale = resolveLocale(resolved.lang);
  const t = DICTIONARIES[locale];

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600">
        {t.brand.name}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">
        {t.hero.h1}
      </h1>
      <p className="mt-4 text-lg text-zinc-600">{t.hero.subheadline}</p>
    </main>
  );
}
