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
import { PRIORITY_TIERS, scoreToTier } from "@/src/lib/backend/backlog/domain/models";
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
      <div className="gap-3 grid grid-cols-2">
        <div>
          <label className="block mb-1 font-medium text-gray-400 text-xs">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-400 text-xs">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as GameStatus)}
            className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm"
          >
            {editGame ? (
              <>
                <option value={editGame.status}>{STATUS_LABELS[editGame.status]}</option>
                {VALID_TRANSITIONS[editGame.status].map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </>
            ) : (
              <>
                <optgroup label="Library (Owned)">
                  {LIBRARY_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </optgroup>
                <optgroup label="Wishlist (Not Purchased)">
                  {WISHLIST_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </optgroup>
              </>
            )}
          </select>
        </div>
      </div>

      {(LIBRARY_STATUSES as ReadonlyArray<string>).includes(status) && (
        <div>
          <label className="block mb-1 font-medium text-gray-400 text-xs">Replay Status</label>
          <select
            value={replayStatus ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setReplayStatus(val === "" ? null : (val as ReplayStatus));
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
        <label className="block mb-1.5 font-medium text-gray-400 text-xs">Priority</label>
        <div className="gap-1.5 grid grid-cols-4">
          {PRIORITY_TIERS.map((tier) => {
            const isSelected = scoreToTier(priorityScore).id === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPriorityScore(tier.score)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? `${tier.pillBg} ${tier.pillText} ring-1 ring-inset ring-current`
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

      <MoodSelector moods={moods} selectedIds={selectedMoods} onToggle={toggleMood} />

      <div>
        <label className="block mb-1.5 font-medium text-gray-400 text-xs">Your Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-400 text-xs">Personal Note</label>
        <textarea
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          placeholder="Where you left off, why you dropped it..."
          rows={2}
          className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm resize-none placeholder-gray-600"
        />
      </div>
    </>
  );
}
