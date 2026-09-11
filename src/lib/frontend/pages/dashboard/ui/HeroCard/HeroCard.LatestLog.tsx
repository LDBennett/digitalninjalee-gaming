"use client";

import { NotebookText, Sparkles, Clock, Zap, Star } from "lucide-react";
import type { GameLogEntry } from "@/src/lib/backend/backlog/domain/models";
import { formatRelativeTime } from "@/src/lib/frontend/shared";
import { useGameLogs } from "@/src/lib/frontend/features/game-logs";

interface HeroCardLatestLogProps {
  gameId: string;
  personalNote?: string | null;
  gameDescription?: string | null;
  isAuthenticated: boolean;
}

export function HeroCardLatestLog({
  gameId,
  personalNote,
  gameDescription,
  isAuthenticated,
}: HeroCardLatestLogProps) {
  const { logs, logsLoading } = useGameLogs(isAuthenticated ? gameId : null);

  if (isAuthenticated && !logsLoading && logs.length > 0) {
    const latest = logs[0];
    return <LogEntryDisplay entry={latest} />;
  }

  // Fallback 1: Legacy personal note if authenticated
  if (isAuthenticated && personalNote) {
    return (
      <div className="flex max-w-lg items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-2.5 text-xs text-emerald-300/90 backdrop-blur-xs">
        <NotebookText size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Scratchpad Note
          </span>
          <p className="mt-0.5 line-clamp-2 italic">{personalNote}</p>
        </div>
      </div>
    );
  }

  // Fallback 2: Official game description
  if (gameDescription) {
    return (
      <p className="line-clamp-2 max-w-lg text-sm leading-relaxed text-gray-300/80">
        {gameDescription}
      </p>
    );
  }

  return null;
}

function LogEntryDisplay({ entry }: { entry: GameLogEntry }) {
  if (entry.type === "note") {
    return (
      <div className="flex max-w-lg items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-950/40 p-2.5 backdrop-blur-xs">
        <NotebookText size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <span>Latest Log</span>
            <span className="font-normal text-gray-400">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-emerald-200/90 italic">
            &ldquo;{entry.content}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-lg items-center justify-between gap-2 rounded-xl border border-white/10 bg-gray-900/60 px-3 py-2 text-xs text-gray-300 backdrop-blur-xs">
      <div className="flex items-center gap-2 truncate">
        {entry.type === "status_change" && (
          <>
            <Clock size={13} className="shrink-0 text-blue-400" />
            <span className="truncate">
              Status updated to{" "}
              <span className="font-semibold text-white uppercase">
                {entry.metadata.new_status}
              </span>
            </span>
          </>
        )}
        {entry.type === "priority_change" && (
          <>
            <Zap size={13} className="shrink-0 text-amber-400" />
            <span className="truncate">
              Priority adjusted to{" "}
              <span className="font-semibold text-white">
                {entry.metadata.new_priority}
              </span>
            </span>
          </>
        )}
        {entry.type === "rating_change" && (
          <>
            <Star size={13} className="shrink-0 text-yellow-400" />
            <span className="truncate">
              Rating set to{" "}
              <span className="font-semibold text-yellow-300">
                {entry.metadata.new_rating ? `${entry.metadata.new_rating} ★` : "None"}
              </span>
            </span>
          </>
        )}
        {entry.type === "created" && (
          <>
            <Sparkles size={13} className="shrink-0 text-emerald-400" />
            <span className="truncate">
              Added to library on{" "}
              <span className="font-semibold text-white uppercase">
                {entry.metadata.platform}
              </span>
            </span>
          </>
        )}
      </div>

      <span className="shrink-0 text-[10px] text-gray-400">
        {formatRelativeTime(entry.createdAt)}
      </span>
    </div>
  );
}
