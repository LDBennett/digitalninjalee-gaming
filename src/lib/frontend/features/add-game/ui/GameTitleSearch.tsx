"use client";

import { RawgResult } from "@/src/lib/frontend/features/add-game/types";

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
      <label className="block mb-1 font-medium text-gray-400 text-xs">
        Title *
        {!isEditing && (
          <span className="ml-1 text-gray-600">
            — search to auto-fill cover art
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTimeout(() => onDropdownChange(false), 150)}
          onFocus={() => results.length > 0 && onDropdownChange(true)}
          placeholder="Game title..."
          required
          className="bg-gray-800 px-3 py-2 pr-8 border border-gray-700 focus:border-brand-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-600"
        />
        {searchLoading && (
          <span className="top-1/2 right-3 absolute text-gray-500 text-xs -translate-y-1/2">
            …
          </span>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="z-10 absolute bg-gray-800 shadow-xl mt-1 border border-gray-700 rounded-lg w-full overflow-hidden">
          {results.map((game) => (
            <li key={game.id}>
              <button
                type="button"
                onMouseDown={() => onSelect(game)}
                className="flex items-center gap-3 hover:bg-gray-700 px-3 py-2 w-full text-left transition-colors"
              >
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt=""
                    className="rounded w-10 h-10 object-cover shrink-0"
                  />
                ) : (
                  <div className="bg-gray-700 rounded w-10 h-10 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {game.name}
                  </p>
                  {game.released && (
                    <p className="text-gray-500 text-xs">
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
