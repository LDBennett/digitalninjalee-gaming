"use client";

import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { MoodBadge } from "@/src/lib/frontend/entities/mood";
import { PlatformBadge } from "@/src/lib/frontend/entities/game";

interface Props {
  game: GameDto;
  onPickAgain: () => void;
}

export function RandomPickResult({ game, onPickAgain }: Props) {
  const gameMoods = game.moods ?? [];
  return (
    <div className="slide-up space-y-3 rounded-xl border border-gray-700 bg-gray-800/60 p-4">
      <div className="flex gap-3">
        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-700">
          {game.cover_art_url || game.background_url ? (
            <img
              src={(game.cover_art_url || game.background_url)!}
              alt={game.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="from-brand-900 to-brand-900 flex h-full w-full items-center justify-center bg-linear-to-br">
              <span className="text-xl font-bold text-white/30">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-brand-400 mb-0.5 text-xs font-medium">
            Let's Play:
          </p>
          <h3 className="leading-snug font-bold text-white">{game.title}</h3>
          <div className="mt-1.5">
            <PlatformBadge platform={game.platform} />
          </div>
        </div>
      </div>
      {gameMoods.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {gameMoods.map((mood) => (
            <MoodBadge key={mood.id} mood={mood.name} />
          ))}
        </div>
      )}
      <button
        onClick={onPickAgain}
        className="w-full py-1 text-xs text-gray-500 transition-colors hover:text-white"
      >
        Pick again →
      </button>
    </div>
  );
}
