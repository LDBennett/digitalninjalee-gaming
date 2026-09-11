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
import { Select } from "@/src/lib/frontend/shared";
import { useAddGameForm } from "../hooks/useAddGameForm";

interface GameEditorDetailsPanelProps {
  form: ReturnType<typeof useAddGameForm>;
  editGame?: GameDto | null;
}

export function GameEditorDetailsPanel({
  form,
  editGame,
}: GameEditorDetailsPanelProps) {
  const {
    platform,
    setPlatform,
    status,
    setStatus,
    replayStatus,
    setReplayStatus,
    gameDescription,
    setGameDescription,
  } = form;

  const isLibrary = (LIBRARY_STATUSES as ReadonlyArray<string>).includes(
    status,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      {isLibrary && (
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
        <label className="mb-1 block text-xs font-medium text-gray-400">
          Description
        </label>
        <textarea
          value={gameDescription}
          onChange={(e) => setGameDescription(e.target.value)}
          placeholder="Game overview or summary..."
          rows={7}
          className="focus:border-brand-600 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
