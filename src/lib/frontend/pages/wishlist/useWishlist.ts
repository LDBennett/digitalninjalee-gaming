"use client";

import { useState, useEffect, useMemo } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import {
  WishlistTab,
  ALL_WISHLIST_STATUSES,
  WISHLIST_TAB_LABELS,
} from "@/src/lib/backend/backlog/domain/models";
import { useAuthStore } from "@/src/lib/frontend/shared/auth/auth.store";
import {
  useMoods,
  useGameActions,
  useGameQuery,
  useGamePriority,
} from "@/src/lib/frontend/features";
import { useClientPagination } from "@/src/lib/frontend/shared/hooks/useClientPagination";

export type { WishlistTab };
export { ALL_WISHLIST_STATUSES, WISHLIST_TAB_LABELS };

const WISHLIST_STATUS_LIST = ALL_WISHLIST_STATUSES.split(",");

export function useWishlist() {
  const { session } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [tab, setTab] = useState<WishlistTab>("all");
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const {
    games: allGames,
    gamesLoading,
    invalidate,
    queryKey,
  } = useGameQuery();
  const games = useMemo(() => {
    const wishlist = allGames.filter((g) =>
      WISHLIST_STATUS_LIST.includes(g.status),
    );
    return tab === "all" ? wishlist : wishlist.filter((g) => g.status === tab);
  }, [allGames, tab]);
  const { page, setPage, totalPages, paginated } = useClientPagination(games);
  const { handlePriorityChange } = useGamePriority(queryKey);

  useEffect(() => {
    setPage(1);
  }, [tab, setPage]);

  const { handleAdd, handleStatusChange, handleEdit, handleDelete } =
    useGameActions({
      onAddSuccess: invalidate,
      onStatusSuccess: invalidate,
      onEditSuccess: () => {
        setEditGame(null);
        invalidate();
      },
      onDeleteSuccess: invalidate,
    });

  const handleDeleteConfirm = (id: string) => {
    if (!confirm("Remove this game from your wishlist?")) return;
    handleDelete(id);
  };

  const handleEditSubmit = (data: object) => {
    if (!editGame) return;
    handleEdit(editGame.id, data);
  };

  return {
    games,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    tab,
    setTab,
    editGame,
    setEditGame,
    showAdd,
    setShowAdd,
    gamesLoading,
    isAuthenticated,
    handleAdd,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
    handleStatusChange,
    handlePriorityChange: (id: string, delta: number) =>
      handlePriorityChange(id, delta, games),
  };
}
