"use client";

import type { RecentPlayDto } from "@/src/lib/backend/activity/domain/models";
import { PlatformIcon } from "@/src/lib/frontend/entities/game";
import { formatRelativeTime } from "@/src/lib/frontend/shared";

interface Props {
  play: RecentPlayDto;
  onSelectGame?: (id: string) => void;
}

export function RecentPlayRow({ play, onSelectGame }: Props) {
  const title = play.game?.title ?? play.game_name;
  const thumb = play.game?.cover_art_url;
  const platform = play.platform ?? play.game?.platform;
  const isInteractive = Boolean(play.game_id && onSelectGame);

  const content = (
    <>
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-gray-800 shadow-md">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            aria-hidden
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/30">
            {title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-emerald-300">
          {title}
        </p>
        {platform && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
            <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
            <span className="text-[11px] capitalize text-gray-400">{platform}</span>
          </div>
        )}
      </div>

      <span className="flex shrink-0 items-center font-mono text-xs text-gray-400">
        {formatRelativeTime(play.last_seen_at)}
      </span>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={() => onSelectGame?.(play.game_id!)}
        className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900/40 p-2.5 text-left transition-all duration-200 hover:border-emerald-500/40 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:via-gray-800/60 hover:to-gray-900/40 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
      >
        <span className="absolute inset-y-0 left-0 w-0.5 bg-emerald-400 opacity-0 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-opacity duration-200 group-hover:opacity-100" />
        {content}
      </button>
    );
  }

  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900/40 p-2.5">
      {content}
    </div>
  );
}
