import { describe, expect, it } from "vitest";
import { detectBotChallenge } from "@/lib/auditor/capture";
import {
  GeminiAnalysisError,
  parseAndNormalizeGeminiJson,
} from "@/lib/auditor/gemini-analyzer";
import type { DomAnchor } from "@/lib/auditor/rubric";
import { SAMPLE_AUDITS } from "@/lib/auditor/sample-audits";
import {
  getStoredAuditById,
  isValidAuditId,
  saveStoredAudit,
} from "@/lib/auditor/store";

const MOCK_ANCHORS: DomAnchor[] = [
  { id: "viewport", tag: "body", label: "Viewport 1280×800", xPct: 0, yPct: 0, wPct: 100, hPct: 100, isViewportFallback: true },
  { id: "el_01", tag: "h1", label: "Headline", xPct: 8, yPct: 20, wPct: 45, hPct: 12 },
  { id: "el_02", tag: "button", label: "CTA Continue", xPct: 8, yPct: 48, wPct: 18, hPct: 6 },
];

describe("Live capture & Gemini analysis pipeline", () => {
  it("parses fenced JSON, computes deterministic score, and falls back unknown elementId", () => {
    const fenced = `\`\`\`json
{
  "issues": [
    {
      "id": "action.label",
      "elementId": "el_02",
      "title": "Button says Continue",
      "problem": "CTA does not explain the next screen.",
      "impact": "Visitors pause before clicking.",
      "concreteFix": "Change label to Preview sandbox."
    },
    {
      "id": "legibility.contrast",
      "elementId": "hallucinated_id",
      "title": "Low contrast helper copy",
      "problem": "Helper text blends into background.",
      "impact": "Skipped details.",
      "concreteFix": "Darken text to #334155."
    }
  ],
  "heroRewrite": {
    "beforeHeadline": "Ship faster today",
    "afterHeadline": "Catch API regressions before deploy",
    "beforeSubheadline": null,
    "afterSubheadline": null,
    "beforeCta": "Continue",
    "afterCta": "Preview sandbox",
    "whyItConvertsBetter": "Clarifies what happens on click without inventing unverified metrics."
  }
}
\`\`\``;

    const result = parseAndNormalizeGeminiJson(fenced, MOCK_ANCHORS, "gemini-flash-latest");
    expect(result.score).toBe(100 - 8 - 4);
    expect(result.usedViewportFallbackIds).toEqual(["legibility.contrast"]);
    expect(result.issues.find((i) => i.id === "legibility.contrast")?.elementId).toBe(
      "viewport"
    );
  });

  it("rejects malformed Gemini JSON explicitly", () => {
    expect(() =>
      parseAndNormalizeGeminiJson("not json at all", MOCK_ANCHORS, "gemini-flash-latest")
    ).toThrow(GeminiAnalysisError);
  });

  it("detects HTTP errors, Cloudflare challenges, and empty captures", () => {
    expect(
      detectBotChallenge({ status: 403, title: "Forbidden", bodyText: "Access denied" })
        ?.code
    ).toBe("HTTP_ERROR");

    expect(
      detectBotChallenge({
        status: 200,
        title: "Just a moment...",
        bodyText: "Verify you are human by completing the action below.",
      })?.code
    ).toBe("BOT_CHALLENGE");

    expect(
      detectBotChallenge({ status: 200, title: "Blank", bodyText: "   " })?.code
    ).toBe("EMPTY_PAGE");
  });

  it("stores and retrieves live audits safely and blocks traversal IDs", () => {
    expect(isValidAuditId("../etc/passwd")).toBe(false);
    expect(isValidAuditId("live-test123")).toBe(true);

    const cloned = { ...SAMPLE_AUDITS[0]!, id: "live-unit-test-01", segment: "Live URL" as const };
    saveStoredAudit(cloned);
    const loaded = getStoredAuditById("live-unit-test-01");
    expect(loaded?.id).toBe("live-unit-test-01");
    expect(loaded?.score).toBe(cloned.score);
  });
});
