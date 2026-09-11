"use client";

import { GameDto, MoodDto } from "@/src/lib/backend/backlog/domain/models";
import {
  GameEditorDetailsPanel,
  GameEditorGoalsPanel,
  GameEditorHeroPanel,
  GameEditorScratchpad,
  useAddGameForm,
} from "@/src/lib/frontend/features/add-game";
import { GameLogTimeline } from "@/src/lib/frontend/features/game-logs";
import { ActiveGameModalTab } from "@/src/lib/frontend/shared";
import { GameModalTabs } from "./GameModal.Tabs";

interface GameModalEditorProps {
  form: ReturnType<typeof useAddGameForm>;
  editGame?: GameDto | null;
  moods: MoodDto[];
  activeTab: ActiveGameModalTab;
  onChangeTab: (tab: ActiveGameModalTab) => void;
  isAddMode?: boolean;
}

export function GameModalEditor({
  form,
  editGame,
  moods,
  activeTab,
  onChangeTab,
  isAddMode,
}: GameModalEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left Column: Hero & Media */}
      <div className="md:col-span-4 md:border-r md:border-gray-800 md:pr-6">
        <GameEditorHeroPanel form={form} isEditing={!isAddMode} />
      </div>

      {/* Right Column: Tabbed Sections */}
      <div className="space-y-4 md:col-span-8">
        <GameModalTabs activeTab={activeTab} onChangeTab={onChangeTab} />

        <div className="pt-1">
          {activeTab === "details" && (
            <GameEditorDetailsPanel form={form} editGame={editGame} />
          )}

          {activeTab === "focus" && (
            <GameEditorGoalsPanel form={form} moods={moods} />
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <GameEditorScratchpad
                personalNote={form.personalNote}
                onChange={form.setPersonalNote}
              />

              {editGame ? (
                <div className="pt-2">
                  <h4 className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Activity & Milestones
                  </h4>
                  <GameLogTimeline gameId={editGame.id} />
                </div>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 text-center text-xs text-gray-500">
                  Activity milestones and diary entries will begin recording
                  here once this game is saved.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
