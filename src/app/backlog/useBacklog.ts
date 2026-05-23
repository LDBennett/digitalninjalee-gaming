'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { gameKeys, moodKeys } from '@/src/domains/backlog/queryKeys';

export function useBacklog() {
  const { session, authLoading } = useAuth();
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
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus('backlog') });

  const addMutation = useMutation({
    mutationFn: (data: object) =>
      fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ ...data, status: 'backlog' }),
      }),
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GameStatus }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'playing') updates.last_played_at = new Date().toISOString();
      return fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: invalidateGames,
  });

  const priorityMutation = useMutation({
    mutationFn: ({ id, newScore }: { id: string; newScore: number }) =>
      fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ priority_score: newScore }),
      }),
    onMutate: ({ id, newScore }) => {
      queryClient.setQueryData<GameDto[]>(gameKeys.byStatus('backlog'), (prev = []) =>
        prev
          .map((g) => (g.id === id ? { ...g, priority_score: newScore } : g))
          .sort((a, b) => b.priority_score - a.priority_score),
      );
    },
  });

  const handleAdd = (data: object) => addMutation.mutate(data);

  const handleEdit = (data: object) => {
    if (!editGame) return;
    editMutation.mutate({ id: editGame.id, data });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this game from your backlog?')) return;
    deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: GameStatus) =>
    statusMutation.mutate({ id, status });

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
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  };
}
