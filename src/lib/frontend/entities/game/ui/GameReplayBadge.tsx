"use client";

import { Repeat, RotateCcw } from "lucide-react";
import { ReplayStatus } from "@/src/lib/backend/backlog/domain/models";

export function GameReplayBadge({
  replayStatus,
}: {
  replayStatus: ReplayStatus;
}) {
  if (replayStatus === "want-to-replay") {
    return (
      <span className="inline-flex items-center gap-1 bg-violet-900/50 px-1.5 py-0.5 rounded text-violet-300 text-xs">
        <RotateCcw size={10} /> Want to Replay
      </span>
    );
  }
  if (replayStatus === "replaying") {
    return (
      <span className="inline-flex items-center gap-1 bg-teal-900/50 px-1.5 py-0.5 rounded text-teal-300 text-xs">
        <Repeat size={10} /> Replaying
      </span>
    );
  }
  return null;
}
