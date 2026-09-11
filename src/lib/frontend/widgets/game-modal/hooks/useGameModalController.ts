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
import { useGameModalStore } from "@/src/lib/frontend/shared";

export function useGameModalController() {
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

  return {
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
  };
}
