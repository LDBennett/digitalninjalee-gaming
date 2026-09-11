"use client";

import { useState } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { useGameActions } from "./useGameActions";

export interface UseGameEditActionsOptions {
  invalidate: () => void;
  deleteConfirmMessage?: string;
}

export function useGameEditActions({
  invalidate,
  deleteConfirmMessage = "Delete this game?",
}: UseGameEditActionsOptions) {
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { handleAdd, handleEdit, handleDelete } = useGameActions({
    onAddSuccess: invalidate,
    onEditSuccess: () => {
      setEditGame(null);
      invalidate();
    },
    onDeleteSuccess: invalidate,
  });

  const handleDeleteGame = (id: string) => {
    handleDelete(id);
  };

  const handleEditSubmit = (data: object) => {
    if (!editGame) return;
    handleEdit(editGame.id, data);
  };

  return {
    editGame,
    setEditGame,
    handleAdd,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteGame,
  };
}
