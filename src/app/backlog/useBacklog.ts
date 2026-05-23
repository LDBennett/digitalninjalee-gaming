'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto } from '@/src/domains/backlog/models/game.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { useAuthFetch } from '@/src/domains/shared/auth/useAuthFetch';
import { useMoods } from '@/src/domains/backlog/hooks/useMoods';
import { useGameActions } from '@/src/domains/backlog/hooks/useGameActions';
import { filterByMood, filterByTitle } from '@/src/domains/backlog/services/game.queries';
import { gameKeys } from '@/src/domains/backlog/queryKeys';

export function useBacklog() {
  const { session, authLoading } = useAuth();
  const { authJsonFetch } = useAuthFetch();
  const { moods, moodsLoading } = useMoods();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey: gameKeys.byStatus('backlog'),
    queryFn: () => fetch('/api/games?status=backlog').then((r) => r.json()),
  });

  const loading = authLoading || gamesLoading || moodsLoading;

  const filtered = filterByTitle(filterByMood(games, moodFilter), searchQuery);

  useEffect(() => { setPage(1); }, [moodFilter]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidateGames = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus('backlog') });

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
      queryClient.setQueryData<GameDto[]>(gameKeys.byStatus('backlog'), (prev = []) =>
        prev
          .map((g) => (g.id === id ? { ...g, priority_score: newScore } : g))
          .sort((a, b) => b.priority_score - a.priority_score),
      );
    },
  });

  const handleDeleteConfirm = (id: string) => {
    if (!confirm('Remove this game from your backlog?')) return;
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
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleAdd,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
    handleStatusChange,
    handlePriorityChange,
  };
}
