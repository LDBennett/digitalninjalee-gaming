"use client";

import { motion } from "framer-motion";
import { Gamepad2, ScrollText } from "lucide-react";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import {
  GameStatusBadge,
  MoodBadge,
  PlatformIcon,
  PlayGoals,
  RatingStars,
} from "@/src/lib/frontend/entities/game";
import { Button, GatedElement } from "@/src/lib/frontend/shared";
import { HeroCardLatestLog } from "./HeroCard.LatestLog";

interface HeroCardSlideProps {
  game: GameDto;
  direction: number;
  prefersReducedMotion: boolean;
  dragProps: Record<string, unknown>;
  isAuthenticated: boolean;
  onManageGame?: (id: string) => void;
  onViewLogs?: (id: string) => void;
  onSignIn: () => void;
}

export function HeroCardSlide({
  game,
  direction,
  prefersReducedMotion,
  dragProps,
  isAuthenticated,
  onManageGame,
  onViewLogs,
  onSignIn,
}: HeroCardSlideProps) {
  const moods = game.moods ?? [];

  return (
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
      className="absolute inset-0 flex cursor-grab flex-col justify-between p-5 active:cursor-grabbing sm:p-6 md:p-8"
    >
      {/* Slide Body */}
      <div className="min-w-0">
        {/* Aero Emerald Live Beacon - Header-only clearance for top-right controls */}
        <div className="mb-3 flex items-center pr-28 sm:pr-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Currently Playing
          </div>
        </div>

        {/* Title has 100% full width across card */}
        <h2 className="mb-2 text-2xl leading-tight font-bold text-white md:text-3xl">
          {game.title}
        </h2>

        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <PlatformIcon platform={game.platform} className="h-5 w-5" />
          <GameStatusBadge status={game.status} />
          {game.rating != null && <RatingStars rating={game.rating} />}
        </div>

        {moods.length > 0 && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            {moods.slice(0, 4).map((mood) => (
              <MoodBadge key={mood.id} mood={mood.name} />
            ))}
            {moods.length > 4 && (
              <>
                {moods.slice(4).map((mood) => (
                  <MoodBadge
                    key={mood.id}
                    mood={mood.name}
                    className="max-sm:hidden"
                  />
                ))}
                <span className="inline-flex items-center rounded-md border border-gray-800 bg-gray-900/60 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:hidden">
                  +{moods.length - 4}
                </span>
              </>
            )}
          </div>
        )}

        {game.play_goals && game.play_goals.length > 0 && (
          <div className="mb-2.5">
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
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
        <GatedElement
          isAuthenticated={isAuthenticated}
          onSignIn={onSignIn}
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
          onSignIn={onSignIn}
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
  );
}

