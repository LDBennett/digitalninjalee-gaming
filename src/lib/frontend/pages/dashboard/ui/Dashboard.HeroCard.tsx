"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, StarHalf } from "lucide-react";
import { GameStatusBadge, PlatformBadge } from "@/src/lib/frontend/entities/game";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { EmptyState, GatedElement, Button } from "@/src/lib/frontend/shared";
import type { useDashboard } from "../useDashboard";

type Props = Pick<
  ReturnType<typeof useDashboard>,
  "playingGames" | "handleStatusChange" | "isAuthenticated"
> & { onSignIn: () => void };

function InlineRatingStars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return filled ? (
          <Star key={star} size={12} className="text-yellow-400" fill="currentColor" strokeWidth={1} />
        ) : half ? (
          <StarHalf key={star} size={12} className="text-yellow-400" fill="currentColor" strokeWidth={1} />
        ) : (
          <Star key={star} size={12} className="text-gray-700" strokeWidth={1} />
        );
      })}
      <span className="ml-1 text-[11px] font-medium text-yellow-400/80">{rating}</span>
    </div>
  );
}

export function DashboardHeroCard({ playingGames, handleStatusChange, isAuthenticated, onSignIn }: Props) {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = playingGames.length;
  const game = playingGames[Math.min(idx, total - 1)] ?? null;

  const go = (delta: number) => {
    setDirection(delta);
    setIdx((i) => (i + delta + total) % total);
  };

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % total);
    }, 8000);
    return () => clearInterval(id);
  }, [idx, total]);

  const coverImage = game ? (game.background_url || game.cover_art_url) : null;

  return (
    <div className="relative h-full min-h-75 overflow-hidden rounded-2xl border border-gray-800 md:min-h-90">
      {!game ? (
        <div className="flex h-full min-h-75 items-center justify-center bg-gray-900">
          <EmptyState heading="Nothing playing right now" />
        </div>
      ) : (
        <>
          {/* Background layer — animates with game */}
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
                  <div
                    className="absolute inset-0 scale-105"
                    style={{
                      backgroundImage: `url(${coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                    }}
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

          {/* Content layer — slides with direction */}
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
                  {game.rating != null && <InlineRatingStars rating={game.rating} />}
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
                <GatedElement isAuthenticated={isAuthenticated} onSignIn={onSignIn}>
                  <Button
                    variant="gray-dark"
                    size="sm"
                    onClick={() => handleStatusChange(game.id, "completed")}
                  >
                    Mark as Completed
                  </Button>
                </GatedElement>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel controls — only when multiple games */}
          {total > 1 && (
            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              {/* Dot indicators */}
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
              {/* Prev / Next */}
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
