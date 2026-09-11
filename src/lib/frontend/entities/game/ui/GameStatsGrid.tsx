"use client";

import { STAT_CARDS, Stats } from "./GameStatsGrid.constants";
import { GameStatsGridCard } from "./GameStatsGrid.Card";

export type { Stats };

interface GameStatsGridProps {
  stats: Stats;
  activeFilter?: string;
  onFilter?: (key: string) => void;
}

export function GameStatsGrid({
  stats,
  activeFilter,
  onFilter,
}: GameStatsGridProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {STAT_CARDS.map((card) => {
        const isActive =
          card.filterKey !== undefined && card.filterKey === activeFilter;
        const isClickable =
          card.filterKey !== undefined && onFilter !== undefined;

        return (
          <GameStatsGridCard
            key={card.label}
            card={card}
            stats={stats}
            isActive={isActive}
            isClickable={isClickable}
            onClick={
              isClickable ? () => onFilter!(card.filterKey!) : undefined
            }
          />
        );
      })}
    </div>
  );
}
