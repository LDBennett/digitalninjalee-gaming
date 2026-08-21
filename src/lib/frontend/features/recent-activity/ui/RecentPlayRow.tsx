"use client";

import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";
import { PlatformIcon } from "@/src/lib/frontend/entities/game";
import { formatRelativeTime } from "@/src/lib/frontend/shared";

interface Props {
  play: RecentPlayDto;
}

export function RecentPlayRow({ play }: Props) {
  const title = play.game?.title ?? play.game_name;
  const thumb = play.game?.cover_art_url;
  // The session's own platform (known for manual/Steam entries) is more
  // accurate than the library game's default when a title is owned on
  // more than one platform.
  const platform = play.platform ?? play.game?.platform;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700">
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
        <p className="truncate text-sm font-medium text-white">{title}</p>
        {platform && (
          <div className="mt-0.5">
            <PlatformIcon platform={platform} className="h-4 w-4" />
          </div>
        )}
      </div>

      <span className="shrink-0 text-xs text-gray-400">
        {formatRelativeTime(play.last_seen_at)}
      </span>
    </div>
  );
}
