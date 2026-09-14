"use client";

import { useMutation } from "@tanstack/react-query";
import { GameStatus } from "@/src/lib/backend/backlog/domain/models";
import { useAuthFetch } from "@/src/lib/frontend/shared";

export interface GameActionsOptions {
  onAddSuccess?: () => void;
  onStatusSuccess?: () => void;
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onPrioritySuccess?: () => void;
  buildStatusUpdates?: (status: GameStatus) => Record<string, unknown>;
}

const defaultBuildStatusUpdates = (
  status: GameStatus,
): Record<string, unknown> => {
  const updates: Record<string, unknown> = { status };
  if (status === "playing") updates.last_played_at = new Date().toISOString();
  return updates;
};

export function useGameActions(options: GameActionsOptions = {}) {
  const { authJsonFetch, authDelete } = useAuthFetch();
  const {
    onAddSuccess,
    onStatusSuccess,
    onEditSuccess,
    onDeleteSuccess,
    onPrioritySuccess,
    buildStatusUpdates = defaultBuildStatusUpdates,
  } = options;

  const addMutation = useMutation({
    mutationFn: (data: object) => authJsonFetch("/api/games", "POST", data),
    onSuccess: onAddSuccess,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GameStatus }) =>
      authJsonFetch(`/api/games/${id}`, "PUT", buildStatusUpdates(status)),
    onSuccess: onStatusSuccess,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      authJsonFetch(`/api/games/${id}`, "PUT", data),
    onSuccess: onEditSuccess,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authDelete(`/api/games/${id}`),
    onSuccess: onDeleteSuccess,
  });

  const priorityMutation = useMutation({
    mutationFn: ({ id, newScore }: { id: string; newScore: number }) =>
      authJsonFetch(`/api/games/${id}`, "PUT", { priority_score: newScore }),
    onSuccess: onPrioritySuccess,
  });

  return {
    handleAdd: (data: object) => addMutation.mutateAsync(data),
    handleStatusChange: (id: string, status: GameStatus) =>
      statusMutation.mutate({ id, status }),
    handleEdit: (id: string, data: object) => editMutation.mutateAsync({ id, data }),
    handleDelete: (id: string) => deleteMutation.mutate(id),
    handlePriorityChange: (id: string, newScore: number) =>
      priorityMutation.mutate({ id, newScore }),
  };
}
