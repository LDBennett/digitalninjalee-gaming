"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { PlatformBadge } from "@/src/lib/frontend/entities/game";

interface GameCarouselProps {
  candidates: GameDto[];
  finalist: GameDto | null;
  onLanded: () => void;
}

const DECEL_STEPS = [120, 180, 260, 380];

export function GameCarousel({
  candidates,
  finalist,
  onLanded,
}: GameCarouselProps) {
  const [displayGame, setDisplayGame] = useState<GameDto | null>(
    candidates[0] ?? null,
  );
  const [tickKey, setTickKey] = useState(0);
  const [landed, setLanded] = useState(false);

  const indexRef = useRef(0);
  const frameDurationRef = useRef(80);
  const decelStepRef = useRef(0);
  const finalistRef = useRef<GameDto | null>(null);
  const landedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep finalist ref in sync so the timer closure can see it
  useEffect(() => {
    finalistRef.current = finalist;
  }, [finalist]);

  useEffect(() => {
    if (candidates.length === 0) return;

    // Seed display with first candidate immediately
    setDisplayGame(candidates[0]);
    indexRef.current = 0;

    const tick = () => {
      if (landedRef.current) return;

      const pool = candidates;
      const fin = finalistRef.current;

      if (fin && decelStepRef.current >= DECEL_STEPS.length) {
        // Land on finalist
        landedRef.current = true;
        setLanded(true);
        setDisplayGame(fin);
        setTickKey((k) => k + 1);
        timerRef.current = setTimeout(onLanded, 350);
        return;
      }

      // Advance index
      indexRef.current = (indexRef.current + 1) % pool.length;
      setDisplayGame(pool[indexRef.current]);
      setTickKey((k) => k + 1);

      // Decelerate once finalist is known
      if (fin) {
        const step = DECEL_STEPS[decelStepRef.current];
        if (step !== undefined) {
          frameDurationRef.current = step;
          decelStepRef.current += 1;
        }
      }

      timerRef.current = setTimeout(tick, frameDurationRef.current);
    };

    timerRef.current = setTimeout(tick, frameDurationRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  if (!displayGame) {
    return (
      <div className="flex h-18 items-center justify-center rounded-xl border border-gray-700 bg-gray-800/60">
        <span className="text-sm text-gray-500">Loading…</span>
      </div>
    );
  }

  const isLanding = landed;

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/60">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={tickKey}
          initial={{ y: -36, opacity: 0 }}
          animate={{ y: 0, opacity: 1, scale: isLanding ? [1, 1.04, 1] : 1 }}
          exit={{ y: 36, opacity: 0 }}
          transition={
            isLanding
              ? {
                  y: { type: "spring", stiffness: 500, damping: 28 },
                  opacity: { type: "spring", stiffness: 500, damping: 28 },
                  scale: { duration: 0.35, ease: "easeInOut" },
                }
              : { duration: 0.07, ease: "linear" }
          }
          className="flex items-center gap-3 p-3"
        >
          <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-700">
            {displayGame.cover_art_url || displayGame.background_url ? (
              <img
                src={(displayGame.cover_art_url || displayGame.background_url)!}
                alt={displayGame.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="from-brand-900 to-brand-900 flex h-full w-full items-center justify-center bg-linear-to-br">
                <span className="text-sm font-bold text-white/30">
                  {displayGame.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-snug font-bold text-white">
              {displayGame.title}
            </p>
            <div className="mt-1">
              <PlatformBadge platform={displayGame.platform} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
