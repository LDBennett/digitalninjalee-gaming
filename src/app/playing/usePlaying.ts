'use client';

import { useState, useEffect, useMemo } from 'react';
import { GameDto } from '@/src/domains/games/models/game.types';
import { useAuthStore } from '@/src/domains/shared/auth/auth.store';
import { useMoods } from '@/src/domains/games/hooks/useMoods';
import { useGameActions } from '@/src/domains/games/hooks/useGameActions';
import { useGameQuery } from '@/src/domains/games/hooks/useGameQuery';
import { useGameFilters } from '@/src/domains/games/hooks/useGameFilters';
import { useClientPagination } from '@/src/domains/shared/hooks/useClientPagination';
import { buildStatusPayload } from '@/src/domains/games/services/game.service';

export type PlayingTab = 'playing' | 'ongoing';

export function usePlaying() {
  const { session, authLoading } = useAuthStore();
  const { moods } = useMoods();
  const isAuthenticated = session !== null;

  const [activeTab, setActiveTabState] = useState<PlayingTab>('playing');
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const { games: allGames, invalidate } = useGameQuery();
  const playingGames = useMemo(() => allGames.filter((g) => g.status === 'playing'), [allGames]);
  const ongoingGames = useMemo(() => allGames.filter((g) => g.status === 'ongoing'), [allGames]);

  const games = activeTab === 'playing' ? playingGames : ongoingGames;

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

  const { handleStatusChange, handleEdit, handleDelete } = useGameActions({
    onStatusSuccess: invalidate,
    onEditSuccess: () => {
      setEditGame(null);
      invalidate();
    },
    onDeleteSuccess: invalidate,
    buildStatusUpdates: buildStatusPayload,
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
    loading: authLoading,
    isAuthenticated,
    handleStatusChange,
    handleEdit: handleEditSubmit,
    handleDelete: handleDeleteConfirm,
  };
}
