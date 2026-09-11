"use client";

import { Sparkles, Zap, Star, Clock } from "lucide-react";
import {
  GameLogEntry,
  scoreToTier,
} from "@/src/lib/backend/backlog/domain/models";
import { GameStatusBadge } from "@/src/lib/frontend/entities/game";
import { formatRelativeTime } from "@/src/lib/frontend/shared";

interface GameLogTimelineEventItemProps {
  entry: GameLogEntry;
}

export function GameLogTimelineEventItem({
  entry,
}: GameLogTimelineEventItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-950/40 px-3 py-2 text-xs text-gray-400">
      <div className="flex items-center gap-2">
        {entry.type === "created" && (
          <>
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              Added to library (
              <span className="font-medium text-gray-300 uppercase">
                {entry.metadata.platform}
              </span>
              ) with status:
            </span>
            <GameStatusBadge status={entry.metadata.initial_status} />
          </>
        )}

        {entry.type === "status_change" && (
          <>
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Status changed:</span>
            <GameStatusBadge status={entry.metadata.old_status} />
            <span className="text-gray-500">→</span>
            <GameStatusBadge status={entry.metadata.new_status} />
          </>
        )}

        {entry.type === "priority_change" && (
          <>
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <PriorityChangeContent
              oldScore={entry.metadata.old_priority}
              newScore={entry.metadata.new_priority}
            />
          </>
        )}

        {entry.type === "rating_change" && (
          <>
            <Star className="h-3.5 w-3.5 text-yellow-400" />
            <span>
              Rating updated to{" "}
              <span className="font-semibold text-yellow-300">
                {entry.metadata.new_rating
                  ? `${entry.metadata.new_rating} ★`
                  : "None"}
              </span>
            </span>
          </>
        )}
      </div>

      <span
        title={new Date(entry.createdAt).toLocaleString()}
        className="shrink-0 text-[11px] text-gray-500"
      >
        {formatRelativeTime(entry.createdAt)}
      </span>
    </div>
  );
}

function PriorityChangeContent({
  oldScore,
  newScore,
}: {
  oldScore: number;
  newScore: number;
}) {
  const oldTier = scoreToTier(oldScore);
  const newTier = scoreToTier(newScore);

  if (oldTier.id === newTier.id) {
    return (
      <span>
        Priority adjusted:{" "}
        <span className={`font-semibold ${newTier.pillText}`}>
          {newTier.label}
        </span>{" "}
        <span className="text-gray-400">
          ({oldScore} → {newScore})
        </span>
      </span>
    );
  }

  return (
    <span>
      Priority changed:{" "}
      <span className={`font-medium ${oldTier.pillText}`}>
        {oldTier.label} ({oldScore})
      </span>{" "}
      <span className="text-gray-500">→</span>{" "}
      <span className={`font-semibold ${newTier.pillText}`}>
        {newTier.label} ({newScore})
      </span>
    </span>
  );
}
