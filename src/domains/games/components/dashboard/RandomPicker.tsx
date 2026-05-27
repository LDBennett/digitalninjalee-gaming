"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GameDto } from "@/src/domains/games/models/game.types";
import { MoodDto } from "@/src/domains/games/models/mood.types";
import { MoodBadge } from "@/src/domains/games/components/mood/MoodBadge";
import { PlatformBadge } from "@/src/domains/games/components/card/PlatformBadge";

type Pool = "backlog" | "playing";

const POOLS: { value: Pool; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "playing", label: "Currently Playing" },
];

interface RandomPickerProps {
  isOpen: boolean;
  onClose: () => void;
  moods: MoodDto[];
}

export function RandomPicker({ isOpen, onClose, moods }: RandomPickerProps) {
  const [selectedPool, setSelectedPool] = useState<Pool>("backlog");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [pickedGame, setPickedGame] = useState<GameDto | null>(null);
  const [noGamesMsg, setNoGamesMsg] = useState("");

  const { mutate: executePick, isPending: loading } = useMutation({
    mutationFn: async (moods: string[]) => {
      const status =
        selectedPool === "playing" ? "playing,ongoing" : selectedPool;
      const params = new URLSearchParams({ status });
      if (moods.length) params.set("moods", moods.join(","));
      await new Promise((r) => setTimeout(r, 900));
      const res = await fetch(`/api/games/random?${params}`);
      return res.json() as Promise<{ game?: GameDto; message?: string }>;
    },
    onSuccess: (data) => {
      if (data.game) setPickedGame(data.game);
      else setNoGamesMsg(data.message ?? "No games found");
    },
  });

  const selectPool = (pool: Pool) => {
    setSelectedPool(pool);
    setPickedGame(null);
    setNoGamesMsg("");
    setSelectedMoods([]);
  };

  const toggleMood = (name: string) => {
    setSelectedMoods((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
    setPickedGame(null);
    setNoGamesMsg("");
  };

  const pick = () => {
    setPickedGame(null);
    setNoGamesMsg("");
    executePick(selectedMoods);
  };

  const handleClose = () => {
    setPickedGame(null);
    setSelectedMoods([]);
    setNoGamesMsg("");
    setSelectedPool("backlog");
    onClose();
  };

  if (!isOpen) return null;

  const gameMoods = pickedGame?.moods ?? [];

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 shadow-2xl border border-gray-700 rounded-2xl w-full max-w-sm">
        <div className="flex justify-between items-center p-5 border-gray-800 border-b">
          <h2 className="font-semibold text-white text-base">🎲 Pick a Game</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
              Pick from
            </p>
            <div className="flex gap-2">
              {POOLS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => selectPool(value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    selectedPool === value
                      ? "bg-brand-700 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
              Filter by mood (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => toggleMood(mood.name)}
                  className={`transition-all duration-150 ${
                    selectedMoods.includes(mood.name)
                      ? "ring-2 ring-white/40 scale-105"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <MoodBadge mood={mood.name} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={pick}
            disabled={loading}
            className="bg-linear-to-r from-brand-700 hover:from-brand-600 to-brand-700 hover:to-brand-600 disabled:opacity-60 shadow-lg py-3 rounded-xl w-full font-semibold text-white text-sm transition-all"
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <span className="inline-block animate-spin">🎲</span> Picking…
              </span>
            ) : (
              "Pick For Me"
            )}
          </button>

          {noGamesMsg && (
            <p className="py-2 text-gray-500 text-sm text-center">
              {noGamesMsg}
            </p>
          )}

          {pickedGame && (
            <div className="space-y-3 bg-gray-800/60 p-4 border border-gray-700 rounded-xl slide-up">
              <div className="flex gap-3">
                <div className="bg-gray-700 rounded-lg w-14 h-20 overflow-hidden shrink-0">
                  {pickedGame.cover_url ? (
                    <img
                      src={pickedGame.cover_url}
                      alt={pickedGame.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex justify-center items-center bg-gradient-to-br from-brand-900 to-brand-900 w-full h-full">
                      <span className="font-bold text-white/30 text-xl">
                        {pickedGame.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 font-medium text-brand-400 text-xs">
                    Let's Play:
                  </p>
                  <h3 className="font-bold text-white leading-snug">
                    {pickedGame.title}
                  </h3>
                  <div className="mt-1.5">
                    <PlatformBadge platform={pickedGame.platform} />
                  </div>
                </div>
              </div>
              {gameMoods.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {gameMoods.map((mood) => (
                    <MoodBadge key={mood.id} mood={mood.name} />
                  ))}
                </div>
              )}
              <button
                onClick={pick}
                className="py-1 w-full text-gray-500 hover:text-white text-xs transition-colors"
              >
                Pick again →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
