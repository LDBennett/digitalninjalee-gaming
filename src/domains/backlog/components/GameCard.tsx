"use client";

import { useState } from "react";
import { Info, Pencil, PenLine } from "lucide-react";
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
      label: "Return to Backlog",
      status: "backlog",
      color: "text-brand-400 hover:text-brand-300",
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
      color: "text-brand-400 hover:text-brand-300",
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
      label: "Complete",
      status: "completed",
      color: "text-blue-400 hover:text-blue-300",
    },
    {
      label: "Dropped",
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
      color: "text-brand-400 hover:text-brand-300",
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
      color: "text-brand-400 hover:text-brand-300",
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
  interested: { bg: "bg-brand-900/40", text: "text-brand-400" },
  "pre-ordered": { bg: "bg-yellow-900/40", text: "text-yellow-400" },
  "keep-an-eye-on": { bg: "bg-gray-800", text: "text-gray-400" },
};

interface GameCardProps {
  game: GameDto;
  onEdit?: (game: GameDto) => void;
  onStatusChange?: (id: string, status: GameStatus) => void;
  onPriorityChange?: (id: string, delta: number) => void;
  showPriority?: boolean;
  showActions?: boolean;
  showStatusBadge?: boolean;
}

export function GameCard({
  game,
  onEdit,
  onStatusChange,
  onPriorityChange,
  showPriority = false,
  showActions = true,
  showStatusBadge = false,
}: GameCardProps) {
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const moods = game.moods ?? [];
  const actions = STATUS_ACTIONS[game.status] ?? [];
  const badge = STATUS_BADGE[game.status];
  const coverImage = game.cover_url || game.cover_art_url;

  return (
    <div className="relative bg-gray-900 border border-gray-800 hover:border-brand-800/70 rounded-xl min-h-35 overflow-hidden transition-all duration-200">
      {coverImage && (
        <>
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(17,24,39,0.5) 0%, rgba(17,24,39,0.88) 45%, rgba(17,24,39,0.97) 100%)",
            }}
          />
        </>
      )}
      <div className="relative flex gap-4 p-4">
        <div className="bg-gray-800 rounded-lg w-20 h-30 overflow-hidden shrink-0">
          {game.cover_art_url ? (
            <img
              src={game.cover_art_url}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center bg-linear-to-br from-brand-900 to-blue-900 w-full h-full">
              <span className="font-bold text-white/30 text-2xl">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-white text-sm truncate leading-snug">
              {game.title}
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(game)}
                  title="Edit game"
                  className="text-gray-600 hover:text-brand-400 transition-colors"
                >
                  <Pencil size={13} />
                </button>
              )}
              {showPriority && onPriorityChange && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPriorityChange(game.id, 10)}
                    className="px-1 text-gray-600 hover:text-brand-400 text-xs transition-colors"
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
          </div>

          {moods.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {moods.map((mood) => (
                <MoodBadge key={mood.id} mood={mood.name} />
              ))}
            </div>
          )}

          {showActions && actions.length > 0 && !!onStatusChange && (
            <div className="flex items-center mt-auto pt-3 border-gray-800/60 border-t">
              <div className="ml-auto">
                {showStatusSelect ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">Mark as:</span>
                    <select
                      autoFocus
                      defaultValue=""
                      onBlur={() => setShowStatusSelect(false)}
                      onChange={(e) => {
                        if (e.target.value) {
                          onStatusChange(game.id, e.target.value as GameStatus);
                        }
                        setShowStatusSelect(false);
                      }}
                      className="bg-gray-800 px-2 py-0.5 border border-brand-600 rounded focus:outline-none text-gray-300 text-xs cursor-pointer"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      {actions.map((action) => (
                        <option key={action.status} value={action.status}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowStatusSelect(true)}
                    className="flex items-center gap-1 text-gray-500 hover:text-brand-400 text-xs align-bottom transition-colors"
                  >
                    <Info size={16} />
                    Status
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
