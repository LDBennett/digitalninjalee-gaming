"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { GameDto, MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { useAuthFetch } from "@/src/lib/frontend/shared/auth/useAuthFetch";
import { GameCarousel } from "./GameCarousel";
import { RandomPickResult } from "./RandomPickResult";

type Pool = "backlog" | "playing";
type SpinPhase = "idle" | "spinning" | "done";

const POOLS: { value: Pool; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "playing", label: "Currently Playing" },
];

interface RandomPickerProps {
  isOpen: boolean;
  onClose: () => void;
  moods: MoodDto[];
  defaultPool?: Pool;
}

export function RandomPicker({ isOpen, onClose, moods, defaultPool = "backlog" }: RandomPickerProps) {
  const { authHeaders } = useAuthFetch();
  const [selectedPool, setSelectedPool] = useState<Pool>(defaultPool);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [pickedGame, setPickedGame] = useState<GameDto | null>(null);
  const [candidates, setCandidates] = useState<GameDto[]>([]);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>("idle");
  const [noGamesMsg, setNoGamesMsg] = useState("");

  const { mutate: executePick } = useMutation({
    mutationFn: async (moodNames: string[]) => {
      const status =
        selectedPool === "playing" ? "playing,ongoing" : selectedPool;
      const params = new URLSearchParams({ status });
      if (moodNames.length) params.set("moods", moodNames.join(","));
      const res = await fetch(`/api/games/random?${params}`, {
        headers: authHeaders(),
      });
      return res.json() as Promise<{ game?: GameDto; message?: string }>;
    },
    onSuccess: (data) => {
      if (data.game) {
        setPickedGame(data.game);
      } else {
        setSpinPhase("idle");
        setNoGamesMsg(data.message ?? "No games found");
      }
    },
  });

  const fetchCandidates = async (moodNames: string[]) => {
    const status =
      selectedPool === "playing" ? "playing,ongoing" : selectedPool;
    const params = new URLSearchParams({ status });
    const res = await fetch(`/api/games?${params}`, { headers: authHeaders() });
    const data: GameDto[] = await res.json();

    let pool = data;
    if (moodNames.length > 0) {
      const filtered = data.filter((g) =>
        g.moods?.some((m) => moodNames.includes(m.name)),
      );
      if (filtered.length > 0) pool = filtered;
    }
    setCandidates(pool);
  };

  const pick = () => {
    setPickedGame(null);
    setCandidates([]);
    setNoGamesMsg("");
    setSpinPhase("spinning");
    fetchCandidates(selectedMoods);
    executePick(selectedMoods);
  };

  const selectPool = (pool: Pool) => {
    setSelectedPool(pool);
    setPickedGame(null);
    setCandidates([]);
    setNoGamesMsg("");
    setSelectedMoods([]);
    setSpinPhase("idle");
  };

  const toggleMood = (name: string) => {
    setSelectedMoods((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
    setPickedGame(null);
    setCandidates([]);
    setNoGamesMsg("");
    setSpinPhase("idle");
  };

  const handleClose = () => {
    setPickedGame(null);
    setCandidates([]);
    setSelectedMoods([]);
    setNoGamesMsg("");
    setSelectedPool(defaultPool);
    setSpinPhase("idle");
    onClose();
  };

  if (!isOpen) return null;

  const isSpinning = spinPhase === "spinning";

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
                  disabled={isSpinning}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 disabled:pointer-events-none ${
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
                  disabled={isSpinning}
                  className={`transition-all duration-150 disabled:pointer-events-none ${
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
            disabled={isSpinning}
            className="from-brand-700 hover:from-brand-600 to-brand-700 hover:to-brand-600 w-full rounded-xl bg-linear-to-r py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-60"
          >
            Pick For Me
          </button>

          {noGamesMsg && (
            <p className="py-2 text-center text-sm text-gray-500">
              {noGamesMsg}
            </p>
          )}

          <AnimatePresence mode="wait">
            {spinPhase === "spinning" && candidates.length > 0 && (
              <motion.div
                key="carousel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <GameCarousel
                  candidates={candidates}
                  finalist={pickedGame}
                  onLanded={() => setSpinPhase("done")}
                />
              </motion.div>
            )}

            {spinPhase === "done" && pickedGame && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <RandomPickResult game={pickedGame} onPickAgain={pick} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
