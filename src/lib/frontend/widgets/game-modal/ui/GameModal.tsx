"use client";

import { ConfirmDialog, Modal } from "@/src/lib/frontend/shared";
import { useGameModalController } from "../hooks/useGameModalController";
import { GameModalEditor } from "./GameModal.Editor";
import { GameModalFooter } from "./GameModal.Footer";
import { GameModalSearchHero } from "./GameModal.SearchHero";
import { GameModalSkeleton } from "./GameModalSkeleton";
import {
  GameModalErrorState,
  GameModalNotFoundState,
} from "./GameModal.States";

import { GameModalOverlay } from "./GameModal.Overlay";

export function GameModal() {
  const {
    isOpen,
    mode,
    editGame,
    moods,
    activeTab,
    setActiveTab,
    close,
    addStage,
    setAddStage,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isPending,
    isError,
    refetch,
    handleDelete,
    form,
  } = useGameModalController();

  if (!isOpen) return null;

  const coverImage =
    form.backgroundUrl ||
    form.coverArtUrl ||
    editGame?.background_url ||
    editGame?.cover_art_url;

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
        overlay={<GameModalOverlay coverImage={coverImage} />}
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
