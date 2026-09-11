"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices } from "lucide-react";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { QuickGuideRollMoods } from "./QuickGuide.Roll.Moods";
import {
  GameCarousel,
  RandomPickResult,
  useRandomPick,
  type Pool,
} from "@/src/lib/frontend/features/roll-random";
import { Button, useGameModalStore } from "@/src/lib/frontend/shared";

interface QuickGuideRollProps {
  moods: MoodDto[];
  onCloseGuide: () => void;
}

type SpinPhase = "idle" | "spinning" | "done";

const POOLS: { value: Pool; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "playing", label: "Playing" },
];

export function QuickGuideRoll({ moods, onCloseGuide }: QuickGuideRollProps) {
  const [selectedPool, setSelectedPool] = useState<Pool>("backlog");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>("idle");
  const { openEdit } = useGameModalStore();

  const { candidates, pickedGame, noGamesMsg, pick, reset } =
    useRandomPick(selectedPool);

  const isSpinning = spinPhase === "spinning";

  const handlePick = () => {
    setSpinPhase("spinning");
    pick(selectedMoods);
  };

  const selectPool = (pool: Pool) => {
    setSelectedPool(pool);
    reset();
    setSelectedMoods([]);
    setSpinPhase("idle");
  };

  const toggleMood = (name: string) => {
    setSelectedMoods((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
    reset();
    setSpinPhase("idle");
  };

  const clearMoods = () => {
    setSelectedMoods([]);
    reset();
    setSpinPhase("idle");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-gray-800/80 bg-gray-950/60 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Dices size={15} className="text-brand-400" />
          <span className="text-[11px] font-bold tracking-wider text-gray-300 uppercase">
            Quick Roll
          </span>
        </div>

        {/* Pool switcher */}
        <div className="flex rounded-lg border border-gray-800 bg-gray-900 p-0.5">
          {POOLS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => selectPool(value)}
              disabled={isSpinning}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:pointer-events-none ${
                selectedPool === value
                  ? "bg-brand-800/70 text-brand-300 shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood filter chips */}
      <QuickGuideRollMoods
        moods={moods}
        selectedMoods={selectedMoods}
        onToggleMood={toggleMood}
        onClearMoods={clearMoods}
        disabled={isSpinning}
      />

      {/* Roll Button */}
      <Button
        variant="brand-gradient"
        size="sm"
        fullWidth
        onClick={handlePick}
        disabled={isSpinning}
        className="rounded-xl py-2 text-xs font-bold tracking-wide uppercase disabled:opacity-50"
      >
        {isSpinning ? "Spinning..." : "Roll Game"}
      </Button>

      {noGamesMsg && (
        <p className="py-1 text-center text-xs text-gray-500">{noGamesMsg}</p>
      )}

      {/* Inline Spin & Result Area */}
      <AnimatePresence mode="wait">
        {spinPhase === "spinning" && candidates.length > 0 && (
          <motion.div
            key="carousel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="space-y-2 pt-1"
          >
            <RandomPickResult game={pickedGame} onPickAgain={handlePick} />
            <Button
              variant="ghost"
              size="xs"
              fullWidth
              onClick={() => {
                onCloseGuide();
                openEdit(pickedGame.id);
              }}
              className="rounded-lg text-[11px] text-gray-400 hover:text-white"
            >
              Open Details →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
