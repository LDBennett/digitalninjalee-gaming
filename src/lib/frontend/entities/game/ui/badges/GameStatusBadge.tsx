"use client";

import {
  GameStatus,
  STATUS_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import { Badge } from "@/src/lib/frontend/shared";

const STATUS_BADGE: Record<GameStatus, { bg: string; text: string }> = {
  backlog: {
    bg: "bg-slate-500/15 border-slate-500/30",
    text: "text-slate-300",
  },
  playing: {
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-300",
  },
  completed: {
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-300",
  },
  dropped: { bg: "bg-gray-800/80 border-white/10", text: "text-gray-400" },
  "main-complete": {
    bg: "bg-teal-500/15 border-teal-500/30",
    text: "text-teal-300",
  },
  ongoing: {
    bg: "bg-cyan-500/15 border-cyan-500/30",
    text: "text-cyan-300",
  },
  interested: {
    bg: "bg-pink-500/15 border-pink-500/30",
    text: "text-pink-300",
  },
  "pre-ordered": {
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-300",
  },
  "keep-an-eye-on": {
    bg: "bg-purple-500/15 border-purple-500/30",
    text: "text-purple-300",
  },
};

export { STATUS_BADGE };

export function GameStatusBadge({ status }: { status: GameStatus }) {
  const badge = STATUS_BADGE[status];
  return (
    <Badge bg={badge.bg} text={badge.text}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
