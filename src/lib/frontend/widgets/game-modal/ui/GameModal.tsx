"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GameStatus } from "@/src/lib/backend/backlog/domain/models";
import { gameKeys } from "@/src/lib/backend/backlog/repository";
import { useGameQuery } from "@/src/lib/frontend/entities/game";
import {
  AddGamePayload,
  useAddGameForm,
} from "@/src/lib/frontend/features/add-game";
import {
  useGameActions,
  useMoods,
} from "@/src/lib/frontend/features/game-actions";
import {
  ConfirmDialog,
  Modal,
  useGameModalStore,
} from "@/src/lib/frontend/shared";
import { GameModalEditor } from "./GameModal.Editor";
import { GameModalFooter } from "./GameModal.Footer";
import { GameModalSearchHero } from "./GameModal.SearchHero";
import { GameModalSkeleton } from "./GameModalSkeleton";
import {
  GameModalErrorState,
  GameModalNotFoundState,
} from "./GameModal.States";

export function GameModal() {
  const {
    isOpen,
    mode,
    gameId,
    defaultStatus,
    activeTab,
    setActiveTab,
    close,
  } = useGameModalStore();

  const queryClient = useQueryClient();
  const { moods } = useMoods();
  const [addStage, setAddStage] = useState<"search" | "editor">("search");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && mode === "add") setAddStage("search");
  }, [isOpen, mode]);

  const { games, isPending, isError, refetch } = useGameQuery({
    enabled: isOpen && mode === "edit" && Boolean(gameId),
  });

  const editGame = useMemo(
    () =>
      mode === "edit" && gameId
        ? (games.find((g) => g.id === gameId) ?? null)
        : null,
    [games, mode, gameId],
  );

  const { handleAdd, handleEdit, handleDelete } = useGameActions({
    onAddSuccess: () =>
      queryClient.invalidateQueries({ queryKey: gameKeys.all }),
    onEditSuccess: () =>
      queryClient.invalidateQueries({ queryKey: gameKeys.all }),
    onDeleteSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      close();
    },
  });

  const onSave = async (data: AddGamePayload) => {
    if (mode === "edit" && editGame) {
      await handleEdit(editGame.id, data);
      close();
    } else {
      await handleAdd(data);
    }
  };

  const form = useAddGameForm({
    editGame,
    isOpen,
    defaultStatus: (defaultStatus as GameStatus) ?? "backlog",
    moods,
    onSave,
    onClose: close,
  });

  if (!isOpen) return null;

  const coverImage =
    form.backgroundUrl ||
    form.coverArtUrl ||
    editGame?.background_url ||
    editGame?.cover_art_url;

  const overlay = coverImage ? (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[400px] overflow-hidden select-none"
      style={{
        maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 35%, transparent 100%)",
      }}
    >
      <div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: `url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          opacity: 0.65,
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-gray-950/40 to-gray-900" />
      <div className="absolute inset-0 bg-linear-to-r from-gray-950/40 via-transparent to-gray-950/40" />
    </div>
  ) : null;

  if (mode === "edit") {
    if (isPending) {
      return (
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="Loading Game..."
          maxWidth="max-w-4xl"
        >
          <GameModalSkeleton />
        </Modal>
      );
    }
    if (isError) {
      return (
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="Error Loading Game"
          maxWidth="max-w-md"
        >
          <GameModalErrorState onRetry={() => refetch()} onClose={close} />
        </Modal>
      );
    }
    if (!editGame) {
      return (
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="Game Not Found"
          maxWidth="max-w-md"
        >
          <GameModalNotFoundState onClose={close} />
        </Modal>
      );
    }
  }

  const isAddMode = mode === "add";
  const modalTitle = isAddMode
    ? "Add Game"
    : `Edit ${editGame?.title ?? "Game"}`;

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={close}
      title={modalTitle}
      maxWidth="max-w-4xl"
      scrollable
      overlay={overlay}
      hideHeader
    >
      {isAddMode && addStage === "search" ? (
        <div className="flex-1 overflow-y-auto pt-4">
          <GameModalSearchHero
            form={form}
            onContinueToDetails={() => setAddStage("editor")}
          />
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit}
          className="relative flex flex-1 flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pt-8 pb-24 sm:pt-6 space-y-6">
            <GameModalEditor
              form={form}
              editGame={editGame}
              moods={moods}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              isAddMode={isAddMode}
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-gray-950 via-gray-950/90 to-transparent pt-12 pb-5 px-6">
            <div className="pointer-events-auto">
              <GameModalFooter
                isAddMode={isAddMode}
                addStage={addStage}
                onBackToSearch={() => setAddStage("search")}
                onDelete={
                  editGame ? () => setShowDeleteConfirm(true) : undefined
                }
                onSaveAndAdd={async () => {
                  await form.handleSubmitAndAdd();
                  setAddStage("search");
                }}
                saving={form.saving}
                isTitleEmpty={!form.title.trim()}
                onClose={close}
                submitLabel={isAddMode ? "Add Game" : "Save Changes"}
              />
            </div>
          </div>
        </form>
      )}
    </Modal>
    {editGame && (
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDelete(editGame.id)}
        title="Delete Game"
        description={
          <span>
            Are you sure you want to delete{" "}
            <strong className="text-white">"{editGame.title}"</strong> from
            your library? This cannot be undone.
          </span>
        }
        confirmLabel="Delete Game"
        variant="danger"
        icon="trash"
      />
    )}
  </>
  );
}
