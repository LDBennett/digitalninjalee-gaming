"use client";

import { Trash2 } from "lucide-react";
import {
  GameDto,
  GameStatus,
  MoodDto,
} from "@/src/lib/backend/backlog/domain/models";
import { AddGamePayload } from "@/src/lib/frontend/features/add-game/types";
import { useAddGameForm } from "@/src/lib/frontend/features/add-game/hooks/useAddGameForm";
import { Button, Modal } from "@/src/lib/frontend/shared";
import { GameTitleSearch } from "./AddGameModal.TitleSearch";
import { SelectedGamePreview } from "./AddGameModal.Preview";
import { AddGameFormFields } from "./AddGameFormFields";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddGamePayload) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  editGame?: GameDto | null;
  moods: MoodDto[];
  defaultStatus?: GameStatus;
}

export function AddGameModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editGame,
  moods,
  defaultStatus = "backlog",
}: AddGameModalProps) {
  const form = useAddGameForm({
    editGame,
    isOpen,
    defaultStatus,
    onSave,
    onClose,
  });

  const coverImage =
    form.backgroundUrl ||
    form.coverArtUrl ||
    editGame?.background_url ||
    editGame?.cover_art_url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editGame ? "Edit Game" : "Add Game"}
      maxWidth="max-w-2xl"
      scrollable
      overlay={
        coverImage && (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                filter: "blur(6px)",
                opacity: 0.6,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(17,24,39,0.35) 0%, rgba(17,24,39,0.88) 55%, rgba(17,24,39,0.96) 100%)",
              }}
            />
          </>
        )
      }
    >
      <form onSubmit={form.handleSubmit} className="space-y-4 p-5">
        <GameTitleSearch
          value={form.title}
          onChange={(val) => {
            form.setTitle(val);
            form.setIgdbId(null);
            form.setBackgroundUrl("");
          }}
          onSelect={form.handleIgdbSelect}
          results={form.igdbResults}
          showDropdown={form.showDropdown}
          onDropdownChange={form.setShowDropdown}
          searchLoading={form.searchLoading}
          isEditing={!!editGame}
        />

        {!editGame && (form.coverArtUrl || form.backgroundUrl) && (
          <SelectedGamePreview form={form} />
        )}

        <AddGameFormFields form={form} editGame={editGame} moods={moods} />

        <div className="flex justify-between gap-3 pt-1">
          {editGame && onDelete && (
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={async () => {
                await onDelete(editGame.id);
                onClose();
              }}
              className="font-medium"
            >
              Delete
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            {!editGame && (
              <Button
                variant="gray-dark"
                onClick={form.handleSubmitAndAdd}
                disabled={form.saving || !form.title.trim()}
                className="font-medium"
              >
                {form.saving ? "Saving…" : "Save & Add Another"}
              </Button>
            )}
            <Button
              type="submit"
              variant="brand"
              size="md"
              disabled={form.saving || !form.title.trim()}
              className="font-medium px-5"
            >
              {form.saving ? "Saving…" : editGame ? "Update" : "Add Game"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
