"use client";

import { cn } from "@/lib/utils";
import type { GTOClassification } from "@/types/poker";

function getClassificationColor(classification: GTOClassification): string {
  switch (classification) {
    case "best":
      return "text-[var(--gto-best)] border-[var(--gto-best)]/30 bg-[var(--gto-best)]/10";
    case "correct":
      return "text-[var(--gto-correct)] border-[var(--gto-correct)]/30 bg-[var(--gto-correct)]/10";
    case "inaccuracy":
      return "text-[var(--gto-inaccuracy)] border-[var(--gto-inaccuracy)]/30 bg-[var(--gto-inaccuracy)]/10";
    case "mistake":
      return "text-[var(--gto-mistake)] border-[var(--gto-mistake)]/30 bg-[var(--gto-mistake)]/10";
    case "blunder":
      return "text-[var(--gto-blunder)] border-[var(--gto-blunder)]/30 bg-[var(--gto-blunder)]/10";
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-[var(--gto-best)]";
  if (score >= 75) return "text-[var(--gto-correct)]";
  if (score >= 55) return "text-[var(--gto-inaccuracy)]";
  if (score >= 35) return "text-[var(--gto-mistake)]";
  return "text-[var(--gto-blunder)]";
}

function getScoreRingColor(score: number): string {
  if (score >= 90) return "stroke-[var(--gto-best)]";
  if (score >= 75) return "stroke-[var(--gto-correct)]";
  if (score >= 55) return "stroke-[var(--gto-inaccuracy)]";
  if (score >= 35) return "stroke-[var(--gto-mistake)]";
  return "stroke-[var(--gto-blunder)]";
}

interface GtoScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GtoScoreRing({ score, size = "md", className }: GtoScoreRingProps) {
  const sizes = {
    sm: { dim: 48, strokeWidth: 3, fontSize: "text-sm" },
    md: { dim: 80, strokeWidth: 4, fontSize: "text-2xl" },
    lg: { dim: 120, strokeWidth: 5, fontSize: "text-4xl" },
  };

  const { dim, strokeWidth, fontSize } = sizes[size];
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getScoreRingColor(score))}
        />
      </svg>
      <span
        className={cn(
          "absolute font-bold font-mono",
          fontSize,
          getScoreColor(score)
        )}
      >
        {score}
      </span>
    </div>
  );
}

interface GtoClassificationBadgeProps {
  classification: GTOClassification;
  className?: string;
}

export function GtoClassificationBadge({
  classification,
  className,
}: GtoClassificationBadgeProps) {
  const labels: Record<GTOClassification, string> = {
    best: "Best Move",
    correct: "Correct",
    inaccuracy: "Inaccuracy",
    mistake: "Mistake",
    blunder: "Blunder",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getClassificationColor(classification),
        className
      )}
    >
      {labels[classification]}
    </span>
  );
}
