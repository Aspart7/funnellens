export type AuditJobStatus =
  | "queued"
  | "capturing"
  | "analyzing"
  | "validating"
  | "completed"
  | "failed";

export interface AuditJobState {
  jobId: string;
  targetUrl: string;
  ownerId: string | null;
  status: AuditJobStatus;
  progressPct: number;
  attempts: number;
  retryable?: boolean;
  errorCode?: string;
  errorMessage?: string;
  auditId?: string;
  updatedAt: string;
}

const PROGRESS_BY_STATUS: Record<AuditJobStatus, number> = {
  queued: 10,
  capturing: 35,
  analyzing: 70,
  validating: 90,
  completed: 100,
  failed: 100,
};

const VALID_TRANSITIONS: Record<AuditJobStatus, AuditJobStatus[]> = {
  queued: ["capturing", "failed"],
  capturing: ["analyzing", "failed"],
  analyzing: ["validating", "failed"],
  validating: ["completed", "failed"],
  completed: [],
  failed: ["queued"],
};

const RETRYABLE_CODES = new Set(["QUOTA_EXCEEDED", "UPSTREAM_ERROR", "TIMEOUT"]);

export function createAuditJob(
  jobId: string,
  targetUrl: string,
  ownerId: string | null
): AuditJobState {
  return {
    jobId,
    targetUrl,
    ownerId,
    status: "queued",
    progressPct: PROGRESS_BY_STATUS.queued,
    attempts: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function isRetryableJobError(code: string): boolean {
  return RETRYABLE_CODES.has(code);
}

export function transitionAuditJob(
  current: AuditJobState,
  nextStatus: AuditJobStatus,
  meta?: { auditId?: string; errorCode?: string; errorMessage?: string }
): AuditJobState {
  const allowed = VALID_TRANSITIONS[current.status];
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid job transition: "${current.status}" -> "${nextStatus}".`
    );
  }

  const attempts =
    current.status === "queued" && nextStatus === "capturing"
      ? current.attempts + 1
      : current.attempts;

  if (nextStatus === "failed") {
    const code = meta?.errorCode ?? "UNKNOWN_ERROR";
    return {
      ...current,
      status: "failed",
      progressPct: PROGRESS_BY_STATUS.failed,
      attempts,
      errorCode: code,
      errorMessage: meta?.errorMessage ?? "Audit job failed.",
      retryable: isRetryableJobError(code),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...current,
    status: nextStatus,
    progressPct: PROGRESS_BY_STATUS[nextStatus],
    attempts,
    ...(nextStatus === "completed" && meta?.auditId ? { auditId: meta.auditId } : {}),
    ...(nextStatus === "queued"
      ? { errorCode: undefined, errorMessage: undefined, retryable: undefined }
      : {}),
    updatedAt: new Date().toISOString(),
  };
}
