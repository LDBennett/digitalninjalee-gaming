'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';
import { gameKeys, moodKeys } from './queryKeys';

export type LibraryTab = 'completed' | 'ongoing' | 'dropped';

export const LIBRARY_TAB_STATUSES: Record<LibraryTab, string> = {
  completed: 'completed,main-complete',
  ongoing:   'ongoing',
  dropped:   'dropped',
};

export const LIBRARY_TAB_LABELS: Record<LibraryTab, string> = {
  completed: 'Completed',
  ongoing:   'Ongoing',
  dropped:   'Dropped',
};

export function useLibrary() {
  const { session } = useAuth();
  const isAuthenticated = session !== null;
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [tab, setTab] = useState<LibraryTab>('completed');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);

  const tabStatus = LIBRARY_TAB_STATUSES[tab];

  const { data: games = [], isPending: gamesLoading } = useQuery<GameDto[]>({
    queryKey: gameKeys.byStatus(tabStatus),
    queryFn: () => fetch(`/api/games?status=${tabStatus}`).then((r) => r.json()),
  });

  const { data: moods = [] } = useQuery<MoodDto[]>({
    queryKey: moodKeys.all,
    queryFn: () => fetch('/api/moods').then((r) => r.json()),
    staleTime: Infinity,
  });


  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const filtered = searchQuery.trim()
    ? games.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const invalidateGames = () =>
    queryClient.invalidateQueries({ queryKey: gameKeys.byStatus(tabStatus) });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GameStatus }) =>
      fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
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
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    editGame,
    setEditGame,
    gamesLoading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  };
}
