import { NextResponse } from "next/server";
import {
  processVerifiedStripeEvent,
  sharedWebhookStore,
  verifyStripeSignature,
} from "@/lib/stripe/webhook";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature");

  const check = verifyStripeSignature(rawBody, sigHeader, secret);
  if (!check.valid) {
    return NextResponse.json(
      { error: check.reason ?? "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    const outcome = processVerifiedStripeEvent(rawBody, sharedWebhookStore);
    return NextResponse.json({
      received: true,
      ...outcome,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Invalid Stripe webhook payload.",
      },
      { status: 400 }
    );
  }
}
