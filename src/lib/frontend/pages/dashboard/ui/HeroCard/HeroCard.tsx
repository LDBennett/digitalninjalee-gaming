"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ScrollText } from "lucide-react";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import {
  GameStatusBadge,
  MoodBadge,
  PlatformIcon,
  PlayGoals,
  RatingStars,
} from "@/src/lib/frontend/entities/game";
import {
  Button,
  EmptyState,
  GatedElement,
  useAuthStore,
} from "@/src/lib/frontend/shared";
import { useHeroCarouselController } from "./useHeroCarouselController";
import { HeroCardControls } from "./HeroCard.Controls";
import { HeroCardBackdrop } from "./HeroCard.Backdrop";
import { HeroCardLatestLog } from "./HeroCard.LatestLog";

interface DashboardHeroCardProps {
  playingGames: GameDto[];
  onManageGame?: (id: string) => void;
  onViewLogs?: (id: string) => void;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  onEmptyRoll?: () => void;
}

export function DashboardHeroCard({
  playingGames,
  onManageGame,
  onViewLogs,
  isAuthenticated = false,
  onSignIn,
  onEmptyRoll,
}: DashboardHeroCardProps) {
  const { openLoginModal } = useAuthStore();
  const handleSignIn = onSignIn ?? openLoginModal;
  const total = playingGames.length;
  const {
    idx,
    direction,
    isPaused,
    isManuallyPaused,
    progress,
    prefersReducedMotion,
    go,
    goTo,
    toggleManualPause,
    containerProps,
    dragProps,
  } = useHeroCarouselController({ total });

  const game = playingGames[Math.min(idx, Math.max(0, total - 1))] ?? null;
  const coverImage = game ? game.background_url || game.cover_art_url : null;

  if (!game) {
    return (
      <div className="flex h-[460px] min-h-[460px] items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/60 p-6 sm:h-[460px] sm:min-h-[460px] lg:h-[460px] lg:min-h-[460px]">
        <EmptyState
          heading="Nothing playing right now"
          hint="Pick a title from your backlog or spin the wheel to start playing."
          actionLabel={onEmptyRoll ? "Roll Random Game" : undefined}
          onAction={onEmptyRoll}
        />
      </div>
    );
  }

  return (
    <section
      aria-label="Currently Playing Carousel"
      {...containerProps}
      className="relative h-[460px] min-h-[460px] overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 select-none sm:h-[460px] sm:min-h-[460px] lg:h-[460px] lg:min-h-[460px]"
    >
      {/* Screen Reader Announcer */}
      <div className="sr-only" aria-live="polite">
        Showing game {idx + 1} of {total}: {game.title}
      </div>

      {/* Persistent Carousel Navigation Controls in Top Right */}
      <HeroCardControls
        total={total}
        idx={idx}
        isManuallyPaused={isManuallyPaused}
        onDot={goTo}
        onGo={go}
        onTogglePause={toggleManualPause}
      />

      {/* Background Atmosphere Layer */}
      <HeroCardBackdrop
        gameId={game.id}
        coverImage={coverImage}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Interactive Content Slide Layer - Absolute Inset to eliminate transition expansion */}
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <motion.div
          key={`content-${game.id}`}
          custom={direction}
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 35 }
          }
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -35 }
          }
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
          {...dragProps}
          className="absolute inset-0 flex cursor-grab flex-col justify-between p-6 active:cursor-grabbing md:p-8"
        >
          {/* Slide Body */}
          <div className="min-w-0 pr-28 sm:pr-36">
            {/* Aero Emerald Live Beacon */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Currently Playing
            </div>

            <h2 className="mb-2 text-2xl leading-tight font-bold text-white md:text-3xl">
              {game.title}
            </h2>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <PlatformIcon platform={game.platform} className="h-5 w-5" />
              <GameStatusBadge status={game.status} />
              {game.rating != null && <RatingStars rating={game.rating} />}
            </div>

            {game.moods && game.moods.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {game.moods.map((mood) => (
                  <MoodBadge key={mood.id} mood={mood.name} />
                ))}
              </div>
            )}

            {game.play_goals && game.play_goals.length > 0 && (
              <div className="mb-3">
                <PlayGoals playGoals={game.play_goals} showLabels />
              </div>
            )}

            {/* Dynamic Activity: Latest Log -> Personal Note -> Game Description */}
            <div className="mb-3">
              <HeroCardLatestLog
                gameId={game.id}
                personalNote={game.personal_note}
                gameDescription={game.game_description}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>

          {/* Tactical Action Suite - Full width at bottom, zero overlap */}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
            <GatedElement
              isAuthenticated={isAuthenticated}
              onSignIn={handleSignIn}
            >
              <Button
                variant="brand-gradient"
                size="sm"
                icon={<Gamepad2 size={15} />}
                onClick={() => onManageGame?.(game.id)}
              >
                Manage Game
              </Button>
            </GatedElement>

            <GatedElement
              isAuthenticated={isAuthenticated}
              onSignIn={handleSignIn}
            >
              <Button
                variant="gray-dark"
                size="sm"
                icon={<ScrollText size={15} />}
                onClick={() => onViewLogs?.(game.id)}
              >
                Timeline & Notes
              </Button>
            </GatedElement>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Autoplay Progress Hairline along bottom */}
      {!isPaused && !prefersReducedMotion && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}
    </section>
  );
}
