'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto } from '@/src/domains/backlog/models/game.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { useAuthFetch } from '@/src/domains/shared/auth/useAuthFetch';
import { useMoods } from '@/src/domains/backlog/hooks/useMoods';
import { useGameActions } from '@/src/domains/backlog/hooks/useGameActions';
import { gameKeys } from '@/src/domains/backlog/queryKeys';

export type WishlistTab = 'interested' | 'pre-ordered' | 'keep-an-eye-on' | 'all';

export const WISHLIST_TAB_LABELS: Record<WishlistTab, string> = {
  all:              'All',
  interested:       'Interested',
  'pre-ordered':    'Pre-Ordered',
  'keep-an-eye-on': 'Keep an Eye On',
};

export const ALL_WISHLIST_STATUSES = 'interested,pre-ordered,keep-an-eye-on';

export function useWishlist() {
  const { session } = useAuth();
  const { authJsonFetch } = useAuthFetch();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [tab, setTab] = useState<WishlistTab>('all');
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const statusParam = tab === 'all' ? ALL_WISHLIST_STATUSES : tab;

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey: gameKeys.byStatus(statusParam),
    queryFn: () => fetch(`/api/games?status=${statusParam}`).then((r) => r.json()),
  });

  useEffect(() => { setPage(1); }, [tab]);

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const paginated = games.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidateGames = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus(statusParam) });

  const { handleAdd, handleStatusChange, handleEdit, handleDelete } = useGameActions({
    onAddSuccess: invalidateGames,
    onStatusSuccess: invalidateGames,
    onEditSuccess: () => {
      setEditGame(null);
      invalidateGames();
    },
    onDeleteSuccess: invalidateGames,
  });

  // Kept local: optimistic update requires onMutate with queryClient.setQueryData
  const priorityMutation = useMutation({
    mutationFn: ({ id, newScore }: { id: string; newScore: number }) =>
      authJsonFetch(`/api/games/${id}`, 'PUT', { priority_score: newScore }),
    onMutate: ({ id, newScore }) => {
      queryClient.setQueryData<GameDto[]>(gameKeys.byStatus(statusParam), (prev = []) =>
        prev
          .map((g) => (g.id === id ? { ...g, priority_score: newScore } : g))
          .sort((a, b) => b.priority_score - a.priority_score),
      );
    },
  });

  const handleDeleteConfirm = (id: string) => {
    if (!confirm('Remove this game from your wishlist?')) return;
    handleDelete(id);
  };

  const handleEditSubmit = (data: object) => {
    if (!editGame) return;
    handleEdit(editGame.id, data);
  };

  const handlePriorityChange = (id: string, delta: number) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;
    const newScore = Math.min(100, Math.max(1, game.priority_score + delta));
    priorityMutation.mutate({ id, newScore });
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
    handlePriorityChange,
  };
}
