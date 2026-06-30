"use client";

import {
  PlayGoal,
  PLAY_GOAL_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import { Badge } from "@/src/lib/frontend/shared";

const PLAY_GOAL_STYLES: Record<PlayGoal, { bg: string; text: string }> = {
  "story-completion": { bg: "bg-brand-900/60", text: "text-brand-400" },
  completionist: { bg: "bg-yellow-900/60", text: "text-yellow-400" },
  casual: { bg: "bg-sky-900/60", text: "text-sky-400" },
  "multiplayer-coop": { bg: "bg-teal-900/60", text: "text-teal-400" },
  competitive: { bg: "bg-red-900/60", text: "text-red-400" },
  exploration: { bg: "bg-emerald-900/60", text: "text-emerald-400" },
};

function PlayGoalBadge({ goal }: { goal: PlayGoal }) {
  const style = PLAY_GOAL_STYLES[goal];
  return (
    <Badge bg={style.bg} text={style.text}>
      {PLAY_GOAL_LABELS[goal]}
    </Badge>
  );
}

export function GameCardPlayGoals({ playGoals }: { playGoals: PlayGoal[] }) {
  if (playGoals.length === 0) return null;
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
        {playGoals.slice(0, 2).map((goal) => (
          <PlayGoalBadge key={goal} goal={goal} />
        ))}
        {playGoals.length > 2 && (
          <span className="inline-flex items-center rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-400">
            +{playGoals.length - 2}
          </span>
        )}
      </div>
      <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
        {playGoals.map((goal) => (
          <PlayGoalBadge key={goal} goal={goal} />
        ))}
      </div>
    </>
  );
}
