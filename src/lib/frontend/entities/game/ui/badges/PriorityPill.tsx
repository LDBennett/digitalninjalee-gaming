"use client";

import {
  scoreToTier,
  nextTierScore,
} from "@/src/lib/backend/backlog/domain/models";
import { Badge } from "@/src/lib/frontend/shared";

interface Props {
  score: number;
  gameId: string;
  onPriorityChange: (id: string, delta: number) => void;
}

export function PriorityPill({ score, gameId, onPriorityChange }: Props) {
  const tier = scoreToTier(score);
  return (
    <Badge
      bg={tier.pillBg}
      text={tier.pillText}
      onClick={() => onPriorityChange(gameId, nextTierScore(score) - score)}
      title="Click to raise priority tier"
      className="transition-colors"
    >
      {tier.label}
    </Badge>
  );
}
