'use client';

import { useState, useEffect } from 'react';
import { GameDto, GameStatus } from '@/src/domains/games/models/game.types';
import { useAuthStore } from '@/src/domains/shared/auth/auth.store';
import { useMoods } from '@/src/domains/games/hooks/useMoods';
import { useGameActions } from '@/src/domains/games/hooks/useGameActions';
import { useGameQuery } from '@/src/domains/games/hooks/useGameQuery';
import { useGameFilters } from '@/src/domains/games/hooks/useGameFilters';
import { useClientPagination } from '@/src/domains/shared/hooks/useClientPagination';

export type PlayingTab = 'playing' | 'ongoing';

const playingStatusUpdates = (status: GameStatus): Record<string, unknown> => {
  const updates: Record<string, unknown> = { status };
  if (status === 'completed' || status === 'main-complete') {
    updates.last_played_at = new Date().toISOString();
  }
  return updates;
};

export function usePlaying() {
  const { session, authLoading } = useAuthStore();
  const { moods, moodsLoading } = useMoods();
  const isAuthenticated = session !== null;

  const [activeTab, setActiveTabState] = useState<PlayingTab>('playing');
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { games: playingGames, gamesLoading: playingLoading, invalidate: invalidatePlaying } =
    useGameQuery('playing');
  const { games: ongoingGames, gamesLoading: ongoingLoading, invalidate: invalidateOngoing } =
    useGameQuery('ongoing');

  const games = activeTab === 'playing' ? playingGames : ongoingGames;
  const activeLoading = activeTab === 'playing' ? playingLoading : ongoingLoading;
  const loading = authLoading || activeLoading || moodsLoading;

  const { searchQuery, setSearchQuery, moodFilter, setMoodFilter, filtered } =
    useGameFilters(games);
  const { page, setPage, totalPages, paginated } = useClientPagination(filtered);

  const setActiveTab = (tab: PlayingTab) => {
    setActiveTabState(tab);
    setPage(1);
    setMoodFilter(null);
    setSearchQuery('');
  };

  useEffect(() => { setPage(1); }, [moodFilter, setPage]);
  useEffect(() => { setPage(1); }, [searchQuery, setPage]);

  const invalidate = () => {
    invalidatePlaying();
    invalidateOngoing();
  };

  const { handleStatusChange, handleEdit, handleDelete } = useGameActions({
    onStatusSuccess: invalidate,
    onEditSuccess: () => {
      setEditGame(null);
      invalidate();
    },
    onDeleteSuccess: invalidate,
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
    activeTab,
    setActiveTab,
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
