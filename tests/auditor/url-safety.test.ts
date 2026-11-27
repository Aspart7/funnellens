import { describe, expect, it } from "vitest";
import { validateAuditUrl } from "@/lib/auditor/url-safety";

describe("validateAuditUrl SSRF guard", () => {
  it("accepts public https and http URLs and normalizes bare domains", () => {
    const httpsRes = validateAuditUrl("https://stripe.com/pricing");
    expect(httpsRes.valid).toBe(true);
    expect(httpsRes.normalizedUrl).toBe("https://stripe.com/pricing");

    const bareRes = validateAuditUrl("linear.app");
    expect(bareRes.valid).toBe(true);
    expect(bareRes.normalizedUrl).toBe("https://linear.app/");
  });

  it("blocks loopback, metadata, private IPv4/IPv6, local domains, and non-http schemes", () => {
    const blocked = [
      "http://127.0.0.1:3000",
      "http://localhost:8080",
      "http://169.254.169.254/latest/meta-data",
      "https://10.0.0.5/admin",
      "https://192.168.1.1",
      "https://172.16.0.1",
      "http://[::1]/",
      "http://[::ffff:127.0.0.1]/",
      "http://[::ffff:a9fe:a9fe]/",
      "https://service.internal",
      "file:///etc/passwd",
      "javascript:alert(1)",
      "https://user:pass@example.com",
    ];

    for (const candidate of blocked) {
      const res = validateAuditUrl(candidate);
      expect(res.valid, `Expected ${candidate} to be blocked`).toBe(false);
    }
  });
});
