"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { GameDto, GameStatus } from "@/src/lib/backend/backlog/domain/models";
import { scoreToTier } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { PlatformBadge } from "./PlatformBadge";
import { RatingStars } from "./RatingStars";
import { GameStatusBadge } from "./GameStatusBadge";
import { GameReplayBadge } from "./GameReplayBadge";
import { PriorityPill } from "./PriorityPill";
import { GameCoverArt } from "./GameCoverArt";
import { GameCardActions } from "./GameCardActions";
import { GameCardExpandable } from "./GameCardExpandable";

interface GameCardProps {
  game: GameDto;
  onEdit?: (game: GameDto) => void;
  onStatusChange?: (id: string, status: GameStatus) => void;
  onPriorityChange?: (id: string, delta: number) => void;
  showPriority?: boolean;
  showActions?: boolean;
  showStatusBadge?: boolean;
  rank?: number;
}

export function GameCard({
  game,
  onEdit,
  onStatusChange,
  onPriorityChange,
  showPriority = false,
  showActions = true,
  showStatusBadge = false,
  rank,
}: GameCardProps) {
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const moods = game.moods ?? [];
  const coverImage = game.background_url || game.cover_art_url;
  const tier = scoreToTier(game.priority_score);

  return (
    <div className="relative bg-gray-900 border border-gray-800 hover:border-brand-800/70 rounded-xl min-h-35 overflow-hidden transition-all duration-200">
      {showPriority && (
        <div className={`absolute left-0 inset-y-0 w-1 z-10 rounded-l-xl ${tier.bar}`} />
      )}
      {coverImage && (
        <>
          <div
            className="absolute inset-0 scale-110"
            style={{ backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(17,24,39,0.5) 0%, rgba(17,24,39,0.88) 45%, rgba(17,24,39,0.97) 100%)" }}
          />
        </>
      )}

      <div className="relative flex gap-4 p-4">
        <GameCoverArt title={game.title} coverArtUrl={game.cover_art_url} rank={rank} />

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-white text-sm truncate leading-snug">{game.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <button onClick={() => onEdit(game)} title="Edit game" className="text-gray-600 hover:text-brand-400 transition-colors">
                  <Pencil size={13} />
                </button>
              )}
              {showPriority && onPriorityChange && (
                <PriorityPill score={game.priority_score} gameId={game.id} onPriorityChange={onPriorityChange} />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <PlatformBadge platform={game.platform} />
            {game.rating !== null && game.rating !== undefined && <RatingStars rating={game.rating} />}
            <GameReplayBadge replayStatus={game.replay_status} />
            {showStatusBadge && <GameStatusBadge status={game.status} />}
          </div>

          {moods.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {moods.map((mood) => <MoodBadge key={mood.id} mood={mood.name} />)}
            </div>
          )}

          {!!game.game_description && (
            <GameCardExpandable text={game.game_description} show={showDesc} variant="description" />
          )}
          {!!game.personal_note && (
            <GameCardExpandable text={game.personal_note} show={showNote} variant="note" />
          )}

          <GameCardActions
            gameId={game.id}
            gameStatus={game.status}
            hasDescription={!!game.game_description}
            hasNote={!!game.personal_note}
            showDesc={showDesc}
            showNote={showNote}
            showActions={showActions}
            showStatusSelect={showStatusSelect}
            onToggleDesc={() => setShowDesc((p) => !p)}
            onToggleNote={() => setShowNote((p) => !p)}
            onToggleStatusSelect={() => setShowStatusSelect((p) => !p)}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
