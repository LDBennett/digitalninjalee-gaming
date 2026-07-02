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
      <span title="Want to Replay" className="inline-flex items-center">
        <RotateCcw size={14} className="text-violet-400" aria-hidden />
        <span className="sr-only">Want to Replay</span>
      </span>
    );
  }
  if (replayStatus === "replaying") {
    return (
      <span title="Replaying" className="inline-flex items-center">
        <Repeat size={14} className="text-teal-400" aria-hidden />
        <span className="sr-only">Replaying</span>
      </span>
    );
  }
  return null;
}
