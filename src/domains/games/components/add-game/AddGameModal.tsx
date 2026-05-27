"use client";

import {
  GameDto,
  GameStatus,
  Platform,
  PLATFORMS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  LIBRARY_STATUSES,
  WISHLIST_STATUSES,
  VALID_TRANSITIONS,
  ReplayStatus,
} from "@/src/domains/games/models/game.types";
import { MoodDto } from "@/src/domains/games/models/mood.types";
import { Trash2 } from "lucide-react";
import { useAddGameForm } from "@/src/domains/games/hooks/useAddGameForm";
import { GameTitleSearch } from "@/src/domains/games/components/add-game/GameTitleSearch";
import { SelectedGamePreview } from "@/src/domains/games/components/add-game/SelectedGamePreview";
import { MoodSelector } from "@/src/domains/games/components/mood/MoodSelector";
import { EditMediaFields } from "@/src/domains/games/components/add-game/EditMediaFields";

export interface AddGamePayload {
  title: string;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  cover_url: string | null;
  cover_art_url: string | null;
  game_description: string | null;
  external_id: string | null;
  mood_ids: string[];
  replay_status: ReplayStatus;
}

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
  const form = useAddGameForm({
    editGame,
    isOpen,
    defaultStatus,
    onSave,
    onClose,
  });

  if (!isOpen) return null;

  const coverImage =
    form.coverArtUrl ||
    form.coverUrl ||
    editGame?.cover_art_url ||
    editGame?.cover_url;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-gray-900 shadow-2xl border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {coverImage && (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                filter: "blur(6px)",
                opacity: 0.6,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(17,24,39,0.35) 0%, rgba(17,24,39,0.88) 55%, rgba(17,24,39,0.96) 100%)",
              }}
            />
          </>
        )}

        <div className="relative max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-5 border-gray-800 border-b">
            <h2 className="font-semibold text-white text-base">
              {editGame ? "Edit Game" : "Add Game"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
            >
              &times;
            </button>
          </div>

          <form onSubmit={form.handleSubmit} className="space-y-4 p-5">
            <GameTitleSearch
              value={form.title}
              onChange={(val) => {
                form.setTitle(val);
                form.setExternalId(null);
                form.setCoverUrl("");
              }}
              onSelect={form.handleRawgSelect}
              results={form.rawgResults}
              showDropdown={form.showDropdown}
              onDropdownChange={form.setShowDropdown}
              searchLoading={form.searchLoading}
              isEditing={!!editGame}
            />

            {!editGame && form.coverUrl && (
              <SelectedGamePreview
                coverUrl={form.coverUrl}
                coverArtUrl={form.coverArtUrl}
                igdbLoading={form.igdbLoading}
                igdbLoaded={form.igdbLoaded}
                onClear={form.clearCoverArt}
              />
            )}

            <div className="gap-3 grid grid-cols-2">
              <div>
                <label className="block mb-1 font-medium text-gray-400 text-xs">
                  Platform
                </label>
                <select
                  value={form.platform}
                  onChange={(e) => form.setPlatform(e.target.value as Platform)}
                  className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-400 text-xs">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => form.setStatus(e.target.value as GameStatus)}
                  className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
                >
                  {editGame ? (
                    <>
                      <option value={editGame.status}>
                        {STATUS_LABELS[editGame.status]}
                      </option>
                      {VALID_TRANSITIONS[editGame.status].map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <optgroup label="Library (Owned)">
                        {LIBRARY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Wishlist (Not Purchased)">
                        {WISHLIST_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
            </div>
            {(LIBRARY_STATUSES as ReadonlyArray<string>).includes(
              form.status,
            ) && (
              <div>
                <label className="block mb-1 font-medium text-gray-400 text-xs">
                  Replay Status
                </label>
                <select
                  value={form.replayStatus ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    form.setReplayStatus(
                      val === "" ? null : (val as ReplayStatus),
                    );
                  }}
                  className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
                >
                  <option value="">None</option>
                  <option value="want-to-replay">Want to Replay</option>
                  <option value="replaying">Replaying</option>
                </select>
              </div>
            )}
            <div>
              <label className="block mb-1 font-medium text-gray-400 text-xs">
                Priority:{" "}
                <span className="font-semibold text-brand-400">
                  {form.priorityScore}
                </span>
                <span className="ml-2 text-gray-600">
                  (1 = lowest · 100 = highest)
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={form.priorityScore}
                onChange={(e) => form.setPriorityScore(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between mt-0.5 text-gray-700 text-xs">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {editGame && (
              <EditMediaFields
                coverUrl={form.coverUrl}
                coverArtUrl={form.coverArtUrl}
                gameDescription={form.gameDescription}
                onCoverUrlChange={form.setCoverUrl}
                onCoverArtUrlChange={form.setCoverArtUrl}
                onDescriptionChange={form.setGameDescription}
              />
            )}

            <MoodSelector
              moods={moods}
              selectedIds={form.selectedMoods}
              onToggle={form.toggleMood}
            />

            <div className="flex justify-between gap-3 pt-1">
              {editGame && onDelete && (
                <button
                  type="button"
                  onClick={async () => {
                    await onDelete(editGame.id);
                    onClose();
                  }}
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
