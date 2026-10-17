"use client";

import { AnimatePresence } from "framer-motion";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { EmptyState, useAuthStore } from "@/src/lib/frontend/shared";
import { useHeroCarouselController } from "./useHeroCarouselController";
import { HeroCardControls } from "./HeroCard.Controls";
import { HeroCardBackdrop } from "./HeroCard.Backdrop";
import { HeroCardSlide } from "./HeroCard.Slide";

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
      <div className="flex h-[480px] min-h-[480px] items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/60 p-6 sm:h-[460px] sm:min-h-[460px] lg:h-[460px] lg:min-h-[460px]">
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
      className="relative h-[480px] min-h-[480px] overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 select-none sm:h-[460px] sm:min-h-[460px] lg:h-[460px] lg:min-h-[460px]"
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
        <HeroCardSlide
          key={`content-${game.id}`}
          game={game}
          direction={direction}
          prefersReducedMotion={prefersReducedMotion}
          dragProps={dragProps}
          isAuthenticated={isAuthenticated}
          onManageGame={onManageGame}
          onViewLogs={onViewLogs}
          onSignIn={handleSignIn}
        />
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
