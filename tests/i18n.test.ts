import { describe, expect, it } from "vitest";
import { DICTIONARIES, SUPPORTED_LOCALES, resolveLocale } from "@/lib/i18n/dictionaries";

describe("i18n setup", () => {
  it("provides complete dictionaries for all 5 supported locales", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(5);
    for (const loc of SUPPORTED_LOCALES) {
      expect(DICTIONARIES[loc.code].hero.h1.length).toBeGreaterThan(5);
      expect(DICTIONARIES[loc.code].benefits).toHaveLength(3);
    }
  });

  it("falls back safely to English for unknown locales", () => {
    expect(resolveLocale("fr")).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
  });
});
