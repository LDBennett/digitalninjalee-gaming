"use client";

import { scoreToTier } from "@/src/lib/backend/backlog/domain/models";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { PlatformBadge } from "@/src/lib/frontend/entities/game";
import { Badge, EmptyState } from "@/src/lib/frontend/shared";

interface Props {
  games: GameDto[];
  heading: string;
}

export function DashboardBacklogQueue({ games, heading }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
          {heading}
        </h3>
        {games.length > 0 && (
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400">
            {games.length}
          </span>
        )}
      </div>

      {games.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
          <EmptyState heading="Nothing here yet" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {games.map((game) => {
            const tier = scoreToTier(game.priority_score);
            const thumb = game.cover_art_url || game.background_url;

            return (
              <div
                key={game.id}
                className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={game.title}
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-md bg-gray-800" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {game.title}
                  </p>
                  <div className="mt-0.5">
                    <PlatformBadge platform={game.platform} />
                  </div>
                </div>

                <Badge bg={tier.pillBg} text={tier.pillText} className="shrink-0">
                  {tier.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
