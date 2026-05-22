'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { gameKeys, moodKeys } from './queryKeys';

export function usePlaying() {
  const { session, authLoading } = useAuth();
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

  const { data: moods = [], isPending: moodsLoading } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch('/api/moods').then((r) => r.json()),
    staleTime: Infinity,
  });

  const loading = authLoading || gamesLoading || moodsLoading;

  const moodFiltered = moodFilter
    ? games.filter((g) => g.moods?.some((m) => m.name === moodFilter))
    : games;

  const filtered = searchQuery.trim()
    ? moodFiltered.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : moodFiltered;

  useEffect(() => { setPage(1); }, [moodFilter]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const invalidateGames = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus('playing') });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GameStatus }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed' || status === 'main-complete') {
        updates.last_played_at = new Date().toISOString();
      }
      return fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: invalidateGames,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setEditGame(null);
      invalidateGames();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/games/${id}`, { method: 'DELETE', headers: authHeaders() }),
    onSuccess: invalidateGames,
  });

  const handleStatusChange = (id: string, status: GameStatus) =>
    statusMutation.mutate({ id, status });

  const handleEdit = (data: object) => {
    if (!editGame) return;
    editMutation.mutate({ id: editGame.id, data });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this game?')) return;
    deleteMutation.mutate(id);
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
    handleEdit,
    handleDelete,
  };
}
