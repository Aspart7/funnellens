import { describe, expect, it } from "vitest";
import {
  computeContrastRatio,
  meetsLegibilityThreshold,
} from "@/lib/auditor/contrast";

describe("WCAG contrast checker", () => {
  it("computes accurate ratios for crisp and low-contrast pairs", () => {
    expect(computeContrastRatio("#000000", "#ffffff")).toBe(21);
    const muted = computeContrastRatio("#94a3b8", "#f8fafc");
    expect(muted).toBeLessThan(3.0);
  });

  it("enforces 4.5:1 for body text and 3.0:1 for large/bold text", () => {
    expect(meetsLegibilityThreshold(4.5, 16, 400)).toBe(true);
    expect(meetsLegibilityThreshold(4.2, 16, 400)).toBe(false);
    expect(meetsLegibilityThreshold(3.2, 24, 400)).toBe(true);
    expect(meetsLegibilityThreshold(3.2, 19, 700)).toBe(true);
    expect(meetsLegibilityThreshold(3.2, 19, 400)).toBe(false);
  });
});
