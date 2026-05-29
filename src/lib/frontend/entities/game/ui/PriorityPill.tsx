"use client";

import { scoreToTier, nextTierScore } from "@/src/lib/backend/backlog/domain/models";

interface Props {
  score: number;
  gameId: string;
  onPriorityChange: (id: string, delta: number) => void;
}

export function PriorityPill({ score, gameId, onPriorityChange }: Props) {
  const tier = scoreToTier(score);
  return (
    <button
      onClick={() => onPriorityChange(gameId, nextTierScore(score) - score)}
      title="Click to raise priority tier"
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${tier.pillBg} ${tier.pillText}`}
    >
      {tier.label}
    </button>
  );
}
