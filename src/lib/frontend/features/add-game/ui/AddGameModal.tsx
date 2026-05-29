"use client";

import { Trash2 } from "lucide-react";
import { GameDto, GameStatus, MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { AddGamePayload } from "@/src/lib/frontend/features/add-game/types";
import { useAddGameForm } from "@/src/lib/frontend/features/add-game/hooks/useAddGameForm";
import { GameTitleSearch } from "./GameTitleSearch";
import { SelectedGamePreview } from "./SelectedGamePreview";
import { AddGameFormFields } from "./AddGameFormFields";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddGamePayload) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  editGame?: GameDto | null;
  moods: MoodDto[];
  defaultStatus?: GameStatus;
}

export function AddGameModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editGame,
  moods,
  defaultStatus = "backlog",
}: AddGameModalProps) {
  const form = useAddGameForm({ editGame, isOpen, defaultStatus, onSave, onClose });

  if (!isOpen) return null;

  const coverImage = form.backgroundUrl || form.coverArtUrl || editGame?.background_url || editGame?.cover_art_url;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-gray-900 shadow-2xl border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {coverImage && (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{ backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center top", filter: "blur(6px)", opacity: 0.6 }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(17,24,39,0.35) 0%, rgba(17,24,39,0.88) 55%, rgba(17,24,39,0.96) 100%)" }}
            />
          </>
        )}

        <div className="relative max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-5 border-gray-800 border-b">
            <h2 className="font-semibold text-white text-base">
              {editGame ? "Edit Game" : "Add Game"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none transition-colors">&times;</button>
          </div>

          <form onSubmit={form.handleSubmit} className="space-y-4 p-5">
            <GameTitleSearch
              value={form.title}
              onChange={(val) => { form.setTitle(val); form.setRawgId(null); form.setBackgroundUrl(""); }}
              onSelect={form.handleRawgSelect}
              results={form.rawgResults}
              showDropdown={form.showDropdown}
              onDropdownChange={form.setShowDropdown}
              searchLoading={form.searchLoading}
              isEditing={!!editGame}
            />

            {!editGame && form.backgroundUrl && (
              <SelectedGamePreview
                backgroundUrl={form.backgroundUrl}
                coverArtUrl={form.coverArtUrl}
                igdbLoading={form.igdbLoading}
                igdbLoaded={form.igdbLoaded}
                onClear={form.clearCoverArt}
              />
            )}

            <AddGameFormFields
              editGame={editGame}
              moods={moods}
              platform={form.platform}
              status={form.status}
              replayStatus={form.replayStatus}
              priorityScore={form.priorityScore}
              backgroundUrl={form.backgroundUrl}
              coverArtUrl={form.coverArtUrl}
              gameDescription={form.gameDescription}
              personalNote={form.personalNote}
              rating={form.rating}
              selectedMoods={form.selectedMoods}
              setPlatform={form.setPlatform}
              setStatus={form.setStatus}
              setReplayStatus={form.setReplayStatus}
              setPriorityScore={form.setPriorityScore}
              setBackgroundUrl={form.setBackgroundUrl}
              setCoverArtUrl={form.setCoverArtUrl}
              setGameDescription={form.setGameDescription}
              setPersonalNote={form.setPersonalNote}
              setRating={form.setRating}
              toggleMood={form.toggleMood}
            />

            <div className="flex justify-between gap-3 pt-1">
              {editGame && onDelete && (
                <button
                  type="button"
                  onClick={async () => { await onDelete(editGame.id); onClose(); }}
                  className="flex items-center gap-1 bg-red-400 hover:bg-red-900/40 px-3 py-2 border border-gray-700 hover:border-red-800 rounded-lg font-medium text-white hover:text-red-400 text-sm transition-colors"
                >
                  <Trash2 /> Delete
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {!editGame && (
                  <button
                    type="button"
                    onClick={form.handleSubmitAndAdd}
                    disabled={form.saving || !form.title.trim()}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors disabled:cursor-not-allowed"
                  >
                    {form.saving ? "Saving…" : "Save & Add Another"}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={form.saving || !form.title.trim()}
                  className="bg-brand-700 hover:bg-brand-600 disabled:opacity-50 px-5 py-2 rounded-lg font-medium text-white text-sm transition-colors disabled:cursor-not-allowed"
                >
                  {form.saving ? "Saving…" : editGame ? "Update" : "Add Game"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
