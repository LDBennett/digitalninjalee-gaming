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
import { Modal, useGameModalStore } from "@/src/lib/frontend/shared";
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

  useEffect(() => {
    if (isOpen && mode === "add") setAddStage("search");
  }, [isOpen, mode]);

  const { games, isPending, isError, refetch } = useGameQuery({
    enabled: isOpen && mode === "edit" && Boolean(gameId),
  });

  const editGame = useMemo(
    () =>
      mode === "edit" && gameId
        ? games.find((g) => g.id === gameId) ?? null
        : null,
    [games, mode, gameId],
  );

  const { handleAdd, handleEdit, handleDelete } = useGameActions({
    onAddSuccess: () => queryClient.invalidateQueries({ queryKey: gameKeys.all }),
    onEditSuccess: () => queryClient.invalidateQueries({ queryKey: gameKeys.all }),
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
    <>
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "blur(10px)",
          opacity: 0.35,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/95 to-gray-900" />
    </>
  ) : null;

  if (mode === "edit") {
    if (isPending) {
      return (
        <Modal isOpen={isOpen} onClose={close} title="Loading Game..." maxWidth="max-w-4xl">
          <GameModalSkeleton />
        </Modal>
      );
    }
    if (isError) {
      return (
        <Modal isOpen={isOpen} onClose={close} title="Error Loading Game" maxWidth="max-w-md">
          <GameModalErrorState onRetry={() => refetch()} onClose={close} />
        </Modal>
      );
    }
    if (!editGame) {
      return (
        <Modal isOpen={isOpen} onClose={close} title="Game Not Found" maxWidth="max-w-md">
          <GameModalNotFoundState onClose={close} />
        </Modal>
      );
    }
  }

  const isAddMode = mode === "add";
  const modalTitle = isAddMode ? "Add Game" : `Edit ${editGame?.title ?? "Game"}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={modalTitle}
      maxWidth="max-w-4xl"
      scrollable
      overlay={overlay}
    >
      {isAddMode && addStage === "search" ? (
        <GameModalSearchHero
          form={form}
          onContinueToDetails={() => setAddStage("editor")}
        />
      ) : (
        <form onSubmit={form.handleSubmit} className="p-6 space-y-6">
          <GameModalEditor
            form={form}
            editGame={editGame}
            moods={moods}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            isAddMode={isAddMode}
          />
          <GameModalFooter
            isAddMode={isAddMode}
            addStage={addStage}
            onBackToSearch={() => setAddStage("search")}
            onDelete={
              editGame
                ? () => {
                    if (window.confirm(`Delete "${editGame.title}" from your library?`)) {
                      handleDelete(editGame.id);
                    }
                  }
                : undefined
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
        </form>
      )}
    </Modal>
  );
}
