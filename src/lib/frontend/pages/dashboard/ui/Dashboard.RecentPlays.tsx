"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { PlatformIcon } from "@/src/lib/frontend/entities/game";
import { LogPlayModal } from "@/src/lib/frontend/features/log-play";
import {
  Button,
  EmptyState,
  formatRelativeTime,
  useAuthStore,
} from "@/src/lib/frontend/shared";

interface Props {
  plays: RecentPlayDto[];
  heading: string;
  games: GameDto[];
}

export function DashboardRecentPlays({ plays, heading, games }: Props) {
  const { session } = useAuthStore();
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            {heading}
          </h3>
        </div>
        {session && (
          <Button
            variant="ghost"
            size="xs"
            icon={<Plus size={14} />}
            onClick={() => setShowLog(true)}
          >
            Log
          </Button>
        )}
      </div>

      {plays.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
          <EmptyState heading="No play activity yet" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {plays.map((play) => {
            const title = play.game?.title ?? play.game_name;
            const thumb = play.game?.cover_art_url;

            return (
              <div
                key={play.id}
                className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={title}
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-800">
                    <span className="text-sm font-bold text-white/30">
                      {title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {title}
                  </p>
                  {play.game && (
                    <div className="mt-0.5">
                      <PlatformIcon
                        platform={play.game.platform}
                        className="h-4 w-4"
                      />
                    </div>
                  )}
                </div>

                <span className="shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(play.last_seen_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <span className="mt-2 flex justify-end text-xs text-gray-400 italic">
        Activity sourced from Discord and Steam
      </span>
      <LogPlayModal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        games={games}
      />
    </div>
  );
}
