import fs from "node:fs";
import path from "node:path";
import type { SampleAudit } from "@/lib/auditor/sample-audits";

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{4,64}$/;
const CACHE_DIR = path.join(process.cwd(), ".funnellens-cache", "audits");
const memoryFallback = new Map<string, SampleAudit>();

export function isValidAuditId(id: string): boolean {
  return SAFE_ID_REGEX.test(id);
}

export function saveStoredAudit(audit: SampleAudit): void {
  if (!isValidAuditId(audit.id)) {
    throw new Error("Invalid audit id format.");
  }
  memoryFallback.set(audit.id, audit);
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${audit.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(audit), "utf-8");
  } catch {
    // Keep memory copy when filesystem is read-only
  }
}

export function getStoredAuditById(id: string): SampleAudit | undefined {
  if (!isValidAuditId(id)) {
    return undefined;
  }
  const inMem = memoryFallback.get(id);
  if (inMem) return inMem;

  try {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) return undefined;
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as SampleAudit;
    memoryFallback.set(id, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}
