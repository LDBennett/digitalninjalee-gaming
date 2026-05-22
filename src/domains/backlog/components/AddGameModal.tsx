"use client";

import { useState, useEffect } from "react";
import {
  GameDto,
  GameStatus,
  Platform,
  PLATFORMS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  LIBRARY_STATUSES,
  WISHLIST_STATUSES,
} from "@/src/domains/backlog/models/game.types";
import { MoodDto } from "@/src/domains/backlog/models/mood.types";
import { MoodBadge } from "@/src/domains/backlog/components/MoodBadge";

export interface AddGamePayload {
  title: string;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  cover_url: string | null;
  external_id: string | null;
  mood_ids: string[];
}

interface RawgResult {
  id: number;
  name: string;
  coverUrl: string | null;
  released: string | null;
}

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddGamePayload) => void | Promise<void>;
  editGame?: GameDto | null;
  moods: MoodDto[];
  defaultStatus?: GameStatus;
}

export function AddGameModal({
  isOpen,
  onClose,
  onSave,
  editGame,
  moods,
  defaultStatus = "backlog",
}: AddGameModalProps) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [status, setStatus] = useState<GameStatus>(defaultStatus);
  const [priorityScore, setPriorityScore] = useState(50);
  const [coverUrl, setCoverUrl] = useState("");
  const [externalId, setExternalId] = useState<string | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [rawgResults, setRawgResults] = useState<RawgResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editGame) {
      setTitle(editGame.title);
      setPlatform(editGame.platform);
      setStatus(editGame.status);
      setPriorityScore(editGame.priority_score);
      setCoverUrl(editGame.cover_url ?? "");
      setExternalId(editGame.external_id ?? null);
      setSelectedMoods(editGame.moods?.map((m) => m.id) ?? []);
    } else {
      setTitle("");
      setPlatform("pc");
      setStatus(defaultStatus);
      setPriorityScore(50);
      setCoverUrl("");
      setExternalId(null);
      setSelectedMoods([]);
    }
    setRawgResults([]);
    setShowDropdown(false);
  }, [editGame, isOpen, defaultStatus]);

  useEffect(() => {
    if (editGame || title.trim().length < 2) {
      setRawgResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/rawg?q=${encodeURIComponent(title.trim())}`,
        );
        const data = await res.json();
        setRawgResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, editGame]);

  const handleRawgSelect = (game: RawgResult) => {
    setTitle(game.name);
    setCoverUrl(game.coverUrl ?? "");
    setExternalId(String(game.id));
    setRawgResults([]);
    setShowDropdown(false);
  };

  const toggleMood = (id: string) =>
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      platform,
      status,
      priority_score: priorityScore,
      cover_url: coverUrl.trim() || null,
      external_id: externalId,
      mood_ids: selectedMoods,
    });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 shadow-2xl border border-gray-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="relative">
            <label className="block mb-1 font-medium text-gray-400 text-xs">
              Title *
              {!editGame && (
                <span className="ml-1 text-gray-600">
                  — search to auto-fill cover art
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setExternalId(null);
                  setCoverUrl("");
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onFocus={() => rawgResults.length > 0 && setShowDropdown(true)}
                placeholder="Game title..."
                required
                className="bg-gray-800 px-3 py-2 pr-8 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-600"
              />
              {searchLoading && (
                <span className="top-1/2 right-3 absolute text-gray-500 text-xs -translate-y-1/2">
                  …
                </span>
              )}
            </div>

            {showDropdown && rawgResults.length > 0 && (
              <ul className="z-10 absolute bg-gray-800 shadow-xl mt-1 border border-gray-700 rounded-lg w-full overflow-hidden">
                {rawgResults.map((game) => (
                  <li key={game.id}>
                    <button
                      type="button"
                      onMouseDown={() => handleRawgSelect(game)}
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

          {!editGame && coverUrl && (
            <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg">
              <img
                src={coverUrl}
                alt=""
                className="rounded w-10 h-10 object-cover shrink-0"
              />
              <p className="flex-1 text-gray-400 text-xs truncate">
                Cover art loaded from RAWG
              </p>
              <button
                type="button"
                onClick={() => {
                  setCoverUrl("");
                  setExternalId(null);
                }}
                className="text-gray-600 hover:text-red-400 text-xs transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          <div className="gap-3 grid grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-400 text-xs">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm"
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
                value={status}
                onChange={(e) => setStatus(e.target.value as GameStatus)}
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm"
              >
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
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-400 text-xs">
              Priority:{" "}
              <span className="font-semibold text-purple-400">
                {priorityScore}
              </span>
              <span className="ml-2 text-gray-600">
                (1 = lowest · 100 = highest)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={priorityScore}
              onChange={(e) => setPriorityScore(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between mt-0.5 text-gray-700 text-xs">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {editGame && (
            <div>
              <label className="block mb-1 font-medium text-gray-400 text-xs">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="bg-gray-800 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm placeholder-gray-600"
              />
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium text-gray-400 text-xs">
              Mood Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => toggleMood(mood.id)}
                  className={`transition-all duration-150 ${
                    selectedMoods.includes(mood.id)
                      ? "ring-2 ring-white/40 scale-105"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <MoodBadge mood={mood.name} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg font-medium text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 py-2 rounded-lg font-medium text-white text-sm transition-colors disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : editGame ? "Update" : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
