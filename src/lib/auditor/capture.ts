import fs from "node:fs";
import { chromium } from "playwright-core";
import type { DomAnchor } from "@/lib/auditor/rubric";
import { assertPublicHostname, validateAuditUrl } from "@/lib/auditor/url-safety";

export interface ExtractedDomAnchor extends DomAnchor {
  text: string;
  required?: boolean;
  isClipped?: boolean;
  fontSizePx?: number;
  fontWeight?: number;
  color?: string;
  backgroundColor?: string;
}

export interface CaptureResult {
  finalUrl: string;
  pageTitle: string;
  viewport: { width: number; height: number };
  screenshotDataUrl: string;
  screenshotBase64: string;
  anchors: ExtractedDomAnchor[];
}

export type CaptureErrorCode =
  | "INVALID_URL"
  | "NETWORK_BLOCKED"
  | "HTTP_ERROR"
  | "BOT_CHALLENGE"
  | "EMPTY_PAGE"
  | "BROWSER_UNAVAILABLE";

export class CaptureError extends Error {
  readonly code: CaptureErrorCode;
  readonly statusCode: number;

  constructor(code: CaptureErrorCode, message: string, statusCode = 422) {
    super(message);
    this.name = "CaptureError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function findBrowserExecutable(): string | null {
  const candidates = [
    process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function detectBotChallenge(input: {
  status: number | null;
  title: string;
  bodyText: string;
}): CaptureError | null {
  if (input.status !== null && input.status >= 400) {
    return new CaptureError(
      "HTTP_ERROR",
      `Target returned HTTP ${input.status}. Could not capture a healthy landing page.`,
      422
    );
  }

  const combined = `${input.title}\n${input.bodyText}`.toLowerCase();
  const challengeMarkers = [
    "just a moment...",
    "attention required! | cloudflare",
    "verify you are human",
    "enable javascript and cookies to continue",
    "cf-browser-verification",
    "g-recaptcha",
    "hcaptcha",
  ];

  if (challengeMarkers.some((m) => combined.includes(m)) && input.bodyText.trim().length < 800) {
    return new CaptureError(
      "BOT_CHALLENGE",
      "The target page presented a CAPTCHA or anti-bot challenge instead of landing copy.",
      422
    );
  }

  if (input.bodyText.trim().length < 20) {
    return new CaptureError(
      "EMPTY_PAGE",
      "The captured first screen contained almost no readable text.",
      422
    );
  }

  return null;
}

export async function captureFirstScreen(targetUrl: string): Promise<CaptureResult> {
  const safety = validateAuditUrl(targetUrl);
  if (!safety.valid || !safety.normalizedUrl || !safety.hostname) {
    throw new CaptureError(
      "INVALID_URL",
      safety.error ?? "Invalid target URL.",
      400
    );
  }

  try {
    await assertPublicHostname(safety.hostname);
  } catch (err) {
    throw new CaptureError(
      "NETWORK_BLOCKED",
      err instanceof Error ? err.message : "Blocked non-public hostname.",
      400
    );
  }

  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    throw new CaptureError(
      "BROWSER_UNAVAILABLE",
      "Headless Chromium/Chrome binary is not installed in this runtime environment.",
      503
    );
  }

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const verifiedHosts = new Set<string>([safety.hostname]);

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.route("**/*", async (route) => {
      const reqUrl = route.request().url();
      if (reqUrl.startsWith("data:") || reqUrl.startsWith("blob:") || reqUrl === "about:blank") {
        await route.continue();
        return;
      }

      const check = validateAuditUrl(reqUrl);
      if (!check.valid || !check.hostname) {
        await route.abort("blockedbyclient");
        return;
      }

      if (!verifiedHosts.has(check.hostname)) {
        try {
          await assertPublicHostname(check.hostname);
          verifiedHosts.add(check.hostname);
        } catch {
          await route.abort("blockedbyclient");
          return;
        }
      }

      await route.continue();
    });

    const response = await page.goto(safety.normalizedUrl, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => undefined);
    await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
    await page.waitForTimeout(350);

    const finalUrl = page.url();
    const finalCheck = validateAuditUrl(finalUrl);
    if (!finalCheck.valid || !finalCheck.hostname) {
      throw new CaptureError(
        "NETWORK_BLOCKED",
        "Redirect target points to a blocked or non-public URL.",
        400
      );
    }
    await assertPublicHostname(finalCheck.hostname).catch(() => {
      throw new CaptureError(
        "NETWORK_BLOCKED",
        "Redirect destination resolved to a blocked IP.",
        400
      );
    });

    const pageInfo = await page.evaluate(() => ({
      title: document.title || "",
      bodyText: (document.body?.innerText || "").slice(0, 2000),
    }));

    const challengeError = detectBotChallenge({
      status: response ? response.status() : null,
      title: pageInfo.title,
      bodyText: pageInfo.bodyText,
    });
    if (challengeError) {
      throw challengeError;
    }

    const domAnchors = await page.evaluate(() => {
      const vw = 1280;
      const vh = 800;
      const selector =
        "h1, h2, h3, p, a, button, input, select, textarea, form, nav, img, [role='button']";
      const candidates = Array.from(document.querySelectorAll(selector));
      const collected: Array<{
        id: string;
        tag: string;
        label: string;
        text: string;
        xPct: number;
        yPct: number;
        wPct: number;
        hPct: number;
        required?: boolean;
        isClipped?: boolean;
        fontSizePx?: number;
        fontWeight?: number;
        color?: string;
        backgroundColor?: string;
      }> = [];

      const seenBoxes = new Set<string>();
      let idx = 1;

      for (const el of candidates) {
        if (collected.length >= 36) break;
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          parseFloat(style.opacity || "1") < 0.05
        ) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width < 12 || rect.height < 12) continue;
        if (rect.bottom <= 0 || rect.top >= vh || rect.right <= 0 || rect.left >= vw) {
          continue;
        }

        const x = Math.max(0, rect.left);
        const y = Math.max(0, rect.top);
        const right = Math.min(vw, rect.right);
        const bottom = Math.min(vh, rect.bottom);
        const w = right - x;
        const h = bottom - y;
        if (w < 10 || h < 10) continue;

        const textRaw =
          (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
            ? el.placeholder || el.getAttribute("aria-label") || el.name
            : el.textContent || el.getAttribute("aria-label") || el.getAttribute("alt")) || "";
        const text = textRaw.replace(/\s+/g, " ").trim().slice(0, 140);
        const tag = el.tagName.toLowerCase();

        if (!text && !["input", "form", "img"].includes(tag)) continue;

        const boxKey = `${Math.round(x / 8)}:${Math.round(y / 8)}:${tag}`;
        if (seenBoxes.has(boxKey)) continue;
        seenBoxes.add(boxKey);

        const isRequired =
          el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
            ? el.required || el.getAttribute("aria-required") === "true"
            : false;

        const isClipped =
          el.scrollWidth > el.clientWidth + 2 &&
          (style.overflowX === "hidden" || style.overflow === "hidden");

        collected.push({
          id: `el_${String(idx++).padStart(2, "0")}`,
          tag,
          label: `${tag}${text ? `: ${text.slice(0, 48)}` : ""}`,
          text,
          xPct: Number(((x / vw) * 100).toFixed(2)),
          yPct: Number(((y / vh) * 100).toFixed(2)),
          wPct: Number(((w / vw) * 100).toFixed(2)),
          hPct: Number(((h / vh) * 100).toFixed(2)),
          ...(isRequired ? { required: true } : {}),
          ...(isClipped ? { isClipped: true } : {}),
          fontSizePx: Math.round(parseFloat(style.fontSize || "16")),
          fontWeight: Number(style.fontWeight) || 400,
          color: style.color,
          backgroundColor: style.backgroundColor,
        });
      }

      return collected;
    });

    const anchors: ExtractedDomAnchor[] = [
      {
        id: "viewport",
        tag: "body",
        label: "Viewport 1280×800",
        text: pageInfo.title,
        xPct: 0,
        yPct: 0,
        wPct: 100,
        hPct: 100,
        isViewportFallback: true,
      },
      ...domAnchors,
    ];

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 82,
      fullPage: false,
    });

    const screenshotBase64 = screenshotBuffer.toString("base64");
    const screenshotDataUrl = `data:image/jpeg;base64,${screenshotBase64}`;

    return {
      finalUrl,
      pageTitle: pageInfo.title || finalCheck.hostname,
      viewport: { width: 1280, height: 800 },
      screenshotDataUrl,
      screenshotBase64,
      anchors,
    };
  } finally {
    await browser.close();
  }
}
