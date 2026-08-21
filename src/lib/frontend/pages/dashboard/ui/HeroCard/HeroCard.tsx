"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookText } from "lucide-react";
import {
  GameStatusBadge,
  MoodBadge,
  PlatformIcon,
  PlayGoals,
  RatingStars,
} from "@/src/lib/frontend/entities/game";
import { Button, EmptyState } from "@/src/lib/frontend/shared";
import type { useDashboard } from "../../useDashboard";
import { HeroCardControls } from "./HeroCard.Controls";
import { HeroCardNotesOverlay } from "./HeroCard.NotesOverlay";

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

  const goTo = (i: number) => {
    setDirection(i > idx ? 1 : -1);
    setIdx(i);
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
    <div className="relative h-100 overflow-hidden rounded-2xl border border-gray-800 lg:h-full lg:min-h-90">
      {!game ? (
        <div className="flex h-full items-center justify-center bg-gray-900">
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
                  <PlatformIcon platform={game.platform} className="h-5 w-5" />
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

                {game.play_goals && game.play_goals.length > 0 && (
                  <div className="mb-4">
                    <PlayGoals playGoals={game.play_goals} showLabels />
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

          <HeroCardNotesOverlay
            open={notesOpen}
            note={game.personal_note}
            onClose={() => setNotesOpen(false)}
          />

          <HeroCardControls total={total} idx={idx} onDot={goTo} onGo={go} />
        </>
      )}
    </div>
  );
}
