import crypto from "node:crypto";
import { z } from "zod";
import type { UserPlan } from "@/lib/firebase/access";

const StripeEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({
    object: z.object({
      id: z.string().min(1),
      client_reference_id: z.string().nullable().optional(),
      metadata: z.record(z.string()).optional(),
      payment_status: z.string().optional(),
    }),
  }),
});

export type StripeWebhookEvent = z.infer<typeof StripeEventSchema>;

export function signStripePayloadForTest(
  rawBody: string,
  secret: string,
  timestampSec: number
): string {
  const signedPayload = `${timestampSec}.${rawBody}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  return `t=${timestampSec},v1=${sig}`;
}

export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  nowSec: number = Math.floor(Date.now() / 1000),
  toleranceSec: number = 300
): { valid: boolean; reason?: string } {
  if (!signatureHeader) {
    return { valid: false, reason: "Missing Stripe-Signature header." };
  }

  const parts = signatureHeader.split(",").map((p) => p.trim());
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const v1Signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));

  if (!timestampPart || v1Signatures.length === 0) {
    return { valid: false, reason: "Malformed Stripe-Signature header." };
  }

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp) || Math.abs(nowSec - timestamp) > toleranceSec) {
    return { valid: false, reason: "Webhook timestamp outside tolerance window." };
  }

  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");

  for (const candidateHex of v1Signatures) {
    if (!/^[0-9a-fA-F]+$/.test(candidateHex)) continue;
    const candidateBuf = Buffer.from(candidateHex, "hex");
    if (
      candidateBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(candidateBuf, expectedBuf)
    ) {
      return { valid: true };
    }
  }

  return { valid: false, reason: "Signature mismatch." };
}

export interface WebhookProcessStore {
  hasProcessedEvent(eventId: string): boolean;
  markEventProcessed(eventId: string): void;
  setUserPlan(uid: string, plan: UserPlan): void;
}

export function createInMemoryWebhookStore(): WebhookProcessStore & {
  plans: Map<string, UserPlan>;
  events: Set<string>;
} {
  const plans = new Map<string, UserPlan>();
  const events = new Set<string>();
  return {
    plans,
    events,
    hasProcessedEvent: (id) => events.has(id),
    markEventProcessed: (id) => {
      events.add(id);
    },
    setUserPlan: (uid, plan) => {
      plans.set(uid, plan);
    },
  };
}

export const sharedWebhookStore = createInMemoryWebhookStore();

export function processVerifiedStripeEvent(
  rawBody: string,
  store: WebhookProcessStore = sharedWebhookStore
): {
  idempotentReplay: boolean;
  eventId: string;
  eventType: string;
  upgradedUserId: string | null;
} {
  const json = JSON.parse(rawBody) as unknown;
  const event = StripeEventSchema.parse(json);

  if (store.hasProcessedEvent(event.id)) {
    return {
      idempotentReplay: true,
      eventId: event.id,
      eventType: event.type,
      upgradedUserId: null,
    };
  }

  let upgradedUserId: string | null = null;
  if (
    event.type === "checkout.session.completed" &&
    (event.data.object.payment_status === "paid" ||
      event.data.object.payment_status === undefined)
  ) {
    const uid =
      event.data.object.client_reference_id ??
      event.data.object.metadata?.uid ??
      null;
    if (uid) {
      store.setUserPlan(uid, "pro");
      upgradedUserId = uid;
    }
  }

  store.markEventProcessed(event.id);
  return {
    idempotentReplay: false,
    eventId: event.id,
    eventType: event.type,
    upgradedUserId,
  };
}
