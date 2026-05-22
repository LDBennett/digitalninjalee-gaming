"use client";

import {
  GameDto,
  GameStatus,
  STATUS_LABELS,
} from "@/src/domains/backlog/models/game.types";
import { MoodBadge } from "@/src/domains/backlog/components/MoodBadge";
import { PlatformBadge } from "@/src/domains/backlog/components/PlatformBadge";

type StatusAction = { label: string; status: GameStatus; color: string };

const STATUS_ACTIONS: Record<GameStatus, StatusAction[]> = {
  backlog: [
    {
      label: "Start Playing",
      status: "playing",
      color: "text-green-400 hover:text-green-300",
    },
  ],
  playing: [
    {
      label: "Completed 100%",
      status: "completed",
      color: "text-blue-400 hover:text-blue-300",
    },
    {
      label: "Main Story Done",
      status: "main-complete",
      color: "text-teal-400 hover:text-teal-300",
    },
    {
      label: "Make Ongoing",
      status: "ongoing",
      color: "text-cyan-400 hover:text-cyan-300",
    },
    {
      label: "Drop",
      status: "dropped",
      color: "text-gray-400 hover:text-gray-300",
    },
  ],
  completed: [],
  dropped: [
    {
      label: "Return to Backlog",
      status: "backlog",
      color: "text-purple-400 hover:text-purple-300",
    },
  ],
  "main-complete": [
    {
      label: "Continue Playing",
      status: "playing",
      color: "text-green-400 hover:text-green-300",
    },
    {
      label: "Make Ongoing",
      status: "ongoing",
      color: "text-cyan-400 hover:text-cyan-300",
    },
    {
      label: "Mark 100%",
      status: "completed",
      color: "text-blue-400 hover:text-blue-300",
    },
  ],
  ongoing: [
    {
      label: "Mark Complete",
      status: "completed",
      color: "text-blue-400 hover:text-blue-300",
    },
    {
      label: "Drop",
      status: "dropped",
      color: "text-gray-400 hover:text-gray-300",
    },
  ],
  interested: [
    {
      label: "Bought It!",
      status: "backlog",
      color: "text-green-400 hover:text-green-300",
    },
    {
      label: "Pre-Order",
      status: "pre-ordered",
      color: "text-yellow-400 hover:text-yellow-300",
    },
    {
      label: "Keep an Eye On",
      status: "keep-an-eye-on",
      color: "text-gray-400 hover:text-gray-300",
    },
  ],
  "pre-ordered": [
    {
      label: "It Released!",
      status: "backlog",
      color: "text-green-400 hover:text-green-300",
    },
    {
      label: "Just Interested",
      status: "interested",
      color: "text-purple-400 hover:text-purple-300",
    },
    {
      label: "Keep an Eye On",
      status: "keep-an-eye-on",
      color: "text-gray-400 hover:text-gray-300",
    },
  ],
  "keep-an-eye-on": [
    {
      label: "Now Interested",
      status: "interested",
      color: "text-purple-400 hover:text-purple-300",
    },
    {
      label: "Pre-Order",
      status: "pre-ordered",
      color: "text-yellow-400 hover:text-yellow-300",
    },
  ],
};

const STATUS_BADGE: Record<GameStatus, { bg: string; text: string }> = {
  backlog: { bg: "bg-gray-800", text: "text-gray-400" },
  playing: { bg: "bg-green-900/40", text: "text-green-400" },
  completed: { bg: "bg-blue-900/40", text: "text-blue-400" },
  dropped: { bg: "bg-gray-800", text: "text-gray-500" },
  "main-complete": { bg: "bg-teal-900/40", text: "text-teal-400" },
  ongoing: { bg: "bg-cyan-900/40", text: "text-cyan-400" },
  interested: { bg: "bg-purple-900/40", text: "text-purple-400" },
  "pre-ordered": { bg: "bg-yellow-900/40", text: "text-yellow-400" },
  "keep-an-eye-on": { bg: "bg-gray-800", text: "text-gray-400" },
};

interface GameCardProps {
  game: GameDto;
  onEdit?: (game: GameDto) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: GameStatus) => void;
  onPriorityChange?: (id: string, delta: number) => void;
  showPriority?: boolean;
  showActions?: boolean;
  showStatusBadge?: boolean;
}

export function GameCard({
  game,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  showPriority = false,
  showActions = true,
  showStatusBadge = false,
}: GameCardProps) {
  const moods = game.moods ?? [];
  const actions = STATUS_ACTIONS[game.status] ?? [];
  const badge = STATUS_BADGE[game.status];

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-purple-800/70 rounded-xl overflow-hidden transition-all duration-200">
      <div className="flex gap-4 p-4">
        <div className="bg-gray-800 rounded-lg w-14 h-20 overflow-hidden shrink-0">
          {game.cover_url ? (
            <img
              src={game.cover_url}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center bg-gradient-to-br from-purple-900 to-blue-900 w-full h-full">
              <span className="font-bold text-white/30 text-2xl">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-white text-sm truncate leading-snug">
              {game.title}
            </h3>

            {showPriority && onPriorityChange && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onPriorityChange(game.id, 10)}
                  className="px-1 text-gray-600 hover:text-purple-400 text-xs transition-colors"
                  title="Raise priority"
                >
                  ▲
                </button>
                <span className="w-6 font-mono text-gray-500 text-xs text-center">
                  {game.priority_score}
                </span>
                <button
                  onClick={() => onPriorityChange(game.id, -10)}
                  className="px-1 text-gray-600 hover:text-red-400 text-xs transition-colors"
                  title="Lower priority"
                >
                  ▼
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <PlatformBadge platform={game.platform} />
            {showStatusBadge && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
              >
                {STATUS_LABELS[game.status]}
              </span>
            )}
            {game.last_played_at && (
              <span className="text-gray-600 text-xs">
                {new Date(game.last_played_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {moods.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {moods.map((mood) => (
                <MoodBadge key={mood.id} mood={mood.name} />
              ))}
            </div>
          )}

          {showActions &&
            ((actions.length > 0 && !!onStatusChange) ||
              onEdit ||
              onDelete) && (
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-gray-800/60 border-t">
                {onStatusChange &&
                  actions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => onStatusChange(game.id, action.status)}
                      className={`text-xs font-medium transition-colors ${action.color}`}
                    >
                      {action.label}
                    </button>
                  ))}
                <div className="flex items-center gap-3 ml-auto">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(game)}
                      className="text-gray-500 hover:text-white text-xs transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(game.id)}
                      className="text-gray-700 hover:text-red-400 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
