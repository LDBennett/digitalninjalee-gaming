"use client";

import {
  BookOpen,
  Coffee,
  Compass,
  LucideIcon,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import {
  PlayGoal,
  PLAY_GOAL_LABELS,
} from "@/src/lib/backend/backlog/domain/models";

const PLAY_GOAL_ICONS: Record<PlayGoal, LucideIcon> = {
  "story-completion": BookOpen,
  completionist: Trophy,
  casual: Coffee,
  "multiplayer-coop": Users,
  competitive: Swords,
  exploration: Compass,
};

const PLAY_GOAL_COLORS: Record<PlayGoal, string> = {
  "story-completion": "text-brand-400",
  completionist: "text-yellow-400",
  casual: "text-sky-400",
  "multiplayer-coop": "text-teal-400",
  competitive: "text-red-400",
  exploration: "text-emerald-400",
};

export function GameCardPlayGoals({ playGoals }: { playGoals: PlayGoal[] }) {
  if (playGoals.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {playGoals.map((goal) => {
        const Icon = PLAY_GOAL_ICONS[goal];
        return (
          <span
            key={goal}
            title={PLAY_GOAL_LABELS[goal]}
            className="inline-flex items-center"
          >
            <Icon size={14} className={PLAY_GOAL_COLORS[goal]} aria-hidden />
            <span className="sr-only">{PLAY_GOAL_LABELS[goal]}</span>
          </span>
        );
      })}
    </div>
  );
}
