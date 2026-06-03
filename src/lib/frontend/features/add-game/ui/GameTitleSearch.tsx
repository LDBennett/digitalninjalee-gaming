"use client";

import { RawgResult } from "@/src/lib/frontend/features/add-game/types";
import { Input } from "@/src/lib/frontend/shared";

interface GameTitleSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (game: RawgResult) => void;
  results: RawgResult[];
  showDropdown: boolean;
  onDropdownChange: (show: boolean) => void;
  searchLoading: boolean;
  isEditing: boolean;
}

export function GameTitleSearch({
  value,
  onChange,
  onSelect,
  results,
  showDropdown,
  onDropdownChange,
  searchLoading,
  isEditing,
}: GameTitleSearchProps) {
  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-gray-400">
        Title *
        {!isEditing && (
          <span className="ml-1 text-gray-600">
            — search to auto-fill cover art
          </span>
        )}
      </label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTimeout(() => onDropdownChange(false), 150)}
          onFocus={() => results.length > 0 && onDropdownChange(true)}
          placeholder="Game title..."
          required
          fullWidth
          className="pr-8 placeholder-gray-600"
        />
        {searchLoading && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-500">
            …
          </span>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          {results.map((game) => (
            <li key={game.id}>
              <button
                type="button"
                onMouseDown={() => onSelect(game)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-700"
              >
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded bg-gray-700" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {game.name}
                  </p>
                  {game.released && (
                    <p className="text-xs text-gray-500">
                      {game.released.slice(0, 4)}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
