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
    <div className="space-y-3 bg-gray-800/60 p-4 border border-gray-700 rounded-xl slide-up">
      <div className="flex gap-3">
        <div className="bg-gray-700 rounded-lg w-14 h-20 overflow-hidden shrink-0">
          {game.cover_art_url || game.background_url ? (
            <img
              src={(game.cover_art_url || game.background_url)!}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center bg-linear-to-br from-brand-900 to-brand-900 w-full h-full">
              <span className="font-bold text-white/30 text-xl">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="mb-0.5 font-medium text-brand-400 text-xs">
            Let's Play:
          </p>
          <h3 className="font-bold text-white leading-snug">{game.title}</h3>
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
        className="py-1 w-full text-gray-500 hover:text-white text-xs transition-colors"
      >
        Pick again →
      </button>
    </div>
  );
}
