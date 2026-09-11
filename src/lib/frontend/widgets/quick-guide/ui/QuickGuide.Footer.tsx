"use client";

import { Smartphone } from "lucide-react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { deriveStats } from "@/src/lib/backend/backlog/domain/services";
import { useQuickGuideStore } from "@/src/lib/frontend/shared";

interface QuickGuideFooterProps {
  games: GameDto[];
}

export function QuickGuideFooter({ games }: QuickGuideFooterProps) {
  const { shakeEnabled, toggleShake } = useQuickGuideStore();
  const stats = deriveStats(games);

  return (
    <div className="space-y-3 border-t border-gray-800/80 pt-3">
      {/* Telemetry quick metrics */}
      <div className="flex items-center justify-between px-1 text-[11px] font-medium text-gray-400">
        <span>{stats.playing} Playing</span>
        <span>·</span>
        <span>{stats.backlog} Backlog</span>
        <span>·</span>
        <span>{stats.completed} Completed</span>
      </div>

      {/* Shake to open toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-800/60 bg-gray-950/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Smartphone size={14} className="text-brand-400" />
          <span className="text-xs font-medium text-gray-300">
            Shake to Open Guide
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={shakeEnabled}
          onClick={toggleShake}
          className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
            shakeEnabled ? "bg-brand-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              shakeEnabled ? "translate-x-4.5" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
