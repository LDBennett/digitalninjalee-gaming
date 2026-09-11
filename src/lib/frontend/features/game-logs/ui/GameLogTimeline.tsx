"use client";

import { useState, KeyboardEvent } from "react";
import { BookOpen, Send } from "lucide-react";
import { Button, GatedElement, useAuthStore } from "@/src/lib/frontend/shared";
import { useGameLogs } from "../hooks/useGameLogs";
import { GameLogTimelineEntry } from "./GameLogTimeline.Entry";

interface GameLogTimelineProps {
  gameId: string | null;
}

export function GameLogTimeline({ gameId }: GameLogTimelineProps) {
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const { session, openLoginModal } = useAuthStore();
  const isAuthenticated = Boolean(session);

  const {
    logs,
    logsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addNote,
    isAddingNote,
    updateNote,
    deleteNote,
  } = useGameLogs(gameId);

  const handleAddNote = async () => {
    if (!content.trim() || isAddingNote || !gameId) return;
    await addNote({ content: content.trim(), isPrivate: !isPublic });
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddNote();
    }
  };

  if (!gameId) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8 text-center text-gray-500">
        <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm">Save this game first to start tracking activity and notes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Add Composer */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3.5 space-y-2.5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Record a journal note or play progress... (Ctrl+Enter to post)"
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-800 bg-gray-950 p-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-700 bg-gray-900 text-brand-600 focus:ring-brand-500"
            />
            <span>Public Note</span>
            <span className="text-[11px] text-gray-500">
              (Visible to anyone browsing this game)
            </span>
          </label>

          <GatedElement
            isAuthenticated={isAuthenticated}
            onSignIn={openLoginModal}
          >
            <Button
              size="xs"
              variant="brand"
              onClick={handleAddNote}
              disabled={!content.trim() || isAddingNote}
              className="font-medium"
            >
              <Send className="mr-1 h-3 w-3" />
              {isAddingNote ? "Posting..." : "Post Note"}
            </Button>
          </GatedElement>
        </div>
      </div>

      {/* Timeline List */}
      {logsLoading ? (
        <div className="space-y-2 py-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-900" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-900" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center text-sm text-gray-500">
          No logs or milestones recorded yet. Add your first gaming note above!
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((entry) => (
            <GameLogTimelineEntry
              key={entry.id}
              entry={entry}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          ))}

          {hasNextPage && (
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-gray-400 hover:text-white"
              >
                {isFetchingNextPage ? "Loading earlier logs..." : "Load earlier logs"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
