export type PriorityTierId = 'low' | 'medium' | 'high' | 'critical';

export const PRIORITY_TIERS = [
  { id: 'low'      as PriorityTierId, label: 'Low',      min: 1,  max: 25,  score: 13, bar: 'bg-gray-500',   pillBg: 'bg-gray-800',      pillText: 'text-gray-400'   },
  { id: 'medium'   as PriorityTierId, label: 'Medium',   min: 26, max: 50,  score: 38, bar: 'bg-amber-500',  pillBg: 'bg-amber-900/40',  pillText: 'text-amber-400'  },
  { id: 'high'     as PriorityTierId, label: 'High',     min: 51, max: 75,  score: 63, bar: 'bg-orange-500', pillBg: 'bg-orange-900/40', pillText: 'text-orange-400' },
  { id: 'critical' as PriorityTierId, label: 'Critical', min: 76, max: 100, score: 88, bar: 'bg-red-500',    pillBg: 'bg-red-900/40',    pillText: 'text-red-400'    },
] as const;

export function scoreToTier(score: number) {
  return PRIORITY_TIERS.find(t => score >= t.min && score <= t.max) ?? PRIORITY_TIERS[0];
}

export function nextTierScore(score: number): number {
  const idx = PRIORITY_TIERS.findIndex(t => score >= t.min && score <= t.max);
  return PRIORITY_TIERS[(idx + 1) % PRIORITY_TIERS.length].score;
}
