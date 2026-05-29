"use client";

import { Info, ListChevronsDownUp, ListChevronsUpDown, NotebookPen } from "lucide-react";
import { GameStatus } from "@/src/lib/backend/backlog/domain/models";

type StatusAction = { label: string; status: GameStatus; color: string };

export const STATUS_ACTIONS: Record<GameStatus, StatusAction[]> = {
  backlog: [
    { label: "Start Playing",    status: "playing",   color: "text-green-400 hover:text-green-300" },
  ],
  playing: [
    { label: "Completed 100%",   status: "completed",      color: "text-blue-400 hover:text-blue-300"   },
    { label: "Main Story Done",  status: "main-complete",  color: "text-teal-400 hover:text-teal-300"   },
    { label: "Make Ongoing",     status: "ongoing",        color: "text-cyan-400 hover:text-cyan-300"   },
    { label: "Return to Backlog",status: "backlog",        color: "text-brand-400 hover:text-brand-300" },
    { label: "Drop",             status: "dropped",        color: "text-gray-400 hover:text-gray-300"   },
  ],
  completed: [],
  dropped: [
    { label: "Return to Backlog",status: "backlog",        color: "text-brand-400 hover:text-brand-300" },
  ],
  "main-complete": [
    { label: "Continue Playing", status: "playing",        color: "text-green-400 hover:text-green-300" },
    { label: "Make Ongoing",     status: "ongoing",        color: "text-cyan-400 hover:text-cyan-300"   },
    { label: "Mark 100%",        status: "completed",      color: "text-blue-400 hover:text-blue-300"   },
  ],
  ongoing: [
    { label: "Complete",         status: "completed",      color: "text-blue-400 hover:text-blue-300"   },
    { label: "Dropped",          status: "dropped",        color: "text-gray-400 hover:text-gray-300"   },
  ],
  interested: [
    { label: "Start Playing",    status: "playing",        color: "text-green-400 hover:text-green-300" },
    { label: "Bought It!",       status: "backlog",        color: "text-brand-400 hover:text-brand-300" },
    { label: "Pre-Order",        status: "pre-ordered",    color: "text-yellow-400 hover:text-yellow-300"},
    { label: "Keep an Eye On",   status: "keep-an-eye-on", color: "text-gray-400 hover:text-gray-300"   },
  ],
  "pre-ordered": [
    { label: "Start Playing",    status: "playing",        color: "text-green-400 hover:text-green-300" },
    { label: "It Released!",     status: "backlog",        color: "text-brand-400 hover:text-brand-300" },
    { label: "Just Interested",  status: "interested",     color: "text-brand-400 hover:text-brand-300" },
    { label: "Keep an Eye On",   status: "keep-an-eye-on", color: "text-gray-400 hover:text-gray-300"   },
  ],
  "keep-an-eye-on": [
    { label: "Now Interested",   status: "interested",     color: "text-brand-400 hover:text-brand-300" },
    { label: "Pre-Order",        status: "pre-ordered",    color: "text-yellow-400 hover:text-yellow-300"},
  ],
};

interface Props {
  gameId: string;
  gameStatus: GameStatus;
  hasDescription: boolean;
  hasNote: boolean;
  showDesc: boolean;
  showNote: boolean;
  showActions: boolean;
  showStatusSelect: boolean;
  onToggleDesc: () => void;
  onToggleNote: () => void;
  onToggleStatusSelect: () => void;
  onStatusChange?: (id: string, status: GameStatus) => void;
}

export function GameCardActions({
  gameId,
  gameStatus,
  hasDescription,
  hasNote,
  showDesc,
  showNote,
  showActions,
  showStatusSelect,
  onToggleDesc,
  onToggleNote,
  onToggleStatusSelect,
  onStatusChange,
}: Props) {
  const actions = STATUS_ACTIONS[gameStatus] ?? [];

  const showFooter =
    (showActions && actions.length > 0 && !!onStatusChange) ||
    hasDescription ||
    hasNote;

  if (!showFooter) return null;

  return (
    <div className="flex items-center gap-2 mt-auto pt-3 border-gray-800/60 border-t">
      {hasDescription && (
        <button
          onClick={onToggleDesc}
          className="flex items-center gap-2 bg-gray-800/90 px-2 py-1 rounded text-white hover:text-gray-300 text-xs transition-colors"
        >
          {showDesc ? <ListChevronsDownUp size={16} /> : <ListChevronsUpDown size={16} />}
          Description
        </button>
      )}
      {hasNote && (
        <button
          onClick={onToggleNote}
          className="flex items-center gap-2 bg-brand-900/30 px-2 py-1 rounded text-brand-300 hover:text-brand-200 text-xs transition-colors"
        >
          <NotebookPen size={14} />
          Note
        </button>
      )}
      <div className="ml-auto">
        {showActions && actions.length > 0 && !!onStatusChange && (
          <>
            {showStatusSelect ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">Mark as:</span>
                <select
                  autoFocus
                  defaultValue=""
                  onBlur={onToggleStatusSelect}
                  onChange={(e) => {
                    if (e.target.value) {
                      onStatusChange(gameId, e.target.value as GameStatus);
                    }
                    onToggleStatusSelect();
                  }}
                  className="bg-gray-800 px-2 py-0.5 border border-brand-600 rounded focus:outline-none text-gray-300 text-xs cursor-pointer"
                >
                  <option value="" disabled>Select...</option>
                  {actions.map((action) => (
                    <option key={action.status} value={action.status}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <button
                onClick={onToggleStatusSelect}
                className="flex items-center gap-1 text-gray-500 hover:text-brand-400 text-xs align-bottom transition-colors"
              >
                <Info size={16} />
                Status
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
