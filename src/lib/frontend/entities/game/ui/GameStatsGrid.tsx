"use client";

import { ClipboardList, Gift, SquarePlay, Trophy } from "lucide-react";
import { cn } from "@/src/lib/frontend/shared";
import type { LucideIcon } from "lucide-react";

interface Stats {
  playing: number;
  ongoing: number;
  backlog: number;
  completed: number;
  completedFull: number;
  wishlist: number;
}

interface GameStatsGridProps {
  stats: Stats;
  activeFilter?: string;
  onFilter?: (key: string) => void;
}

type StatCard =
  | { label: string; color: string; activeColor: string; accentBorder: string; activeBorder: string; ambient: string; activeAmbient: string; Icon: LucideIcon; filterKey?: string; kind: "single"; getValue: (s: Stats) => number }
  | { label: string; color: string; activeColor: string; accentBorder: string; activeBorder: string; ambient: string; activeAmbient: string; Icon: LucideIcon; filterKey?: string; kind: "split"; getPrimary: (s: Stats) => number; getSecondary: (s: Stats) => number; subLabel: string };

const STAT_CARDS: StatCard[] = [
  {
    kind: "single",
    label: "Playing",
    color: "text-emerald-400",
    activeColor: "text-emerald-300",
    accentBorder: "border-l-emerald-800",
    activeBorder: "border-l-emerald-500",
    ambient: "from-emerald-950/60",
    activeAmbient: "from-emerald-900/30",
    Icon: SquarePlay,
    filterKey: "playing",
    getValue: (s) => s.playing + s.ongoing,
  },
  {
    kind: "single",
    label: "Backlog",
    color: "text-violet-400",
    activeColor: "text-violet-300",
    accentBorder: "border-l-violet-800",
    activeBorder: "border-l-violet-500",
    ambient: "from-violet-950/60",
    activeAmbient: "from-violet-900/30",
    Icon: ClipboardList,
    filterKey: "backlog",
    getValue: (s) => s.backlog,
  },
  {
    kind: "split",
    label: "Completed",
    color: "text-green-400",
    activeColor: "text-green-300",
    accentBorder: "border-l-green-800",
    activeBorder: "border-l-green-500",
    ambient: "from-green-950/60",
    activeAmbient: "from-green-900/30",
    Icon: Trophy,
    filterKey: "completed",
    getPrimary: (s) => s.completedFull,
    getSecondary: (s) => s.completed,
    subLabel: "100% clear / total",
  },
  {
    kind: "single",
    label: "Wishlist",
    color: "text-yellow-400",
    activeColor: "text-yellow-300",
    accentBorder: "border-l-yellow-800",
    activeBorder: "border-l-yellow-500",
    ambient: "from-yellow-950/60",
    activeAmbient: "from-yellow-900/30",
    Icon: Gift,
    filterKey: "wishlist",
    getValue: (s) => s.wishlist,
  },
];

export function GameStatsGrid({ stats, activeFilter, onFilter }: GameStatsGridProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {STAT_CARDS.map((card) => {
        const isActive = card.filterKey !== undefined && card.filterKey === activeFilter;
        const isClickable = card.filterKey !== undefined && onFilter !== undefined;

        return (
          <div
            key={card.label}
            onClick={isClickable ? () => onFilter!(card.filterKey!) : undefined}
            className={cn(
              "relative overflow-hidden rounded-xl border border-l-2 bg-linear-to-br to-gray-900 p-4 transition-all duration-150",
              isActive
                ? cn("border-gray-700 to-gray-800", card.activeAmbient, card.activeBorder)
                : cn("border-gray-800", card.ambient, card.accentBorder),
              isClickable && "cursor-pointer hover:border-gray-700",
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                {card.label}
              </p>
              <card.Icon
                size={14}
                className={isActive ? card.activeColor : "text-gray-700"}
              />
            </div>

            {card.kind === "split" ? (
              <>
                <p className={cn("text-3xl font-bold leading-none", isActive ? card.activeColor : card.color)}>
                  {card.getPrimary(stats)}
                  <span className="text-lg font-semibold text-gray-600">
                    {" "}/ {card.getSecondary(stats)}
                  </span>
                </p>
                <p className="mt-1.5 text-[10px] text-gray-600">{card.subLabel}</p>
              </>
            ) : (
              <p className={cn("text-3xl font-bold leading-none", isActive ? card.activeColor : card.color)}>
                {card.getValue(stats)}
              </p>
            )}

            {isActive && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-transparent via-current to-transparent opacity-30" />
            )}
          </div>
        );
      })}
    </div>
  );
}
