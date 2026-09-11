export type PriorityTierId = "low" | "medium" | "high" | "critical";

export const PRIORITY_TIERS = [
  {
    id: "low" as PriorityTierId,
    label: "Low",
    min: 1,
    max: 25,
    score: 13,
    bar: "bg-slate-400",
    pillBg: "bg-slate-500/15 border-slate-500/30",
    pillText: "text-slate-300",
  },
  {
    id: "medium" as PriorityTierId,
    label: "Medium",
    min: 26,
    max: 50,
    score: 38,
    bar: "bg-amber-500",
    pillBg: "bg-amber-500/15 border-amber-500/30",
    pillText: "text-amber-300",
  },
  {
    id: "high" as PriorityTierId,
    label: "High",
    min: 51,
    max: 75,
    score: 63,
    bar: "bg-orange-500",
    pillBg: "bg-orange-500/15 border-orange-500/30",
    pillText: "text-orange-300",
  },
  {
    id: "critical" as PriorityTierId,
    label: "Critical",
    min: 76,
    max: 100,
    score: 88,
    bar: "bg-red-500",
    pillBg: "bg-red-500/15 border-red-500/30",
    pillText: "text-red-300",
  },
] as const;

export function scoreToTier(score: number) {
  return (
    PRIORITY_TIERS.find((t) => score >= t.min && score <= t.max) ??
    PRIORITY_TIERS[0]
  );
}

export function nextTierScore(score: number): number {
  const idx = PRIORITY_TIERS.findIndex((t) => score >= t.min && score <= t.max);
  return PRIORITY_TIERS[(idx + 1) % PRIORITY_TIERS.length].score;
}
