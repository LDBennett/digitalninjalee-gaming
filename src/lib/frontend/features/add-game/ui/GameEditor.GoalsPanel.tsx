"use client";

import {
  MoodDto,
  PLAY_GOAL_STATUSES,
  PRIORITY_TIERS,
  scoreToTier,
} from "@/src/lib/backend/backlog/domain/models";
import { useAddGameForm } from "../hooks/useAddGameForm";
import { MoodSelector } from "./AddGameFormFields.MoodSelector";
import { PlayGoalsField } from "./AddGameFormFields.PlayGoals";

interface GameEditorGoalsPanelProps {
  form: ReturnType<typeof useAddGameForm>;
  moods: MoodDto[];
}

export function GameEditorGoalsPanel({
  form,
  moods,
}: GameEditorGoalsPanelProps) {
  const { priorityScore, setPriorityScore, status, selectedMoods, toggleMood } =
    form;

  const showPlayGoals = (PLAY_GOAL_STATUSES as ReadonlyArray<string>).includes(
    status,
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Priority Tier
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRIORITY_TIERS.map((tier) => {
            const isSelected = scoreToTier(priorityScore).id === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPriorityScore(tier.score)}
                className={`rounded-lg py-2 px-3 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? `${tier.pillBg} ${tier.pillText} ring-1 ring-current ring-inset shadow-sm`
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {showPlayGoals && <PlayGoalsField form={form} />}

      <MoodSelector
        moods={moods}
        selectedIds={selectedMoods}
        onToggle={toggleMood}
      />
    </div>
  );
}
