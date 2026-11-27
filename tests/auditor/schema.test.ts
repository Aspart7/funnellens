import { describe, expect, it } from "vitest";
import { AuditResultSchema } from "@/lib/auditor/schema";
import { SAMPLE_AUDITS } from "@/lib/auditor/sample-audits";

describe("AuditResultSchema contract", () => {
  it("validates all built-in sample audits", () => {
    expect(SAMPLE_AUDITS).toHaveLength(3);
    for (const sample of SAMPLE_AUDITS) {
      const parsed = AuditResultSchema.safeParse({
        score: sample.score,
        issues: sample.issues,
        heroRewrite: sample.heroRewrite,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("rejects mismatched category/severity tuples and duplicate issue ids", () => {
    const invalidTuple = AuditResultSchema.safeParse({
      score: 86,
      issues: [
        {
          id: "value.outcome",
          category: "action",
          severity: "tip",
          elementId: "el_1",
          title: "Wrong category and severity",
          problem: "Mismatch.",
          impact: "Broken contract.",
          concreteFix: "Fix tuple.",
        },
      ],
      heroRewrite: {
        beforeHeadline: "Old H1",
        afterHeadline: "New H1",
        beforeSubheadline: null,
        afterSubheadline: null,
        beforeCta: "Go",
        afterCta: "Start audit",
        whyItConvertsBetter: "Explains the action.",
      },
    });
    expect(invalidTuple.success).toBe(false);

    const duplicateIds = AuditResultSchema.safeParse({
      score: 84,
      issues: [
        {
          id: "action.label",
          category: "action",
          severity: "warning",
          elementId: "cta",
          title: "First",
          problem: "Unclear CTA.",
          impact: "Confusion.",
          concreteFix: "Fix CTA.",
        },
        {
          id: "action.label",
          category: "action",
          severity: "warning",
          elementId: "cta2",
          title: "Duplicate",
          problem: "Duplicate.",
          impact: "Duplicate.",
          concreteFix: "Duplicate.",
        },
      ],
      heroRewrite: {
        beforeHeadline: null,
        afterHeadline: null,
        beforeSubheadline: null,
        afterSubheadline: null,
        beforeCta: "Go",
        afterCta: "Start audit",
        whyItConvertsBetter: "Explains click outcome.",
      },
    });
    expect(duplicateIds.success).toBe(false);
  });

  it("rejects unexpected extra properties (strict contract)", () => {
    const extraProp = AuditResultSchema.safeParse({
      score: 100,
      issues: [],
      extraField: "not-allowed",
      heroRewrite: {
        beforeHeadline: "Clear H1",
        afterHeadline: "Clear H1",
        beforeSubheadline: "Clear sub",
        afterSubheadline: "Clear sub",
        beforeCta: "Audit my page",
        afterCta: "Audit my page",
        whyItConvertsBetter: "Already strong.",
      },
    });
    expect(extraProp.success).toBe(false);
  });
});
