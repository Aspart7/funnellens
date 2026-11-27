"use client";

import Image from "next/image";
import { useMemo } from "react";
import { RUBRIC_RULES, type AuditIssue, type DomAnchor } from "@/lib/auditor/rubric";

interface PinCanvasProps {
  captureUrl: string;
  brandName: string;
  anchors: DomAnchor[];
  issues: AuditIssue[];
  activeIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
}

export function PinCanvas({
  captureUrl,
  brandName,
  anchors,
  issues,
  activeIssueId,
  onSelectIssue,
}: PinCanvasProps) {
  const anchorMap = useMemo(
    () => new Map<string, DomAnchor>(anchors.map((a) => [a.id, a])),
    [anchors]
  );

  const fallbackAnchor =
    anchors.find((a) => a.isViewportFallback) ?? anchors[0];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] w-full bg-zinc-100">
        <Image
          src={captureUrl}
          alt={`${brandName} first-screen capture (1280×800)`}
          width={1280}
          height={800}
          className="h-full w-full object-cover"
          priority
        />

        {/* Highlight box for active issue */}
        {issues.map((issue) => {
          const anchor = anchorMap.get(issue.elementId) ?? fallbackAnchor;
          if (!anchor) return null;
          const isActive = activeIssueId === issue.id;
          if (!isActive) return null;

          const boxTone =
            issue.severity === "critical"
              ? "border-rose-500 bg-rose-500/10"
              : issue.severity === "warning"
                ? "border-amber-500 bg-amber-500/10"
                : "border-sky-500 bg-sky-500/10";

          return (
            <div
              key={`box-${issue.id}`}
              style={{
                left: `${anchor.xPct}%`,
                top: `${anchor.yPct}%`,
                width: `${anchor.wPct}%`,
                height: `${anchor.hPct}%`,
              }}
              className={`pointer-events-none absolute rounded-lg border-2 border-dashed transition-all duration-200 ${boxTone}`}
            />
          );
        })}

        {/* Interactive numbered pins */}
        {issues.map((issue, idx) => {
          const anchor = anchorMap.get(issue.elementId) ?? fallbackAnchor;
          if (!anchor) return null;
          const isActive = activeIssueId === issue.id;
          const penalty = RUBRIC_RULES[issue.id].penalty;

          const pinX = Math.min(96, Math.max(3, anchor.xPct + Math.min(anchor.wPct, 4)));
          const pinY = Math.min(94, Math.max(4, anchor.yPct));

          const pinStyle =
            issue.severity === "critical"
              ? "bg-rose-600 text-white ring-rose-200"
              : issue.severity === "warning"
                ? "bg-amber-500 text-zinc-950 ring-amber-200"
                : "bg-sky-600 text-white ring-sky-200";

          return (
            <button
              key={`pin-${issue.id}`}
              type="button"
              onClick={() => onSelectIssue(issue.id)}
              title={`${issue.title} (-${penalty} pts)`}
              style={{
                left: `${pinX}%`,
                top: `${pinY}%`,
              }}
              className={`absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold shadow-md transition-transform duration-150 ${pinStyle} ${
                isActive
                  ? "scale-125 ring-4"
                  : "opacity-95 hover:scale-110 hover:ring-4"
              }`}
              aria-label={`Issue ${idx + 1}: ${issue.title}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
