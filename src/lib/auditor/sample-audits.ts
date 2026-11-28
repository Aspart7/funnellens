import {
  normalizeAndScoreAudit,
  type CategoryScore,
  type DomAnchor,
  type HeroRewrite,
  type RawAuditIssueInput,
  type AuditIssue,
} from "@/lib/auditor/rubric";
import { AuditResultSchema } from "@/lib/auditor/schema";

export type SampleAuditId = "ledgerlane" | "briefloom" | "tracedock";

export interface SampleAudit {
  id: string;
  segment: "SaaS" | "AI tool" | "DevTool" | "Live URL";
  brandName: string;
  tagline: string;
  auditedUrl: string;
  captureUrl: string;
  viewport: { width: number; height: number };
  anchors: DomAnchor[];
  score: number;
  issues: AuditIssue[];
  categoryScores: CategoryScore[];
  heroRewrite: HeroRewrite;
  isLiveCapture?: boolean;
}

function buildSample(params: {
  id: SampleAuditId;
  segment: "SaaS" | "AI tool" | "DevTool";
  brandName: string;
  tagline: string;
  auditedUrl: string;
  captureUrl: string;
  anchors: DomAnchor[];
  rawIssues: RawAuditIssueInput[];
  heroRewrite: HeroRewrite;
}): SampleAudit {
  const normalized = normalizeAndScoreAudit(params.rawIssues, params.anchors);

  AuditResultSchema.parse({
    score: normalized.score,
    issues: normalized.issues,
    heroRewrite: params.heroRewrite,
  });

  return {
    id: params.id,
    segment: params.segment,
    brandName: params.brandName,
    tagline: params.tagline,
    auditedUrl: params.auditedUrl,
    captureUrl: params.captureUrl,
    viewport: { width: 1280, height: 800 },
    anchors: params.anchors,
    score: normalized.score,
    issues: normalized.issues,
    categoryScores: normalized.categoryScores,
    heroRewrite: params.heroRewrite,
  };
}

