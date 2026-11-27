# CLAUDE.md — FunnelLens

## Product Overview
FunnelLens audits the first screen (`1280 x 800` above-the-fold capture) of a landing page against a deterministic 12-rule / 6-category CRO rubric (`0–100` score), attaches findings to captured DOM coordinates, and produces grounded Before/After hero rewrites across 5 UI languages (`en`, `ru`, `kk`, `zh`, `es`).

## Directory Map
- `src/app/` — Next.js App Router pages and API route handlers (`POST /api/audits`, `/audit/[id]`)
- `src/components/` — Interactive PinCanvas, HeroRewriteCard, Header, Footer
- `src/lib/auditor/` — Pure deterministic audit rubric, Zod validators, WCAG contrast utilities, SSRF URL safety guards, and verified sample audits (`ledgerlane`, `briefloom`, `tracedock`)
- `src/lib/i18n/` — Typed translation dictionaries (`en`, `ru`, `kk`, `zh`, `es`)
- `schemas/funnellens-audit.schema.json` — Canonical Draft 2020-12 JSON Schema contract
- `tests/` — Vitest unit test suites
- `public/demos/` — Pixel-aligned `1280x800` SVG sample captures

## Non-Negotiable Engineering Rules
1. **Strict TypeScript & Schema Validation**: No `any`, no `@ts-ignore`. Validate all inputs and audit payloads with `zod` matching `schemas/funnellens-audit.schema.json`.
2. **Server-Computed Rubric Invariants**:
   - At most 1 penalty per rule ID (`score = max(0, 100 - sum(penalties))`).
   - Exact `(id, category, severity)` tuples enforced in `src/lib/auditor/rubric.ts`.
   - If `action.entry` is present, skip `action.label`, `hierarchy.detour`, and `hierarchy.rivals`.
   - Every `elementId` must exist in the captured DOM anchor map (falling back to the registered `viewport` anchor if needed).
   - Never fabricate unknown facts in `heroRewrite`: return `null` and explain the missing fact in `whyItConvertsBetter`.
3. **Security Hygiene**:
   - SSRF protection (`src/lib/auditor/url-safety.ts`): allow only `http:` / `https:`; block `localhost`, `*.local`, `*.internal`, private/loopback/link-local/CGNAT IPv4 and IPv6 ranges, and URL-embedded credentials.
   - Keep `FIREBASE_ADMIN_*`, `TRIGGER_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `GEMINI_API_KEY` server-only.
   - Verify Stripe webhook signatures using raw request body and restrict Firestore `plan` updates to Admin SDK.
4. **i18n Discipline**: All UI strings live in `src/lib/i18n/dictionaries.ts` across all 5 supported locales (`en`, `ru`, `kk`, `zh`, `es`).

## Verification Commands (Run Before Every Commit / PR)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint (`next lint`)
- `npm test` — Vitest unit tests
- `npm run build` — Production Next.js build

## Git & PR Workflow
- Branch naming: `chore/<scope>`, `feat/<scope>`, `fix/<scope>`, `docs/<scope>`
- Conventional Commits: `feat(auditor): ...`, `fix(ui): ...`, `test(rubric): ...`
