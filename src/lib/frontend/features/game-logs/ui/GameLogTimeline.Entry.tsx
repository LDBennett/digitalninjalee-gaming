"use client";

import { GameLogEntry } from "@/src/lib/backend/backlog/domain/models";
import { GameLogTimelineNoteItem } from "./GameLogTimeline.NoteItem";
import { GameLogTimelineEventItem } from "./GameLogTimeline.EventItem";

interface GameLogTimelineEntryProps {
  entry: GameLogEntry;
  onUpdateNote?: (args: {
    logId: string;
    content?: string;
    isPrivate?: boolean;
  }) => Promise<unknown>;
  onDeleteNote?: (logId: string) => Promise<unknown>;
}

export function GameLogTimelineEntry({
  entry,
  onUpdateNote,
  onDeleteNote,
}: GameLogTimelineEntryProps) {
  if (entry.type === "note") {
    return (
      <GameLogTimelineNoteItem
        entry={entry}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
      />
    );
  }

  return <GameLogTimelineEventItem entry={entry} />;
}
