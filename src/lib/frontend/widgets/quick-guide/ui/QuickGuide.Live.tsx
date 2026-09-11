"use client";

import { Radio } from "lucide-react";
import { PlatformIcon } from "@/src/lib/frontend/entities/game";
import { useRecentActivity } from "@/src/lib/frontend/features/recent-activity";
import { formatRelativeTime, useGameModalStore } from "@/src/lib/frontend/shared";

interface QuickGuideLiveProps {
  onCloseGuide: () => void;
}

export function QuickGuideLive({ onCloseGuide }: QuickGuideLiveProps) {
  const { recentPlays, recentLoading } = useRecentActivity(1);
  const { openEdit } = useGameModalStore();
  const latest = recentPlays[0];

  if (recentLoading) {
    return (
      <div className="rounded-2xl border border-gray-800/80 bg-gray-950/40 p-3">
        <div className="h-10 animate-pulse rounded-lg bg-gray-800/60" />
      </div>
    );
  }

  if (!latest) {
    return null;
  }

  const handleGameClick = () => {
    if (latest.game_id) {
      onCloseGuide();
      openEdit(latest.game_id);
    }
  };

  const coverUrl = latest.game?.cover_art_url;
  const timeAgo = formatRelativeTime(latest.last_seen_at);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        <Radio size={13} className="text-brand-400 animate-pulse" />
        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
          Recent Activity
        </span>
      </div>

      <div
        role={latest.game_id ? "button" : undefined}
        tabIndex={latest.game_id ? 0 : undefined}
        onClick={handleGameClick}
        className={`flex items-center gap-3 rounded-xl border border-gray-800/80 bg-gray-950/60 p-2.5 transition-colors ${
          latest.game_id
            ? "cursor-pointer hover:border-gray-700 hover:bg-gray-900 active:scale-[0.99]"
            : ""
        }`}
      >
        <div className="h-11 w-8 shrink-0 overflow-hidden rounded-md bg-gray-800">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-500">
              {latest.game_name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <PlatformIcon
              platform={latest.platform ?? latest.game?.platform ?? "pc"}
              className="h-3.5 w-3.5 shrink-0"
            />
            <p className="truncate text-xs font-semibold text-white">
              {latest.game_name}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Active {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
