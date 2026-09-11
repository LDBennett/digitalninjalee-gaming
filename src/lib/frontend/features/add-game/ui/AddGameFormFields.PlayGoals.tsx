"use client";

import { BookOpen, Trophy, Coffee, Users, Swords, Compass } from "lucide-react";
import {
  PLAY_GOALS,
  PLAY_GOAL_LABELS,
  PlayGoal,
} from "@/src/lib/backend/backlog/domain/models";
import { useAddGameForm } from "../hooks/useAddGameForm";

interface PlayGoalsFieldProps {
  form: ReturnType<typeof useAddGameForm>;
}

const PLAY_GOAL_ICONS: Record<PlayGoal, React.ReactNode> = {
  "story-completion": <BookOpen size={13} className="shrink-0" />,
  completionist: <Trophy size={13} className="shrink-0" />,
  casual: <Coffee size={13} className="shrink-0" />,
  "multiplayer-coop": <Users size={13} className="shrink-0" />,
  competitive: <Swords size={13} className="shrink-0" />,
  exploration: <Compass size={13} className="shrink-0" />,
};

export function PlayGoalsField({ form }: PlayGoalsFieldProps) {
  const { selectedPlayGoals, togglePlayGoal } = form;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-gray-400">Play Goals</label>
        {selectedPlayGoals.length > 0 && (
          <span className="text-brand-400 text-[11px] font-medium">
            {selectedPlayGoals.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {PLAY_GOALS.map((goal) => {
          const isSelected = selectedPlayGoals.includes(goal);
          return (
            <button
              key={goal}
              type="button"
              onClick={() => togglePlayGoal(goal)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors select-none ${
                isSelected
                  ? "bg-brand-900/60 border-brand-500/60 text-brand-200 shadow-xs shadow-black/20"
                  : "border-gray-800 bg-gray-900/80 text-gray-400 hover:border-gray-700 hover:text-gray-200"
              }`}
            >
              <span className={isSelected ? "text-brand-300" : "text-gray-500"}>
                {PLAY_GOAL_ICONS[goal]}
              </span>
              <span>{PLAY_GOAL_LABELS[goal]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
