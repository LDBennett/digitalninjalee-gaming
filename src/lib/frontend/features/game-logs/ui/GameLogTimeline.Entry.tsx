"use client";

import { useState } from "react";
import {
  Sparkles,
  Zap,
  Star,
  Lock,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
} from "lucide-react";
import {
  GameLogEntry,
  scoreToTier,
} from "@/src/lib/backend/backlog/domain/models";
import { GameStatusBadge } from "@/src/lib/frontend/entities/game";
import {
  formatRelativeTime,
  Button,
  ConfirmDialog,
  useAuthStore,
} from "@/src/lib/frontend/shared";

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
  const { user } = useAuthStore();
  const isAuthor = Boolean(user && entry.userId && user.id === entry.userId);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content ?? "");
  const [editPrivate, setEditPrivate] = useState(entry.isPrivate);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdited =
    entry.type === "note" &&
    new Date(entry.updatedAt).getTime() >
      new Date(entry.createdAt).getTime() + 1000;

  const handleSave = async () => {
    if (!editContent.trim() || !onUpdateNote) return;
    setSaving(true);
    try {
      await onUpdateNote({
        logId: entry.id,
        content: editContent.trim(),
        isPrivate: editPrivate,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteNote) return;
    setDeleting(true);
    try {
      await onDeleteNote(entry.id);
    } finally {
      setDeleting(false);
    }
  };

  if (entry.type === "note") {
    return (
      <div className="group relative rounded-xl border border-gray-800 bg-gray-900/60 p-3.5 transition-colors hover:border-gray-700">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-300">Journal Note</span>
            <span>•</span>
            <span title={new Date(entry.createdAt).toLocaleString()}>
              {formatRelativeTime(entry.createdAt)}
            </span>
            {isEdited && <span className="text-gray-500 italic">(edited)</span>}
            {entry.isPrivate && (
              <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-400">
                <Lock className="h-2.5 w-2.5" /> Private
              </span>
            )}
          </div>
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                title="Edit note"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400 cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2.5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="focus:border-brand-500 w-full rounded-lg border border-gray-700 bg-gray-950 p-2.5 text-sm text-gray-200 focus:outline-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={!editPrivate}
                  onChange={(e) => setEditPrivate(!e.target.checked)}
                  className="text-brand-600 focus:ring-brand-500 rounded border-gray-700 bg-gray-900"
                />
                <span>Public (Visible to anyone browsing this game)</span>
              </label>
              <div className="flex gap-1.5">
                <Button
                  size="xs"
                  variant="gray"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-1 h-3 w-3" /> Cancel
                </Button>
                <Button
                  size="xs"
                  variant="brand"
                  onClick={handleSave}
                  disabled={saving || !editContent.trim()}
                >
                  <Check className="mr-1 h-3 w-3" /> Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap text-gray-200">
            {entry.content}
          </p>
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Journal Note"
          description="Are you sure you want to delete this journal note? This cannot be undone."
          confirmLabel="Delete Note"
          variant="danger"
          icon="trash"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-950/40 px-3 py-2 text-xs text-gray-400">
      <div className="flex items-center gap-2">
        {entry.type === "created" && (
          <>
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              Added to library (
              <span className="font-medium text-gray-300 uppercase">
                {entry.metadata.platform}
              </span>
              ) with status:
            </span>
            <GameStatusBadge status={entry.metadata.initial_status} />
          </>
        )}

        {entry.type === "status_change" && (
          <>
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Status changed:</span>
            <GameStatusBadge status={entry.metadata.old_status} />
            <span className="text-gray-500">→</span>
            <GameStatusBadge status={entry.metadata.new_status} />
          </>
        )}

        {entry.type === "priority_change" && (
          <>
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <PriorityChangeContent
              oldScore={entry.metadata.old_priority}
              newScore={entry.metadata.new_priority}
            />
          </>
        )}

        {entry.type === "rating_change" && (
          <>
            <Star className="h-3.5 w-3.5 text-yellow-400" />
            <span>
              Rating updated to{" "}
              <span className="font-semibold text-yellow-300">
                {entry.metadata.new_rating
                  ? `${entry.metadata.new_rating} ★`
                  : "None"}
              </span>
            </span>
          </>
        )}
      </div>

      <span
        title={new Date(entry.createdAt).toLocaleString()}
        className="shrink-0 text-[11px] text-gray-500"
      >
        {formatRelativeTime(entry.createdAt)}
      </span>
    </div>
  );
}

function PriorityChangeContent({
  oldScore,
  newScore,
}: {
  oldScore: number;
  newScore: number;
}) {
  const oldTier = scoreToTier(oldScore);
  const newTier = scoreToTier(newScore);

  if (oldTier.id === newTier.id) {
    return (
      <span>
        Priority adjusted:{" "}
        <span className={`font-semibold ${newTier.pillText}`}>
          {newTier.label}
        </span>{" "}
        <span className="text-gray-400">
          ({oldScore} → {newScore})
        </span>
      </span>
    );
  }

  return (
    <span>
      Priority changed:{" "}
      <span className={`font-medium ${oldTier.pillText}`}>
        {oldTier.label} ({oldScore})
      </span>{" "}
      <span className="text-gray-500">→</span>{" "}
      <span className={`font-semibold ${newTier.pillText}`}>
        {newTier.label} ({newScore})
      </span>
    </span>
  );
}
