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
import { GameEditorGoalsPanelRoadmapSection } from "./GameEditorGoalsPanel.RoadmapSection";

interface GameEditorGoalsPanelProps {
  form: ReturnType<typeof useAddGameForm>;
  moods: MoodDto[];
}

const TIER_COLORS: Record<string, { accent: string; hex: string }> = {
  low: { accent: "accent-gray-400", hex: "#9ca3af" },
  medium: { accent: "accent-amber-500", hex: "#f59e0b" },
  high: { accent: "accent-orange-500", hex: "#f97316" },
  critical: { accent: "accent-red-500", hex: "#ef4444" },
};

export function GameEditorGoalsPanel({
  form,
  moods,
}: GameEditorGoalsPanelProps) {
  const { priorityScore, setPriorityScore, status, selectedMoods, toggleMood } =
    form;

  const currentTier = scoreToTier(priorityScore);
  const tierColor = TIER_COLORS[currentTier.id] ?? TIER_COLORS.low;
  const progressPercent = Math.min(
    Math.max(((priorityScore - 1) / 99) * 100, 0),
    100,
  );

  const showPlayGoals = (PLAY_GOAL_STATUSES as ReadonlyArray<string>).includes(
    status,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-400">
            Priority Tier
          </label>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${currentTier.pillBg} ${currentTier.pillText}`}
          >
            <span>{currentTier.label}</span>
            <span className="font-mono text-[11px] opacity-75">
              • {priorityScore}
            </span>
          </span>
        </div>

        {/* 4 Preset Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRIORITY_TIERS.map((tier) => {
            const isSelected = currentTier.id === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPriorityScore(tier.score)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all select-none sm:text-sm ${
                  isSelected
                    ? `${tier.pillBg} ${tier.pillText} shadow-xs ring-1 ring-current ring-inset`
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>

        {/* Integrated Filled Meter Slider */}
        <div className="space-y-1 pt-0.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={1}
              max={100}
              value={priorityScore}
              onChange={(e) => setPriorityScore(Number(e.target.value))}
              className={`h-2 w-full cursor-pointer appearance-none rounded-full ${tierColor.accent}`}
              style={{
                background: `linear-gradient(to right, ${tierColor.hex} 0%, ${tierColor.hex} ${progressPercent}%, #1f2937 ${progressPercent}%, #1f2937 100%)`,
              }}
            />
          </div>
          <div className="flex justify-between px-0.5 font-mono text-[10px] text-gray-500">
            <span>1 Low</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100 Crit</span>
          </div>
        </div>
      </div>

      {showPlayGoals && (
        <>
          <PlayGoalsField form={form} />
          {(form.selectedPlayGoals.includes("completionist") ||
            Boolean(form.completionRoadmap)) && (
            <GameEditorGoalsPanelRoadmapSection form={form} />
          )}
        </>
      )}

      <MoodSelector
        moods={moods}
        selectedIds={selectedMoods}
        onToggle={toggleMood}
      />
    </div>
  );
}
