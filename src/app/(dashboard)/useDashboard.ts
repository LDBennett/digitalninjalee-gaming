'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { gameKeys, moodKeys, statsKeys } from '@/src/domains/backlog/queryKeys';

interface Stats {
  backlog: number;
  playing: number;
  completed: number;
  ongoing: number;
  wishlist: number;
  total: number;
}

export function useDashboard() {
  const { session, authLoading } = useAuth();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const { data: allGames = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey: gameKeys.all,
    queryFn: () => fetch('/api/games').then((r) => r.json()),
  });

  const { data: statusCounts = {}, isPending: statsLoading } = useQuery<Record<string, number>>({
    queryKey: statsKeys.statusCounts,
    queryFn: () => fetch('/api/games/stats').then((r) => r.json()),
  });

  const { data: moods = [], isPending: moodsLoading } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch('/api/moods').then((r) => r.json()),
    staleTime: Infinity,
  });

  const loading = authLoading || gamesLoading || statsLoading || moodsLoading;

  const stats: Stats = {
    backlog:   statusCounts['backlog'] ?? 0,
    playing:   statusCounts['playing'] ?? 0,
    completed: (statusCounts['completed'] ?? 0) + (statusCounts['main-complete'] ?? 0),
    ongoing:   statusCounts['ongoing'] ?? 0,
    wishlist:  (statusCounts['interested'] ?? 0) + (statusCounts['pre-ordered'] ?? 0) + (statusCounts['keep-an-eye-on'] ?? 0),
    total:     Object.values(statusCounts).reduce((sum, n) => sum + n, 0),
  };

  const topPriority = allGames
    .filter((g) => g.status === 'backlog')
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5);

  const recentlyPlayed = allGames
    .filter((g) => g.last_played_at)
    .sort((a, b) => new Date(b.last_played_at!).getTime() - new Date(a.last_played_at!).getTime())
    .slice(0, 5);

  const searchResults = searchQuery.trim()
    ? allGames.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const invalidateGames = () => {
    queryClient.invalidateQueries({ queryKey: gameKeys.all });
    queryClient.invalidateQueries({ queryKey: statsKeys.statusCounts });
  };

  const addMutation = useMutation({
    mutationFn: (data: object) =>
      fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      }),
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

  const handleAdd = (data: object) => addMutation.mutate(data);
  const handleStatusChange = (id: string, status: GameStatus) =>
    statusMutation.mutate({ id, status });

  return {
    stats,
    topPriority,
    recentlyPlayed,
    searchQuery,
    setSearchQuery,
    searchResults,
    moods,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    loading,
    isAuthenticated,
    handleAdd,
    handleStatusChange,
  };
}
