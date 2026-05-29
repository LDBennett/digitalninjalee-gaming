"use client";

import {
  GameStatus,
  STATUS_LABELS,
} from "@/src/lib/backend/backlog/domain/models";

const STATUS_BADGE: Record<GameStatus, { bg: string; text: string }> = {
  backlog: { bg: "bg-gray-800", text: "text-gray-400" },
  playing: { bg: "bg-green-900/40", text: "text-green-400" },
  completed: { bg: "bg-blue-900/40", text: "text-blue-400" },
  dropped: { bg: "bg-gray-800", text: "text-gray-500" },
  "main-complete": { bg: "bg-teal-900/40", text: "text-teal-400" },
  ongoing: { bg: "bg-cyan-900/40", text: "text-cyan-400" },
  interested: { bg: "bg-brand-900/40", text: "text-brand-400" },
  "pre-ordered": { bg: "bg-yellow-900/40", text: "text-yellow-400" },
  "keep-an-eye-on": { bg: "bg-gray-800", text: "text-gray-400" },
};

export { STATUS_BADGE };

export function GameStatusBadge({ status }: { status: GameStatus }) {
  const badge = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
