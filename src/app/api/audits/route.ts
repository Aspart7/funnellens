import { NextResponse } from "next/server";
import { AuditRequestSchema } from "@/lib/auditor/schema";
import { validateAuditUrl } from "@/lib/auditor/url-safety";
import { SAMPLE_AUDITS } from "@/lib/auditor/sample-audits";

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
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = AuditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid audit request payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const safety = validateAuditUrl(parsed.data.url);
  if (!safety.valid || !safety.normalizedUrl) {
    return NextResponse.json(
      { error: safety.error ?? "Invalid or blocked target URL." },
      { status: 400 }
    );
  }

  const triggerConfigured = Boolean(process.env.TRIGGER_SECRET_KEY);

  return NextResponse.json(
    {
      status: triggerConfigured ? "queued" : "validation_passed_demo_mode",
      normalizedUrl: safety.normalizedUrl,
      locale: parsed.data.locale,
      liveCaptureEnabled: triggerConfigured,
      suggestedSamples: SAMPLE_AUDITS.map((s) => s.id),
    },
    { status: triggerConfigured ? 202 : 200 }
  );
}
