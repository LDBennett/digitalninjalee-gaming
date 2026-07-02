"use client";

import { ListChevronsDownUp, ListChevronsUpDown, NotebookPen } from "lucide-react";

interface Props {
  hasDescription: boolean;
  hasNote: boolean;
  showDesc: boolean;
  showNote: boolean;
  onToggleDesc: () => void;
  onToggleNote: () => void;
}

export function GameCardActions({
  hasDescription,
  hasNote,
  showDesc,
  showNote,
  onToggleDesc,
  onToggleNote,
}: Props) {
  if (!hasDescription && !hasNote) return null;

  return (
    <div className="mt-auto flex items-center gap-2 border-t border-gray-800/60 pt-3">
      {hasDescription && (
        <button
          onClick={onToggleDesc}
          className="flex items-center gap-2 rounded bg-gray-800/90 px-2 py-1 text-xs text-white transition-colors hover:text-gray-300"
        >
          {showDesc ? <ListChevronsDownUp size={16} /> : <ListChevronsUpDown size={16} />}
          Description
        </button>
      )}
      {hasNote && (
        <button
          onClick={onToggleNote}
          className="bg-brand-900/30 text-brand-300 hover:text-brand-200 flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors"
        >
          <NotebookPen size={14} />
          Note
        </button>
      )}
    </div>
  );
}
