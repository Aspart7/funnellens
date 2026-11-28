export type UserPlan = "free" | "pro";

export interface AuditAccessRecord {
  id: string;
  ownerId: string | null;
  isPublic: boolean;
}

export interface UserDocSnapshot {
  uid: string;
  plan: UserPlan;
  email?: string;
}

export function canReadAudit(
  audit: AuditAccessRecord,
  viewerUid: string | null
): boolean {
  if (audit.isPublic) {
    return true;
  }
  return Boolean(viewerUid && audit.ownerId === viewerUid);
}

export function canWriteAudit(
  audit: AuditAccessRecord,
  actorUid: string | null
): boolean {
  return Boolean(actorUid && audit.ownerId === actorUid);
}

export function canClientUpdateUserDoc(
  current: UserDocSnapshot,
  patch: Partial<UserDocSnapshot> & { stripeCustomerId?: string },
  actorUid: string | null
): { allowed: boolean; reason?: string } {
  if (!actorUid || actorUid !== current.uid) {
    return { allowed: false, reason: "Forbidden: can only modify own user profile." };
  }
  if (patch.plan !== undefined && patch.plan !== current.plan) {
    return {
      allowed: false,
      reason: "Forbidden: billing plan changes must happen via server Stripe webhook.",
    };
  }
  if (patch.stripeCustomerId !== undefined) {
    return {
      allowed: false,
      reason: "Forbidden: stripeCustomerId is server-managed.",
    };
  }
  return { allowed: true };
}
