"use client";

import {
  scoreToTier,
  nextTierScore,
} from "@/src/lib/backend/backlog/domain/models";
import { Badge } from "@/src/lib/frontend/shared";

interface Props {
  score: number;
  gameId: string;
  onPriorityChange?: (id: string, delta: number) => void;
}

export function PriorityPill({ score, gameId, onPriorityChange }: Props) {
  const tier = scoreToTier(score);
  return (
    <Badge
      bg={tier.pillBg}
      text={tier.pillText}
      onClick={
        onPriorityChange
          ? () => onPriorityChange(gameId, nextTierScore(score) - score)
          : undefined
      }
      title={
        onPriorityChange
          ? `Priority: ${tier.label} (${score}) — Click to cycle tier`
          : `Priority: ${tier.label} (${score})`
      }
      className="gap-1 font-semibold select-none"
    >
      <span>{tier.label}</span>
      <span className="font-mono text-[10px] opacity-70">· {score}</span>
    </Badge>
  );
}