export const SAMPLE_AUDITS: SampleAudit[] = [
  buildSample({
    id: "ledgerlane",
    segment: "SaaS",
    brandName: "LedgerLane",
    tagline: "LedgerLane — Expense Approval Software",
    auditedUrl: "https://ledgerlane.example.com",
    captureUrl: "/demos/ledgerlane.svg",
    anchors: [
      { id: "ll-viewport", tag: "body", label: "Viewport 1280×800", xPct: 0, yPct: 0, wPct: 100, hPct: 100, isViewportFallback: true },
      { id: "ll-claim-pill", tag: "span", label: "Hero Claim Badge", xPct: 6.25, yPct: 14.5, wPct: 26, hPct: 4.5 },
      { id: "ll-h1", tag: "h1", label: "Hero Headline", xPct: 6.25, yPct: 22.5, wPct: 46, hPct: 13 },
      { id: "ll-phone-field", tag: "input", label: "Required Phone Field", xPct: 6.25, yPct: 45.5, wPct: 28, hPct: 6 },
      { id: "ll-submit-btn", tag: "button", label: "Form Button “Continue”", xPct: 35.5, yPct: 45.5, wPct: 14.5, hPct: 6 },
      { id: "ll-rivals", tag: "div", label: "Competing Hero CTAs", xPct: 6.25, yPct: 55.5, wPct: 34, hPct: 6.5 },
    ],
    rawIssues: [
      {
        id: "hierarchy.rivals",
        elementId: "ll-rivals",
        title: "Two equally bright buttons ask for opposite commitments",
        problem:
          "Below the form, “Start 14-day trial” and “Book a live call” share identical visual weight with no note clarifying which team size needs which path.",
        impact:
          "Self-serve finance leads hesitate between opening a workspace right away or waiting for a sales call.",
        concreteFix:
          "Keep one primary filled CTA (“Preview approval rules”) and demote “Book a live call” to a subtle text link for 100+ seat teams.",
      },
      {
        id: "friction.fields",
        elementId: "ll-phone-field",
        title: "Required work phone before showing the product",
        problem:
          "The inline hero form marks “Work phone *” as required just to test the interactive expense approval flow.",
        impact:
          "Visitors expecting an instant product tour bounce when asked for a phone number that suggests an immediate sales cold call.",
        concreteFix:
          "Remove the mandatory phone input from the first-screen form and leave only Work Email (or offer an instant sample workspace without signup).",
      },
      {
        id: "action.label",
        elementId: "ll-submit-btn",
        title: "Button label “Continue” hides what happens next",
        problem:
          "The primary button next to the form says “Continue”, giving no clue whether clicking opens a live sandbox, triggers checkout, or books a demo.",
        impact:
          "Uncertain next steps reduce form submissions even when visitors understand the expense approval offer.",
        concreteFix:
          "Rename “Continue” to “Open sample approval flow” so visitors know the click starts an instant preview.",
      },
      {
        id: "proof.claim",
        elementId: "ll-claim-pill",
        title: "“3× faster monthly close” lacks baseline and source",
        problem:
          "The top badge asserts “3× faster monthly close” with no comparison baseline, sample period, or link to a customer case study.",
        impact:
          "Skeptical finance buyers treat unanchored multipliers as marketing fluff instead of usable proof.",
        concreteFix:
          "Either replace the badge with a verifiable customer workflow example or state the baseline (e.g., vs. spreadsheet email approvals) with a link to the case.",
      },
    ],
    heroRewrite: {
      beforeHeadline: "Approve team expenses before month-end chaos",
      afterHeadline: "Approve team expenses in Slack before month-end close",
      beforeSubheadline:
        "Policy checks, multi-step sign-offs, and ERP sync for growing finance teams.",
      afterSubheadline:
        "Set spending limits once, route receipts automatically, and export clean entries to your ledger with zero follow-up emails.",
      beforeCta: "Continue",
      afterCta: "Open sample approval flow",
      whyItConvertsBetter:
        "Replaces the vague “Continue” CTA with the exact next screen, keeps the clear expense-approval subject, and avoids unverified speed multipliers until real benchmark proof is attached.",
    },
  }),

  buildSample({
    id: "briefloom",
    segment: "AI tool",
    brandName: "Briefloom",
    tagline: "Briefloom — AI Meeting Summaries",
    auditedUrl: "https://briefloom.example.com",
    captureUrl: "/demos/briefloom.svg",
    anchors: [
      { id: "bl-viewport", tag: "body", label: "Viewport 1280×800", xPct: 0, yPct: 0, wPct: 100, hPct: 100, isViewportFallback: true },
      { id: "bl-h1", tag: "h1", label: "Hero Headline", xPct: 6.25, yPct: 19, wPct: 45, hPct: 13 },
      { id: "bl-sub", tag: "p", label: "Low-Contrast Subheadline", xPct: 6.25, yPct: 34, wPct: 44, hPct: 8 },
      { id: "bl-terms-form", tag: "div", label: "Contradictory No-Signup Form", xPct: 6.25, yPct: 47, wPct: 42, hPct: 15 },
      { id: "bl-mockup", tag: "div", label: "Decorative Blurred Card", xPct: 55, yPct: 17.5, wPct: 38.5, hPct: 54 },
    ],
    rawIssues: [
      {
        id: "value.outcome",
        elementId: "bl-h1",
        title: "“Unlock smarter meetings forever” states no concrete outcome",
        problem:
          "Neither the headline nor the faded subheadline lets a new visitor finish “With Briefloom, I can…” with a concrete deliverable.",
        impact:
          "Visitors compare dozens of generic AI meeting bots and leave within seconds if the exact output is unclear.",
        concreteFix:
          "Replace the slogan with the exact outcome: “Turn customer calls into structured action items and owner tasks.”",
      },
      {
        id: "proof.evidence",
        elementId: "bl-mockup",
        title: "Hero visual uses unreadable skeleton bars instead of real output",
        problem:
          "The right-hand product card renders abstract grey placeholder bars instead of a legible sample summary, decision list, or CRM note.",
        impact:
          "Prospects cannot verify summary quality before giving a bot access to sensitive calls.",
        concreteFix:
          "Show a real, legible 4-line summary snippet with speaker tags, timestamped decisions, and exported follow-up tasks.",
      },
      {
        id: "friction.terms",
        elementId: "bl-terms-form",
        title: "CTA promises “no signup” while a required password field sits above it",
        problem:
          "The primary button reads “Try free — no signup”, directly contradicting the required “Create password *” input inside the same hero box.",
        impact:
          "Mixed commitment signals break trust right at the click moment.",
        concreteFix:
          "Either allow pasting a public call transcript immediately with zero password, or update the button to “Create free account”.",
      },
      {
        id: "legibility.contrast",
        elementId: "bl-sub",
        title: "Subheadline contrast (~2.55:1) fails the 4.5:1 legibility bar",
        problem:
          "Light slate body copy (#94a3b8) over a pale surface (#f8fafc) is difficult to scan on laptop displays.",
        impact:
          "Visitors skip the clarifying sentence that explains how Briefloom works.",
        concreteFix:
          "Darken subheadline color to #475569 or #334155 (contrast >= 7:1 on #f8fafc).",
      },
    ],
    heroRewrite: {
      beforeHeadline: "Unlock smarter meetings forever",
      afterHeadline: "Turn team and client calls into assigned action items",
      beforeSubheadline: "Next-gen AI intelligence for modern hybrid workforces.",
      afterSubheadline:
        "Paste a call recording or connect your calendar to extract decisions, owner tasks, and follow-up drafts in one view.",
      beforeCta: "Try free — no signup",
      afterCta: "Summarize a sample call",
      whyItConvertsBetter:
        "Replaces vague AI buzzwords with the concrete artifact visitors get after a call, aligns the CTA with zero-signup exploration, and omits unverified accuracy/speed percentages.",
    },
  }),

  buildSample({
    id: "tracedock",
    segment: "DevTool",
    brandName: "TraceDock",
    tagline: "TraceDock — API Monitoring for Developers",
    auditedUrl: "https://tracedock.example.com",
    captureUrl: "/demos/tracedock.svg",
    anchors: [
      { id: "td-viewport", tag: "body", label: "Viewport 1280×800", xPct: 0, yPct: 0, wPct: 100, hPct: 100, isViewportFallback: true },
      { id: "td-badge-clip", tag: "div", label: "Clipped Release Pill", xPct: 6.25, yPct: 12.25, wPct: 24.5, hPct: 4.5 },
      { id: "td-h1", tag: "h1", label: "Ambiguous Object H1", xPct: 6.25, yPct: 20, wPct: 45, hPct: 12.5 },
      { id: "td-detour-form", tag: "form", label: "Hero Newsletter Detour", xPct: 6.25, yPct: 46, wPct: 40, hPct: 8 },
    ],
    rawIssues: [
      {
        id: "value.object",
        elementId: "td-h1",
        title: "Clear promise, but unclear what tool type is actually offered",
        problem:
          "“Keep every endpoint reliable” describes a goal, yet the hero text and abstract node graphic do not clarify if TraceDock is synthetic uptime pinging, OpenTelemetry tracing, or an API gateway.",
        impact:
          "Engineers hesitate because each category requires completely different setup effort and SDK access.",
        concreteFix:
          "Name the exact mechanism above the fold: e.g., “Zero-SDK synthetic API checks and payload diff alerts.”",
      },
      {
        id: "legibility.clipping",
        elementId: "td-badge-clip",
        title: "Hero announcement pill clips meaningful text at its right edge",
        problem:
          "A fixed-width badge container cuts off “Built for multi-region production API...” mid-word before the sentence finishes.",
        impact:
          "Clipped copy makes the page feel untested on standard 1280px desktop screens.",
        concreteFix:
          "Remove `max-width` / `overflow-hidden` truncation on the hero pill so the full label renders cleanly.",
      },
      {
        id: "hierarchy.detour",
        elementId: "td-detour-form",
        title: "Hero form asks for newsletter signup while product CTA hides in navbar",
        problem:
          "The prime hero slot captures emails for “Weekly reliability notes”, forcing developers who want to test monitoring back up to the top-right navbar button.",
        impact:
          "High-intent visitors get sidetracked into a low-intent mailing list instead of starting a monitor.",
        concreteFix:
          "Put the primary “Run free endpoint check” URL input directly in the hero and move the newsletter to the footer.",
      },
    ],
    heroRewrite: {
      beforeHeadline: "Keep every endpoint reliable",
      afterHeadline: "Catch breaking API schema and latency regressions early",
      beforeSubheadline: "Visibility for teams building fast.",
      afterSubheadline: null,
      beforeCta: "Subscribe to release notes",
      afterCta: "Start monitoring endpoints",
      whyItConvertsBetter:
        "Clarifies the exact DevTool capability (endpoint schema & latency checks) and swaps the newsletter detour for the product CTA. Subheadline rewrite is `null` because stating probe intervals or protocol coverage requires verified product specs.",
    },
  }),
];

export function getSampleAuditById(id: string): SampleAudit | undefined {
  return SAMPLE_AUDITS.find((sample) => sample.id === id);
}
