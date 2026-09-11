"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/game";
import { Button, Modal } from "@/src/lib/frontend/shared";
import { useRandomPick, type Pool } from "../hooks/useRandomPick";
import { GameCarousel } from "./RandomPicker.Carousel";
import { RandomPickResult } from "./RandomPickResult";

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

export function RandomPicker({
  isOpen,
  onClose,
  moods,
  defaultPool = "backlog",
}: RandomPickerProps) {
  const [selectedPool, setSelectedPool] = useState<Pool>(defaultPool);

  useEffect(() => {
    if (isOpen) setSelectedPool(defaultPool);
  }, [isOpen]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>("idle");

  const { candidates, pickedGame, noGamesMsg, pick, reset } =
    useRandomPick(selectedPool);

  useEffect(() => {
    if (noGamesMsg) setSpinPhase("idle");
  }, [noGamesMsg]);

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

  const handleClose = () => {
    reset();
    setSelectedMoods([]);
    setSelectedPool(defaultPool);
    setSpinPhase("idle");
    onClose();
  };

  const isSpinning = spinPhase === "spinning";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🎲 Pick a Game"
      maxWidth="max-w-sm"
    >
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

        <Button
          variant="brand-gradient"
          fullWidth
          size="lg"
          onClick={handlePick}
          disabled={isSpinning}
          className="rounded-xl disabled:opacity-60"
        >
          Pick For Me
        </Button>

        {noGamesMsg && (
          <p className="py-2 text-center text-sm text-gray-500">{noGamesMsg}</p>
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
              <RandomPickResult game={pickedGame} onPickAgain={handlePick} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
