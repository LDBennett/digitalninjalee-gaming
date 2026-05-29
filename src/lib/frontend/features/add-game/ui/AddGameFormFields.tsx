"use client";

import {
  GameDto,
  GameStatus,
  Platform,
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
import { StarRating } from "@/src/lib/frontend/shared/ui/StarRating";
import { MoodSelector } from "@/src/lib/frontend/features/mood-selector";
import { EditMediaFields } from "./EditMediaFields";

interface AddGameFormFieldsProps {
  editGame?: GameDto | null;
  moods: MoodDto[];
  platform: Platform;
  status: GameStatus;
  replayStatus: ReplayStatus;
  priorityScore: number;
  backgroundUrl: string;
  coverArtUrl: string;
  gameDescription: string;
  personalNote: string;
  rating: number | null;
  selectedMoods: string[];
  setPlatform: (v: Platform) => void;
  setStatus: (v: GameStatus) => void;
  setReplayStatus: (v: ReplayStatus) => void;
  setPriorityScore: (v: number) => void;
  setBackgroundUrl: (v: string) => void;
  setCoverArtUrl: (v: string) => void;
  setGameDescription: (v: string) => void;
  setPersonalNote: (v: string) => void;
  setRating: (v: number | null) => void;
  toggleMood: (id: string) => void;
}

export function AddGameFormFields({
  editGame,
  moods,
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
}: AddGameFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as GameStatus)}
            className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
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

      {(LIBRARY_STATUSES as ReadonlyArray<string>).includes(status) && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            Replay Status
          </label>
          <select
            value={replayStatus ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setReplayStatus(val === "" ? null : (val as ReplayStatus));
            }}
            className="focus:border-brand-600 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">None</option>
            <option value="want-to-replay">Want to Replay</option>
            <option value="replaying">Replaying</option>
          </select>
        </div>
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
        <EditMediaFields
          backgroundUrl={backgroundUrl}
          coverArtUrl={coverArtUrl}
          gameDescription={gameDescription}
          onBackgroundUrlChange={setBackgroundUrl}
          onCoverArtUrlChange={setCoverArtUrl}
          onDescriptionChange={setGameDescription}
        />
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
