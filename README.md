# FunnelLens

First-screen (`1280×800`) landing page conversion auditor built with **Next.js 15 (App Router)**, **TypeScript (strict)**, **Tailwind CSS**, **Zod**, **Playwright**, **Gemini Vision**, and **Vitest**.

- **Public Hosted App:** https://funnellens-pied.vercel.app/
- **Portfolio Case Study:** https://temirlan-about.vercel.app/

## What Works Today

| Mode | Capabilities | Notes |
| :--- | :--- | :--- |
| **Public Hosted Demo (Vercel)** | 3 interactive `1280×800` sample audits (`ledgerlane`, `briefloom`, `tracedock`) with pixel-aligned DOM pins, severity filters, Copy Fix, `Hero Before / After` comparison, and 5-locale UI (`EN / RU / KK / ZH / ES`). | Works with zero signup or API key. Arbitrary URL submission validates SSRF safety and directs to sample audits cleanly until Trigger.dev cloud workers are connected. |
| **Full Local E2E Live Audit** | Real **Playwright** Chromium `1280×800` capture + network-level SSRF route filtering + DOM bounding-box extraction → **Gemini Vision** observation → deterministic server 12-rule / 6-category scoring + Zod contract validation → rendered `/audit/[id]` report. | Requires local Chrome/Chromium and `GEMINI_API_KEY` in `.env.local`. |
| **Local-Tested Cloud Foundations** | `firestore.rules` + access evaluators, Trigger.dev-ready job state machine, and HMAC-SHA256 Stripe webhook handler with idempotent replay protection. | Covered by Vitest suites; waiting on user's Firebase / Trigger.dev / Stripe accounts. |

## Architecture Highlights
- `src/lib/auditor/rubric.ts` — 12-rule CRO rubric (6 weighted categories = 100 pts), unique penalty rule, `action.entry` suppression, DOM `elementId` verification + `viewport` fallback, and top-to-bottom tie-breaking.
- `src/lib/auditor/schema.ts` & `schemas/funnellens-audit.schema.json` — strict Zod validation mirroring Draft 2020-12 JSON Schema.
- `src/lib/auditor/url-safety.ts` — SSRF protection across entry URLs, DNS resolution, redirects, and Playwright subresources (blocking localhost, `*.internal`, private/loopback/metadata IPv4, and IPv4-mapped IPv6).
- `src/lib/auditor/capture.ts` & `gemini-analyzer.ts` — end-to-end Playwright `1280×800` capture and server-only Gemini Vision pipeline.
- `firestore.rules`, `src/lib/firebase/access.ts`, `src/lib/jobs/audit-job.ts`, `src/lib/stripe/webhook.ts` — locally verified foundations for Auth/DB rules, async jobs, and Stripe Test Mode webhooks.

## Local Development & Verification

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY
npm run typecheck
npm run lint
npm test
npm run build
npm run dev
```
