'use client';

import { useState, useEffect } from 'react';
import { GameDto } from '@/src/domains/games/models/game.types';
import { useAuthStore } from '@/src/domains/shared/auth/auth.store';
import { useMoods } from '@/src/domains/games/hooks/useMoods';
import { useGameActions } from '@/src/domains/games/hooks/useGameActions';
import { useGameQuery } from '@/src/domains/games/hooks/useGameQuery';
import { useGamePriority } from '@/src/domains/games/hooks/useGamePriority';
import { useClientPagination } from '@/src/domains/shared/hooks/useClientPagination';

export type WishlistTab = 'interested' | 'pre-ordered' | 'keep-an-eye-on' | 'all';

export const WISHLIST_TAB_LABELS: Record<WishlistTab, string> = {
  all:              'All',
  interested:       'Interested',
  'pre-ordered':    'Pre-Ordered',
  'keep-an-eye-on': 'Keep an Eye On',
};

export const ALL_WISHLIST_STATUSES = 'interested,pre-ordered,keep-an-eye-on';

export function useWishlist() {
  const { session } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [tab, setTab] = useState<WishlistTab>('all');
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const statusParam = tab === 'all' ? ALL_WISHLIST_STATUSES : tab;

  const { games, gamesLoading, invalidate, queryKey } = useGameQuery(statusParam);
  const { page, setPage, totalPages, paginated } = useClientPagination(games);
  const { handlePriorityChange } = useGamePriority(queryKey);

  useEffect(() => { setPage(1); }, [tab, setPage]);

  const { handleAdd, handleStatusChange, handleEdit, handleDelete } = useGameActions({
    onAddSuccess: invalidate,
    onStatusSuccess: invalidate,
    onEditSuccess: () => {
      setEditGame(null);
      invalidate();
    },
    onDeleteSuccess: invalidate,
  });

  const handleDeleteConfirm = (id: string) => {
    if (!confirm('Remove this game from your wishlist?')) return;
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
