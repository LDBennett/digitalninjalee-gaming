'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { useMoods } from '@/src/domains/backlog/hooks/useMoods';
import { useGameActions } from '@/src/domains/backlog/hooks/useGameActions';
import { filterByMood, filterByTitle } from '@/src/domains/backlog/services/game.queries';
import { gameKeys } from '@/src/domains/backlog/queryKeys';

const playingStatusUpdates = (status: GameStatus): Record<string, unknown> => {
  const updates: Record<string, unknown> = { status };
  if (status === 'completed' || status === 'main-complete') {
    updates.last_played_at = new Date().toISOString();
  }
  return updates;
};

export function usePlaying() {
  const { session, authLoading } = useAuth();
  const { moods, moodsLoading } = useMoods();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey: gameKeys.byStatus('playing'),
    queryFn: () => fetch('/api/games?status=playing').then((r) => r.json()),
  });

  const loading = authLoading || gamesLoading || moodsLoading;

  const filtered = filterByTitle(filterByMood(games, moodFilter), searchQuery);

  useEffect(() => { setPage(1); }, [moodFilter]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidateGames = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus('playing') });

  const { handleStatusChange, handleEdit, handleDelete } = useGameActions({
    onStatusSuccess: invalidateGames,
    onEditSuccess: () => {
      setEditGame(null);
      invalidateGames();
    },
    onDeleteSuccess: invalidateGames,
    buildStatusUpdates: playingStatusUpdates,
  });

  const handleDeleteConfirm = (id: string) => {
    if (!confirm('Delete this game?')) return;
    handleDelete(id);
  };

  const handleEditSubmit = (data: object) => {
    if (!editGame) return;
    handleEdit(editGame.id, data);
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
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
  };
}
