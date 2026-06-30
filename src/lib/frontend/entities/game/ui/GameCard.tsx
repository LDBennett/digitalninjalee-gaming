"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { scoreToTier } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { Button, GatedElement } from "@/src/lib/frontend/shared";
import { PlatformBadge } from "./PlatformBadge";
import { RatingStars } from "./GameCard.RatingStars";
import { GameStatusBadge } from "./GameStatusBadge";
import { GameReplayBadge } from "./GameCard.ReplayBadge";
import { PriorityPill } from "./PriorityPill";
import { GameCoverArt } from "./GameCard.CoverArt";
import { GameCardActions } from "./GameCard.Actions";
import { GameCardExpandable } from "./GameCard.Expandable";
import { GameCardPlayGoals } from "./GameCard.PlayGoals";

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
  const [showDesc, setShowDesc] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const moods = game.moods ?? [];
  const coverImage = game.background_url || game.cover_art_url;
  const tier = scoreToTier(game.priority_score);

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
      className="hover:border-brand-800/70 relative min-h-35 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all duration-200"
    >
      {showPriority && (
        <div
          className={`absolute inset-y-0 left-0 z-10 w-1 rounded-l-xl ${tier.bar}`}
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

      <div className="relative flex gap-4 p-4">
        <GameCoverArt
          title={game.title}
          coverArtUrl={game.cover_art_url}
          rank={rank}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm leading-snug font-semibold text-white">
              {game.title}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {onEdit && (
                <GatedElement
                  isAuthenticated={isAuthenticated ?? true}
                  onSignIn={onSignIn ?? (() => {})}
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<Pencil size={13} />}
                    onClick={() => onEdit(game)}
                    aria-label="Edit game"
                    title="Edit game"
                    className="hover:text-brand-400 p-0 text-gray-600"
                  />
                </GatedElement>
              )}
              {showPriority && onPriorityChange && (
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
              )}
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PlatformBadge platform={game.platform} />
            {game.rating !== null && game.rating !== undefined && (
              <RatingStars rating={game.rating} />
            )}
            <GameReplayBadge replayStatus={game.replay_status} />
            {showStatusBadge && <GameStatusBadge status={game.status} />}
          </div>

          {moods.length > 0 && (
            <>
              <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                {moods.slice(0, 2).map((mood) => (
                  <MoodBadge key={mood.id} mood={mood.name} />
                ))}
                {moods.length > 2 && (
                  <span className="inline-flex items-center rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                    +{moods.length - 2}
                  </span>
                )}
              </div>
              <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
                {moods.map((mood) => (
                  <MoodBadge key={mood.id} mood={mood.name} />
                ))}
              </div>
            </>
          )}

          <GameCardPlayGoals playGoals={game.play_goals} />

          {!!game.game_description && (
            <GameCardExpandable
              text={game.game_description}
              show={showDesc}
              variant="description"
            />
          )}
          {!!game.personal_note && (
            <GameCardExpandable
              text={game.personal_note}
              show={showNote}
              variant="note"
            />
          )}

          <GameCardActions
            hasDescription={!!game.game_description}
            hasNote={!!game.personal_note}
            showDesc={showDesc}
            showNote={showNote}
            onToggleDesc={() => setShowDesc((p) => !p)}
            onToggleNote={() => setShowNote((p) => !p)}
          />
        </div>
      </div>
    </motion.div>
  );
}
