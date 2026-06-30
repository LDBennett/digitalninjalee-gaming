"use client";

import {
  PLAY_GOALS,
  PLAY_GOAL_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import { useAddGameForm } from "../hooks/useAddGameForm";

interface PlayGoalsFieldProps {
  form: ReturnType<typeof useAddGameForm>;
}

export function PlayGoalsField({ form }: PlayGoalsFieldProps) {
  const { selectedPlayGoals, togglePlayGoal } = form;
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">
        Play Goals
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {PLAY_GOALS.map((goal) => {
          const isSelected = selectedPlayGoals.includes(goal);
          return (
            <button
              key={goal}
              type="button"
              onClick={() => togglePlayGoal(goal)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-brand-900/60 text-brand-400 ring-1 ring-current ring-inset"
                  : "bg-gray-800 text-gray-500 hover:text-white"
              }`}
            >
              {PLAY_GOAL_LABELS[goal]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
