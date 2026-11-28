import { describe, expect, it } from "vitest";
import {
  createAuditJob,
  isRetryableJobError,
  transitionAuditJob,
} from "@/lib/jobs/audit-job";

describe("Background Trigger.dev job state machine", () => {
  it("tracks valid step transitions and completion", () => {
    let job = createAuditJob("job_1", "https://example.com", "user_1");
    expect(job.status).toBe("queued");

    job = transitionAuditJob(job, "capturing");
    expect(job.progressPct).toBe(35);
    expect(job.attempts).toBe(1);

    job = transitionAuditJob(job, "analyzing");
    expect(job.progressPct).toBe(70);

    job = transitionAuditJob(job, "validating");
    job = transitionAuditJob(job, "completed", { auditId: "live-123" });
    expect(job.status).toBe("completed");
    expect(job.progressPct).toBe(100);
    expect(job.auditId).toBe("live-123");
  });

  it("blocks invalid backward transitions and distinguishes retryable vs terminal failures", () => {
    const job = transitionAuditJob(
      createAuditJob("job_2", "https://example.com", null),
      "capturing"
    );
    expect(() => transitionAuditJob(job, "completed")).toThrow();

    const quotaFail = transitionAuditJob(job, "failed", {
      errorCode: "QUOTA_EXCEEDED",
      errorMessage: "429",
    });
    expect(quotaFail.retryable).toBe(true);
    expect(isRetryableJobError("BOT_CHALLENGE")).toBe(false);

    const retried = transitionAuditJob(quotaFail, "queued");
    expect(retried.status).toBe("queued");
    expect(retried.errorCode).toBeUndefined();
  });
});
