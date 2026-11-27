import { z } from "zod";
import { RUBRIC_RULES, type AuditRuleId } from "@/lib/auditor/rubric";

const nonWhitespaceString = (maxLen: number) =>
  z
    .string()
    .min(1)
    .max(maxLen)
    .refine((val) => /\S/.test(val), {
      message: "Must contain at least one non-whitespace character.",
    });

const nullableTextSchema = z.union([nonWhitespaceString(700), z.null()]);

export const AuditRuleIdSchema = z.enum([
  "value.outcome",
  "value.object",
  "action.entry",
  "action.label",
  "hierarchy.rivals",
  "hierarchy.detour",
  "proof.evidence",
  "proof.claim",
  "friction.fields",
  "friction.terms",
  "legibility.clipping",
  "legibility.contrast",
]);

export const AuditCategorySchema = z.enum([
  "value",
  "action",
  "hierarchy",
  "proof",
  "friction",
  "legibility",
]);

export const AuditSeveritySchema = z.enum(["critical", "warning", "tip"]);

export const AuditIssueSchema = z
  .object({
    id: AuditRuleIdSchema,
    category: AuditCategorySchema,
    severity: AuditSeveritySchema,
    elementId: nonWhitespaceString(120),
    title: nonWhitespaceString(100),
    problem: nonWhitespaceString(700),
    impact: nonWhitespaceString(700),
    concreteFix: nonWhitespaceString(700),
  })
  .strict()
  .superRefine((issue, ctx) => {
    const expected = RUBRIC_RULES[issue.id as AuditRuleId];
    if (issue.category !== expected.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: `Rule "${issue.id}" requires category "${expected.category}".`,
      });
    }
    if (issue.severity !== expected.severity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["severity"],
        message: `Rule "${issue.id}" requires severity "${expected.severity}".`,
      });
    }
  });

export const HeroRewriteSchema = z
  .object({
    beforeHeadline: nullableTextSchema,
    afterHeadline: nullableTextSchema,
    beforeSubheadline: nullableTextSchema,
    afterSubheadline: nullableTextSchema,
    beforeCta: nullableTextSchema,
    afterCta: nullableTextSchema,
    whyItConvertsBetter: nonWhitespaceString(700),
  })
  .strict();

export const AuditResultSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    issues: z
      .array(AuditIssueSchema)
      .max(12)
      .superRefine((issues, ctx) => {
        const seen = new Set<string>();
        issues.forEach((item, index) => {
          if (seen.has(item.id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, "id"],
              message: `Duplicate issue id "${item.id}" is forbidden.`,
            });
          }
          seen.add(item.id);
        });
      }),
    heroRewrite: HeroRewriteSchema,
  })
  .strict();

export const DomAnchorSchema = z
  .object({
    id: nonWhitespaceString(120),
    tag: nonWhitespaceString(40),
    label: nonWhitespaceString(160),
    xPct: z.number().min(0).max(100),
    yPct: z.number().min(0).max(100),
    wPct: z.number().positive().max(100),
    hPct: z.number().positive().max(100),
    isViewportFallback: z.boolean().optional(),
  })
  .strict();

export const AuditRequestSchema = z
  .object({
    url: z.string().trim().min(1).max(2048),
    locale: z.enum(["en", "ru", "kk", "zh", "es"]).optional().default("en"),
  })
  .strict();
