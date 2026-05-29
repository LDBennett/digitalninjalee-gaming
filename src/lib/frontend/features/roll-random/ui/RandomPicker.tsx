"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GameDto, MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { useAuthFetch } from "@/src/lib/frontend/shared/auth/useAuthFetch";
import { RandomPickResult } from "./RandomPickResult";

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
  const { authHeaders } = useAuthFetch();
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
      const res = await fetch(`/api/games/random?${params}`, {
        headers: authHeaders(),
      });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 p-5">
          <h2 className="text-base font-semibold text-white">🎲 Pick a Game</h2>
          <button
            onClick={handleClose}
            className="text-2xl leading-none text-gray-400 transition-colors hover:text-white"
          >
            &times;
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Pick from
            </p>
            <div className="flex gap-2">
              {POOLS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => selectPool(value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
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
            <p className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Filter by mood (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => toggleMood(mood.name)}
                  className={`transition-all duration-150 ${
                    selectedMoods.includes(mood.name)
                      ? "scale-105 ring-2 ring-white/40"
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
            className="from-brand-700 hover:from-brand-600 to-brand-700 hover:to-brand-600 w-full rounded-xl bg-linear-to-r py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">🎲</span> Picking…
              </span>
            ) : (
              "Pick For Me"
            )}
          </button>

          {noGamesMsg && (
            <p className="py-2 text-center text-sm text-gray-500">
              {noGamesMsg}
            </p>
          )}

          {pickedGame && (
            <RandomPickResult game={pickedGame} onPickAgain={pick} />
          )}
        </div>
      </div>
    </div>
  );
}
