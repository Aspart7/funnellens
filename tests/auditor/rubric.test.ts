import { describe, expect, it } from "vitest";
import { normalizeAndScoreAudit, RUBRIC_RULES, type DomAnchor } from "@/lib/auditor/rubric";

const TEST_ANCHORS: DomAnchor[] = [
  { id: "viewport", tag: "body", label: "Viewport", xPct: 0, yPct: 0, wPct: 100, hPct: 100, isViewportFallback: true },
  { id: "h1", tag: "h1", label: "H1", xPct: 10, yPct: 20, wPct: 40, hPct: 10 },
  { id: "phone", tag: "input", label: "Phone", xPct: 10, yPct: 38, wPct: 25, hPct: 6 },
  { id: "cta", tag: "button", label: "CTA", xPct: 10, yPct: 50, wPct: 20, hPct: 6 },
];

describe("FunnelLens 12-rule rubric", () => {
  it("sums weights to exactly 100 across 12 rules", () => {
    const total = Object.values(RUBRIC_RULES).reduce((sum, rule) => sum + rule.penalty, 0);
    expect(total).toBe(100);
  });

  it("matches Astra example: 100 - action.label(8) - friction.fields(8) = 84", () => {
    const result = normalizeAndScoreAudit(
      [
        {
          id: "action.label",
          elementId: "cta",
          title: "Button says Continue",
          problem: "Unclear CTA copy.",
          impact: "User pauses.",
          concreteFix: "Rename to Audit my landing page.",
        },
        {
          id: "friction.fields",
          elementId: "phone",
          title: "Phone required",
          problem: "Required phone input.",
          impact: "Drop-off.",
          concreteFix: "Remove phone input.",
        },
      ],
      TEST_ANCHORS
    );

    expect(result.score).toBe(84);
    expect(result.issues.map((i) => i.id)).toEqual(["friction.fields", "action.label"]);
  });

  it("deduplicates repeated rules and suppresses CTA placement rules when action.entry is present", () => {
    const result = normalizeAndScoreAudit(
      [
        {
          id: "action.entry",
          elementId: "h1",
          title: "No primary CTA",
          problem: "Missing CTA.",
          impact: "No entry point.",
          concreteFix: "Add primary CTA.",
        },
        {
          id: "action.label",
          elementId: "cta",
          title: "Should be suppressed",
          problem: "Suppressed.",
          impact: "Suppressed.",
          concreteFix: "Suppressed.",
        },
        {
          id: "hierarchy.rivals",
          elementId: "cta",
          title: "Should be suppressed",
          problem: "Suppressed.",
          impact: "Suppressed.",
          concreteFix: "Suppressed.",
        },
        {
          id: "action.entry",
          elementId: "cta",
          title: "Duplicate",
          problem: "Duplicate.",
          impact: "Duplicate.",
          concreteFix: "Duplicate.",
        },
      ],
      TEST_ANCHORS
    );

    expect(result.score).toBe(86);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.id).toBe("action.entry");
  });

  it("falls back unknown elementId to registered viewport anchor", () => {
    const result = normalizeAndScoreAudit(
      [
        {
          id: "legibility.contrast",
          elementId: "non-existent-id",
          title: "Low contrast",
          problem: "Subheadline contrast below 4.5:1.",
          impact: "Hard to read.",
          concreteFix: "Darken text color.",
        },
      ],
      TEST_ANCHORS
    );

    expect(result.issues[0]?.elementId).toBe("viewport");
    expect(result.usedViewportFallbackIds).toEqual(["legibility.contrast"]);
    expect(result.score).toBe(96);
  });
});
