"use client";

import {
  GameDto,
  Platform,
  GameStatus,
  ReplayStatus,
  PLATFORMS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  LIBRARY_STATUSES,
  WISHLIST_STATUSES,
  VALID_TRANSITIONS,
} from "@/src/lib/backend/backlog/domain/models";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import {
  PRIORITY_TIERS,
  scoreToTier,
} from "@/src/lib/backend/backlog/domain/models";
import { StarRating, Select } from "@/src/lib/frontend/shared";
import { MoodSelector } from "@/src/lib/frontend/features/mood-selector";
import { useAddGameForm } from "../hooks/useAddGameForm";
import { EditMediaFields } from "./AddGameFormFields.Media";

interface AddGameFormFieldsProps {
  form: ReturnType<typeof useAddGameForm>;
  editGame?: GameDto | null;
  moods: MoodDto[];
}

export function AddGameFormFields({ form, editGame, moods }: AddGameFormFieldsProps) {
  const {
    platform,
    status,
    replayStatus,
    priorityScore,
    backgroundUrl,
    coverArtUrl,
    gameDescription,
    personalNote,
    rating,
    selectedMoods,
    setPlatform,
    setStatus,
    setReplayStatus,
    setPriorityScore,
    setBackgroundUrl,
    setCoverArtUrl,
    setGameDescription,
    setPersonalNote,
    setRating,
    toggleMood,
  } = form;
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          fullWidth
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as GameStatus)}
          fullWidth
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
        </Select>
      </div>

      {(LIBRARY_STATUSES as ReadonlyArray<string>).includes(status) && (
        <Select
          label="Replay Status"
          value={replayStatus ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setReplayStatus(val === "" ? null : (val as ReplayStatus));
          }}
          fullWidth
        >
          <option value="">None</option>
          <option value="want-to-replay">Want to Replay</option>
          <option value="replaying">Replaying</option>
        </Select>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Priority
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {PRIORITY_TIERS.map((tier) => {
            const isSelected = scoreToTier(priorityScore).id === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPriorityScore(tier.score)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? `${tier.pillBg} ${tier.pillText} ring-1 ring-current ring-inset`
                    : "bg-gray-800 text-gray-500 hover:text-white"
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {editGame && (
        <EditMediaFields form={form} />
      )}

      <MoodSelector
        moods={moods}
        selectedIds={selectedMoods}
        onToggle={toggleMood}
      />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Your Rating
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Personal Note
        </label>
        <textarea
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          placeholder="Where you left off, why you dropped it..."
          rows={2}
          className="focus:border-brand-600 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
        />
      </div>
    </>
  );
}
