"use client";

import { motion } from "framer-motion";
import { Clock, Trophy } from "lucide-react";
import { GameDto, scoreToTier } from "@/src/lib/backend/backlog/domain/models";
import { GatedElement } from "@/src/lib/frontend/shared";
import { RatingStars } from "./GameCard.RatingStars";
import { GameStatusBadge } from "../badges/GameStatusBadge";
import { GameReplayBadge } from "./GameCard.ReplayBadge";
import { GameCardMoodList } from "./GameCard.MoodList";
import { PriorityPill } from "../badges/PriorityPill";
import { GameCoverArt } from "./GameCard.CoverArt";
import { PlatformIcon } from "../badges/PlatformIcon";
import { PlayGoals } from "../badges/PlayGoals";

interface GameCardProps {
  game: GameDto;
  onEdit?: (game: GameDto) => void;
  onPriorityChange?: (id: string, delta: number) => void;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  showPriority?: boolean;
  showStatusBadge?: boolean;
  rank?: number;
  index?: number;
}

export function GameCard({
  game,
  onEdit,
  onPriorityChange,
  isAuthenticated,
  onSignIn,
  showPriority = false,
  showStatusBadge = false,
  rank,
  index = 0,
}: GameCardProps) {
  const moods = game.moods ?? [];
  const coverImage = game.background_url || game.cover_art_url;
  const tier = scoreToTier(game.priority_score);

  const hasMetadata =
    (game.rating !== null && game.rating !== undefined) ||
    Boolean(game.replay_status) ||
    (game.play_goals && game.play_goals.length > 0) ||
    Boolean(game.time_to_beat?.main) ||
    Boolean(game.completion_roadmap?.difficulty) ||
    (showPriority && showStatusBadge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.25,
        ease: "circOut",
        delay: Math.min(index, 5) * 0.03,
      }}
      role="button"
      tabIndex={0}
      onClick={() => onEdit?.(game)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(game);
        }
      }}
      className="group relative min-h-28 cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-gray-900/90 select-none shadow-md transition-all duration-200 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-950/20 active:scale-[0.985] active:brightness-105"
    >
      {showPriority && (
        <div
          className={`absolute inset-y-0 left-0 z-10 w-1 rounded-l-xl ${tier.bar} shadow-sm`}
        />
      )}
      {coverImage && (
        <>
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(17,24,39,0.5) 0%, rgba(17,24,39,0.88) 45%, rgba(17,24,39,0.97) 100%)",
            }}
          />
        </>
      )}

      <div className="relative flex gap-3.5 p-3.5 sm:gap-4 sm:p-4">
        <GameCoverArt
          title={game.title}
          coverArtUrl={game.cover_art_url}
          rank={rank}
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {/* Line 1: HUD Telemetry Header */}
          <div className="flex items-center justify-between gap-2">
            <PlatformIcon
              platform={game.platform}
              className="h-4 w-4 shrink-0"
            />
            {showPriority ? (
              <GatedElement
                isAuthenticated={isAuthenticated ?? true}
                onSignIn={onSignIn ?? (() => {})}
              >
                <PriorityPill
                  score={game.priority_score}
                  gameId={game.id}
                  onPriorityChange={onPriorityChange}
                />
              </GatedElement>
            ) : showStatusBadge ? (
              <GameStatusBadge status={game.status} />
            ) : null}
          </div>

          {/* Line 2: Game Title (Full width, zero horizontal competition) */}
          <h3 className="line-clamp-2 py-0.5 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-brand-300">
            {game.title}
          </h3>

          {/* Line 3: Metadata Row & Mood Tags */}
          {(hasMetadata || moods.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {showPriority && showStatusBadge && (
                <GameStatusBadge status={game.status} />
              )}
              {game.rating !== null && game.rating !== undefined && (
                <RatingStars rating={game.rating} />
              )}
              <GameReplayBadge replayStatus={game.replay_status} />
              <PlayGoals playGoals={game.play_goals} />

              {game.time_to_beat?.main && (
                <span className="flex items-center gap-1 rounded-full border border-sky-500/25 bg-sky-950/40 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                  <Clock size={10} className="shrink-0 text-sky-400" />
                  <span>{game.time_to_beat.main}h</span>
                </span>
              )}

              {game.completion_roadmap?.difficulty && (
                <span className="flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-950/40 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  <Trophy size={10} className="shrink-0 text-amber-400" />
                  <span>{game.completion_roadmap.difficulty}</span>
                </span>
              )}

              <GameCardMoodList moods={moods} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
