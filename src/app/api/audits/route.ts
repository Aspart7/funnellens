import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { AuditRequestSchema } from "@/lib/auditor/schema";
import { validateAuditUrl } from "@/lib/auditor/url-safety";
import {
  SAMPLE_AUDITS,
  type SampleAudit,
} from "@/lib/auditor/sample-audits";
import {
  CaptureError,
  captureFirstScreen,
  findBrowserExecutable,
} from "@/lib/auditor/capture";
import {
  GeminiAnalysisError,
  analyzeFirstScreenWithGemini,
} from "@/lib/auditor/gemini-analyzer";
import { saveStoredAudit } from "@/lib/auditor/store";

export async function GET() {
  return NextResponse.json({
    samples: SAMPLE_AUDITS.map((s) => ({
      id: s.id,
      segment: s.segment,
      brandName: s.brandName,
      tagline: s.tagline,
      score: s.score,
      issueCount: s.issues.length,
    })),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", mode: "validation_error" },
      { status: 400 }
    );
  }

  const parsed = AuditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid audit request payload.",
        mode: "validation_error",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const safety = validateAuditUrl(parsed.data.url);
  if (!safety.valid || !safety.normalizedUrl) {
    return NextResponse.json(
      {
        error: safety.error ?? "Invalid or blocked target URL.",
        mode: "ssrf_blocked",
      },
      { status: 400 }
    );
  }

  const browserPath = findBrowserExecutable();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  // On hosted serverless Vercel without a browser worker / rate limits, explain mode honestly instead of faking a report
  if (!browserPath || !hasGeminiKey) {
    return NextResponse.json(
      {
        status: "hosted_demo_only",
        normalizedUrl: safety.normalizedUrl,
        locale: parsed.data.locale,
        liveCaptureEnabled: false,
        reason: !browserPath
          ? "Arbitrary URL live capture runs locally with Playwright + Chrome and via Trigger.dev once deployed. This hosted preview exposes the 3 full interactive demos without signup."
          : "GEMINI_API_KEY is not configured on the server.",
        suggestedSamples: SAMPLE_AUDITS.map((s) => s.id),
      },
      { status: 200 }
    );
  }

  try {
    const capture = await captureFirstScreen(safety.normalizedUrl);
    const analysis = await analyzeFirstScreenWithGemini({
      screenshotBase64: capture.screenshotBase64,
      anchors: capture.anchors,
      pageTitle: capture.pageTitle,
      pageUrl: capture.finalUrl,
      outputLocale: parsed.data.locale,
    });

    const auditId = `live-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
    const hostLabel = new URL(capture.finalUrl).hostname.replace(/^www\./, "");

    const liveAudit: SampleAudit = {
      id: auditId,
      segment: "Live URL",
      brandName: hostLabel,
      tagline: `${hostLabel} — ${capture.pageTitle}`.slice(0, 120),
      auditedUrl: capture.finalUrl,
      captureUrl: capture.screenshotDataUrl,
      viewport: capture.viewport,
      anchors: capture.anchors,
      score: analysis.score,
      issues: analysis.issues,
      categoryScores: analysis.categoryScores,
      heroRewrite: analysis.heroRewrite,
      isLiveCapture: true,
    };

    saveStoredAudit(liveAudit);

    return NextResponse.json(
      {
        status: "completed",
        auditId,
        normalizedUrl: capture.finalUrl,
        score: liveAudit.score,
        issueCount: liveAudit.issues.length,
        modelUsed: analysis.modelUsed,
        usedViewportFallbackIds: analysis.usedViewportFallbackIds,
        redirectUrl: `/audit/${auditId}?lang=${parsed.data.locale}`,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof CaptureError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          mode: "live_error",
        },
        { status: err.statusCode }
      );
    }
    if (err instanceof GeminiAnalysisError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          mode: "live_error",
        },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Live audit failed unexpectedly.",
        code: "INTERNAL_ERROR",
        mode: "live_error",
      },
      { status: 500 }
    );
  }
}
