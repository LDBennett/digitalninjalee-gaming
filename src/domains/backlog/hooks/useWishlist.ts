'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { gameKeys, moodKeys } from './queryKeys';

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

  const { data: moods = [] } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch('/api/moods').then((r) => r.json()),
    staleTime: Infinity,
  });

  useEffect(() => { setPage(1); }, [tab]);

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const paginated = games.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const invalidateGames = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus(statusParam) });

  const addMutation = useMutation({
    mutationFn: (data: object) =>
      fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
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
    mutationFn: ({ id, status }: { id: string; status: GameStatus }) =>
      fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
      }),
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
      queryClient.setQueryData<GameDto[]>(gameKeys.byStatus(statusParam), (prev = []) =>
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
    if (!confirm('Remove this game from your wishlist?')) return;
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
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  };
}
