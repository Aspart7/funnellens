import { describe, expect, it } from "vitest";
import {
  canClientUpdateUserDoc,
  canReadAudit,
  canWriteAudit,
} from "@/lib/firebase/access";

describe("Firebase owner/public/plan access rules", () => {
  it("allows owner read/write and blocks strangers on private audits", () => {
    const privateAudit = { id: "aud_1", ownerId: "user_alice", isPublic: false };
    expect(canReadAudit(privateAudit, "user_alice")).toBe(true);
    expect(canWriteAudit(privateAudit, "user_alice")).toBe(true);
    expect(canReadAudit(privateAudit, "user_bob")).toBe(false);
    expect(canReadAudit(privateAudit, null)).toBe(false);
    expect(canWriteAudit(privateAudit, "user_bob")).toBe(false);
  });

  it("allows anyone to read public shared audits without allowing writes", () => {
    const publicAudit = { id: "aud_pub", ownerId: "user_alice", isPublic: true };
    expect(canReadAudit(publicAudit, null)).toBe(true);
    expect(canReadAudit(publicAudit, "user_bob")).toBe(true);
    expect(canWriteAudit(publicAudit, null)).toBe(false);
    expect(canWriteAudit(publicAudit, "user_bob")).toBe(false);
  });

  it("prevents client-side privilege escalation of billing plan", () => {
    const aliceDoc = { uid: "user_alice", plan: "free" as const, email: "a@example.com" };

    expect(
      canClientUpdateUserDoc(aliceDoc, { email: "new@example.com" }, "user_alice")
        .allowed
    ).toBe(true);

    const escalation = canClientUpdateUserDoc(
      aliceDoc,
      { plan: "pro" },
      "user_alice"
    );
    expect(escalation.allowed).toBe(false);

    const custAttempt = canClientUpdateUserDoc(
      aliceDoc,
      { stripeCustomerId: "cus_fake" },
      "user_alice"
    );
    expect(custAttempt.allowed).toBe(false);
  });
});
