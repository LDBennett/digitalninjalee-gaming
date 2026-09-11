"use client";

import type { ReactNode } from "react";
import { scoreToTier } from "@/src/lib/backend/backlog/domain/models";
import type { GameDto, Platform } from "@/src/lib/backend/backlog/domain/models";
import { PlatformIcon } from "@/src/lib/frontend/entities/game";
import { cn, Badge, EmptyState } from "@/src/lib/frontend/shared";

export type DashboardFilterTheme =
  | "playing"
  | "backlog"
  | "completed"
  | "wishlist";

const THEME_CONFIG: Record<
  DashboardFilterTheme,
  { dot: string; shadow: string; hoverRail: string; hoverText: string }
> = {
  playing: {
    dot: "bg-emerald-400",
    shadow: "shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    hoverRail: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    hoverText: "group-hover:text-emerald-300",
  },
  backlog: {
    dot: "bg-violet-400",
    shadow: "shadow-[0_0_8px_rgba(167,139,250,0.8)]",
    hoverRail: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]",
    hoverText: "group-hover:text-violet-300",
  },
  completed: {
    dot: "bg-sky-400",
    shadow: "shadow-[0_0_8px_rgba(56,189,248,0.8)]",
    hoverRail: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
    hoverText: "group-hover:text-sky-300",
  },
  wishlist: {
    dot: "bg-yellow-400",
    shadow: "shadow-[0_0_8px_rgba(250,204,21,0.8)]",
    hoverRail: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]",
    hoverText: "group-hover:text-yellow-300",
  },
};

export interface DashboardQueueItem {
  id: string;
  gameId?: string | null;
  title: string;
  coverUrl?: string | null;
  platform?: Platform | null;
  trailing?: ReactNode;
  onClick?: () => void;
}

interface Props {
  heading: string;
  items?: DashboardQueueItem[];
  games?: GameDto[];
  onSelectGame?: (id: string) => void;
  action?: ReactNode;
  emptyHeading?: string;
  filterTheme?: DashboardFilterTheme;
}

export function DashboardListQueue({
  heading,
  items,
  games,
  onSelectGame,
  action,
  emptyHeading = "Nothing here yet",
  filterTheme = "playing",
}: Props) {
  const theme = THEME_CONFIG[filterTheme];
  const resolvedItems: DashboardQueueItem[] =
    items ??
    (games ?? []).map((game) => {
      const tier = scoreToTier(game.priority_score);
      return {
        id: game.id,
        gameId: game.id,
        title: game.title,
        coverUrl: game.cover_art_url || game.background_url,
        platform: game.platform,
        trailing: (
          <Badge bg={tier.pillBg} text={tier.pillText} className="shrink-0">
            {tier.label}
          </Badge>
        ),
        onClick: () => onSelectGame?.(game.id),
      };
    });

  return (
    <div className="flex h-[460px] min-h-[460px] flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/70 shadow-2xl shadow-black/40 backdrop-blur-sm sm:h-[460px] sm:min-h-[460px] lg:h-[460px] lg:min-h-[460px]">
      {/* Telemetry Header Bar - Fixed 52px height prevents button pop jitter */}
      <div className="flex h-13 shrink-0 items-center justify-between border-b border-gray-800/80 bg-gray-900/40 px-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              theme.dot,
              theme.shadow,
            )}
          />
          <h3 className="text-xs font-semibold tracking-wider text-gray-200 uppercase">
            {heading}
          </h3>
          <span className="rounded-full bg-gray-800/80 px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
            {resolvedItems.length}
          </span>
        </div>
        {action}
      </div>

      {resolvedItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState heading={emptyHeading} />
        </div>
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-gray-800/50 overflow-y-auto">
          {resolvedItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={item.onClick}
              className="group relative flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none"
            >
              {/* Dynamic Left Indicator on Hover */}
              <span
                className={cn(
                  "absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                  theme.hoverRail,
                )}
              />

              {/* 2:3 Poster Art Thumbnail */}
              <div className="relative h-13 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-gray-800 shadow-sm">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/30">
                    {item.title.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Platform */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium text-white transition-colors",
                    theme.hoverText,
                  )}
                >
                  {item.title}
                </p>
                {item.platform && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <PlatformIcon platform={item.platform} className="h-3.5 w-3.5" />
                    <span className="text-[11px] capitalize text-gray-400">
                      {item.platform}
                    </span>
                  </div>
                )}
              </div>

              {/* Trailing Slot (Badge or Timestamp) */}
              {item.trailing}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
