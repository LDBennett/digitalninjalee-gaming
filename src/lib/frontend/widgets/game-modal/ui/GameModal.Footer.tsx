"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/src/lib/frontend/shared";

interface GameModalFooterProps {
  isAddMode: boolean;
  addStage: "search" | "editor";
  onBackToSearch?: () => void;
  onDelete?: () => void;
  onSaveAndAdd?: () => void;
  saving: boolean;
  isTitleEmpty: boolean;
  onClose: () => void;
  submitLabel: string;
}

export function GameModalFooter({
  isAddMode,
  addStage,
  onBackToSearch,
  onDelete,
  onSaveAndAdd,
  saving,
  isTitleEmpty,
  onClose,
  submitLabel,
}: GameModalFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {!isAddMode && onDelete && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={<Trash2 size={15} />}
            onClick={onDelete}
            disabled={saving}
          >
            Delete
          </Button>
        )}

        {isAddMode && addStage === "editor" && onBackToSearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToSearch}
            className="text-xs text-gray-400 hover:text-white"
          >
            &larr; Search Catalog
          </Button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>

        {isAddMode && addStage === "editor" && onSaveAndAdd && (
          <Button
            type="button"
            variant="gray-dark"
            size="sm"
            onClick={onSaveAndAdd}
            disabled={saving || isTitleEmpty}
          >
            {saving ? "Saving…" : "Save & Add Another"}
          </Button>
        )}

        {(addStage === "editor" || !isAddMode) && (
          <Button
            type="submit"
            variant="brand"
            size="sm"
            disabled={saving || isTitleEmpty}
            className="px-5 font-semibold"
          >
            {saving ? "Saving…" : submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
