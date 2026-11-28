import { describe, expect, it } from "vitest";
import {
  createInMemoryWebhookStore,
  processVerifiedStripeEvent,
  signStripePayloadForTest,
  verifyStripeSignature,
} from "@/lib/stripe/webhook";

describe("Stripe webhook signature & idempotent replay", () => {
  const secret = "whsec_test_local_secret_123";
  const samplePayload = JSON.stringify({
    id: "evt_test_001",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_001",
        client_reference_id: "user_alice",
        payment_status: "paid",
      },
    },
  });

  it("accepts valid HMAC-SHA256 signature and rejects tampered or stale requests", () => {
    const now = 1700000000;
    const sig = signStripePayloadForTest(samplePayload, secret, now);

    expect(verifyStripeSignature(samplePayload, sig, secret, now + 10).valid).toBe(true);
    expect(verifyStripeSignature(samplePayload + " ", sig, secret, now + 10).valid).toBe(false);
    expect(verifyStripeSignature(samplePayload, sig, secret, now + 600).valid).toBe(false);
    expect(verifyStripeSignature(samplePayload, null, secret, now).valid).toBe(false);
  });

  it("handles duplicate checkout.session.completed deliveries idempotently", () => {
    const store = createInMemoryWebhookStore();
    const first = processVerifiedStripeEvent(samplePayload, store);
    expect(first.idempotentReplay).toBe(false);
    expect(first.upgradedUserId).toBe("user_alice");
    expect(store.plans.get("user_alice")).toBe("pro");

    // Duplicate Stripe delivery for the exact same event ID
    const replay = processVerifiedStripeEvent(samplePayload, store);
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.upgradedUserId).toBeNull();
    expect(store.events.size).toBe(1);
  });
});
