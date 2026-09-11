"use client";

import { cn } from "@/src/lib/frontend/shared";
import { StatCard, Stats } from "./GameStatsGrid.constants";

interface GameStatsGridCardProps {
  card: StatCard;
  stats: Stats;
  isActive: boolean;
  isClickable: boolean;
  onClick?: () => void;
}

export function GameStatsGridCard({
  card,
  stats,
  isActive,
  isClickable,
  onClick,
}: GameStatsGridCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-l-2 bg-linear-to-br to-gray-900 p-4 transition-all duration-150",
        isActive
          ? cn(
              "border-gray-700 to-gray-800",
              card.activeAmbient,
              card.activeBorder,
            )
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
          <p
            className={cn(
              "text-3xl leading-none font-bold",
              isActive ? card.activeColor : card.color,
            )}
          >
            {card.getPrimary(stats)}
            <span className="text-lg font-semibold text-gray-600">
              {" "}
              / {card.getSecondary(stats)}
            </span>
          </p>
          <p className="mt-1.5 text-[10px] text-gray-600">
            {card.subLabel}
          </p>
        </>
      ) : (
        <p
          className={cn(
            "text-3xl leading-none font-bold",
            isActive ? card.activeColor : card.color,
          )}
        >
          {card.getValue(stats)}
        </p>
      )}

      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-transparent via-current to-transparent opacity-30" />
      )}
    </div>
  );
}
