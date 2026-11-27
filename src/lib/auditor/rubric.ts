export type AuditCategory =
  | "value"
  | "action"
  | "hierarchy"
  | "proof"
  | "friction"
  | "legibility";

export type AuditSeverity = "critical" | "warning" | "tip";

export type AuditRuleId =
  | "value.outcome"
  | "value.object"
  | "action.entry"
  | "action.label"
  | "hierarchy.rivals"
  | "hierarchy.detour"
  | "proof.evidence"
  | "proof.claim"
  | "friction.fields"
  | "friction.terms"
  | "legibility.clipping"
  | "legibility.contrast";

export interface RuleDefinition {
  id: AuditRuleId;
  category: AuditCategory;
  severity: AuditSeverity;
  penalty: number;
}

export const CATEGORY_MAX_WEIGHTS: Record<AuditCategory, number> = {
  value: 24,
  action: 22,
  hierarchy: 16,
  proof: 14,
  friction: 14,
  legibility: 10,
};

export const RUBRIC_RULES: Record<AuditRuleId, RuleDefinition> = {
  "value.outcome": {
    id: "value.outcome",
    category: "value",
    severity: "critical",
    penalty: 14,
  },
  "value.object": {
    id: "value.object",
    category: "value",
    severity: "warning",
    penalty: 10,
  },
  "action.entry": {
    id: "action.entry",
    category: "action",
    severity: "critical",
    penalty: 14,
  },
  "action.label": {
    id: "action.label",
    category: "action",
    severity: "warning",
    penalty: 8,
  },
  "hierarchy.rivals": {
    id: "hierarchy.rivals",
    category: "hierarchy",
    severity: "warning",
    penalty: 10,
  },
  "hierarchy.detour": {
    id: "hierarchy.detour",
    category: "hierarchy",
    severity: "warning",
    penalty: 6,
  },
  "proof.evidence": {
    id: "proof.evidence",
    category: "proof",
    severity: "warning",
    penalty: 8,
  },
  "proof.claim": {
    id: "proof.claim",
    category: "proof",
    severity: "warning",
    penalty: 6,
  },
  "friction.fields": {
    id: "friction.fields",
    category: "friction",
    severity: "warning",
    penalty: 8,
  },
  "friction.terms": {
    id: "friction.terms",
    category: "friction",
    severity: "warning",
    penalty: 6,
  },
  "legibility.clipping": {
    id: "legibility.clipping",
    category: "legibility",
    severity: "warning",
    penalty: 6,
  },
  "legibility.contrast": {
    id: "legibility.contrast",
    category: "legibility",
    severity: "tip",
    penalty: 4,
  },
};

export interface DomAnchor {
  id: string;
  tag: string;
  label: string;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  isViewportFallback?: boolean;
}

export interface AuditIssue {
  id: AuditRuleId;
  category: AuditCategory;
  severity: AuditSeverity;
  elementId: string;
  title: string;
  problem: string;
  impact: string;
  concreteFix: string;
}

export interface RawAuditIssueInput {
  id: AuditRuleId;
  elementId: string;
  title: string;
  problem: string;
  impact: string;
  concreteFix: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
}

export interface HeroRewrite {
  beforeHeadline: string | null;
  afterHeadline: string | null;
  beforeSubheadline: string | null;
  afterSubheadline: string | null;
  beforeCta: string | null;
  afterCta: string | null;
  whyItConvertsBetter: string;
}

export interface CategoryScore {
  category: AuditCategory;
  earned: number;
  max: number;
  deducted: number;
}

export interface NormalizedAuditOutcome {
  score: number;
  issues: AuditIssue[];
  categoryScores: CategoryScore[];
  usedViewportFallbackIds: AuditRuleId[];
}

const ACTION_ENTRY_SUPPRESSED_RULES = new Set<AuditRuleId>([
  "action.label",
  "hierarchy.detour",
  "hierarchy.rivals",
]);

/**
 * Enforces all FunnelLens rubric invariants on raw findings:
 * - At most 1 penalty per rule ID
 * - If `action.entry` is present, skips CTA label & hierarchy positioning rules
 * - Locks `(category, severity)` strictly to `RUBRIC_RULES`
 * - Resolves missing DOM `elementId` values to the registered viewport fallback
 * - Sorts findings by penalty descending, then pin `yPct` top-to-bottom
 * - Computes `score = max(0, 100 - sum(penalties))`
 */
export function normalizeAndScoreAudit(
  rawIssues: RawAuditIssueInput[],
  anchors: DomAnchor[]
): NormalizedAuditOutcome {
  const anchorById = new Map<string, DomAnchor>(anchors.map((a) => [a.id, a]));
  const viewportFallback =
    anchors.find((a) => a.isViewportFallback) ??
    anchors.find((a) => a.id === "viewport") ??
    anchors[0];

  if (!viewportFallback) {
    throw new Error("Capture anchors must contain at least a viewport fallback anchor.");
  }

  const hasActionEntry = rawIssues.some((issue) => issue.id === "action.entry");
  const seenIds = new Set<AuditRuleId>();
  const usedViewportFallbackIds: AuditRuleId[] = [];
  const normalized: AuditIssue[] = [];

  for (const raw of rawIssues) {
    if (seenIds.has(raw.id)) {
      continue;
    }
    if (hasActionEntry && ACTION_ENTRY_SUPPRESSED_RULES.has(raw.id)) {
      continue;
    }

    const rule = RUBRIC_RULES[raw.id];
    seenIds.add(raw.id);

    let resolvedElementId = raw.elementId;
    if (!anchorById.has(resolvedElementId)) {
      resolvedElementId = viewportFallback.id;
      usedViewportFallbackIds.push(raw.id);
    }

    normalized.push({
      id: rule.id,
      category: rule.category,
      severity: rule.severity,
      elementId: resolvedElementId,
      title: raw.title.trim(),
      problem: raw.problem.trim(),
      impact: raw.impact.trim(),
      concreteFix: raw.concreteFix.trim(),
    });
  }

  normalized.sort((a, b) => {
    const penaltyDiff = RUBRIC_RULES[b.id].penalty - RUBRIC_RULES[a.id].penalty;
    if (penaltyDiff !== 0) {
      return penaltyDiff;
    }
    const anchorA = anchorById.get(a.elementId) ?? viewportFallback;
    const anchorB = anchorById.get(b.elementId) ?? viewportFallback;
    if (anchorA.yPct !== anchorB.yPct) {
      return anchorA.yPct - anchorB.yPct;
    }
    return anchorA.xPct - anchorB.xPct;
  });

  const deductionsByCategory: Record<AuditCategory, number> = {
    value: 0,
    action: 0,
    hierarchy: 0,
    proof: 0,
    friction: 0,
    legibility: 0,
  };

  let totalPenalty = 0;
  for (const issue of normalized) {
    const rule = RUBRIC_RULES[issue.id];
    totalPenalty += rule.penalty;
    deductionsByCategory[rule.category] += rule.penalty;
  }

  const score = Math.max(0, 100 - totalPenalty);
  const categoryScores = (Object.keys(CATEGORY_MAX_WEIGHTS) as AuditCategory[]).map(
    (category) => {
      const max = CATEGORY_MAX_WEIGHTS[category];
      const deducted = Math.min(max, deductionsByCategory[category]);
      return {
        category,
        earned: Math.max(0, max - deducted),
        max,
        deducted,
      };
    }
  );

  return {
    score,
    issues: normalized,
    categoryScores,
    usedViewportFallbackIds,
  };
}
