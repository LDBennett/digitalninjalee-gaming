"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, NotebookText, X } from "lucide-react";
import { GameStatusBadge, PlatformBadge, RatingStars } from "@/src/lib/frontend/entities/game";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { Button, EmptyState } from "@/src/lib/frontend/shared";
import type { useDashboard } from "../useDashboard";

type Props = Pick<ReturnType<typeof useDashboard>, "playingGames">;

export function DashboardHeroCard({ playingGames }: Props) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [notesOpen, setNotesOpen] = useState(false);

  const total = playingGames.length;
  const game = playingGames[Math.min(idx, total - 1)] ?? null;

  const go = (delta: number) => {
    setDirection(delta);
    setIdx((i) => (i + delta + total) % total);
  };

  useEffect(() => {
    if (total <= 1 || notesOpen) return;
    const id = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % total);
    }, 8000);
    return () => clearInterval(id);
  }, [idx, total, notesOpen]);

  // Close notes panel when the carousel moves to a different game
  useEffect(() => {
    setNotesOpen(false);
  }, [idx]);

  const coverImage = game ? (game.background_url || game.cover_art_url) : null;

  return (
    <div className="relative h-full min-h-75 overflow-hidden rounded-2xl border border-gray-800 md:min-h-90">
      {!game ? (
        <div className="flex h-full min-h-75 items-center justify-center bg-gray-900">
          <EmptyState heading="Nothing playing right now" />
        </div>
      ) : (
        <>
          {/* Background layer */}
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={`bg-${idx}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {coverImage ? (
                <>
                  <img
                    src={coverImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full scale-105 object-cover object-top"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0.78) 50%, rgba(3,7,18,0.35) 100%)",
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gray-900" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Content layer */}
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={`content-${idx}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex h-full flex-col justify-between p-6 md:p-8"
            >
              <div>
                <span className="mb-4 inline-block rounded-full border border-gray-700 bg-gray-900/70 px-3 py-1 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                  Currently Playing
                </span>

                <h2 className="mb-3 text-2xl leading-tight font-bold text-white md:text-3xl">
                  {game.title}
                </h2>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={game.platform} />
                  <GameStatusBadge status={game.status} />
                  {game.rating != null && <RatingStars rating={game.rating} />}
                </div>

                {game.moods && game.moods.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {game.moods.map((mood) => (
                      <MoodBadge key={mood.id} mood={mood.name} />
                    ))}
                  </div>
                )}

                {game.game_description && (
                  <p className="line-clamp-3 max-w-sm text-sm leading-relaxed text-gray-300/80">
                    {game.game_description}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Button
                  variant="gray-dark"
                  size="sm"
                  icon={<NotebookText size={14} />}
                  onClick={() => setNotesOpen(true)}
                >
                  View Notes
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Notes overlay */}
          <AnimatePresence>
            {notesOpen && (
              <motion.div
                key="notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-10 flex flex-col bg-gray-950/92 p-6 backdrop-blur-sm md:p-8"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <NotebookText size={15} className="text-gray-400" />
                    Notes
                  </div>
                  <button
                    onClick={() => setNotesOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                    aria-label="Close notes"
                  >
                    <X size={14} />
                  </button>
                </div>

                {game.personal_note ? (
                  <p className="text-sm leading-relaxed text-gray-300">
                    {game.personal_note}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-500">No notes for this game.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Carousel controls */}
          {total > 1 && (
            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {playingGames.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i); }}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-gray-600 hover:bg-gray-400"}`}
                    aria-label={`Go to game ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => go(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800/80 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Previous game"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => go(1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800/80 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                aria-label="Next game"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
