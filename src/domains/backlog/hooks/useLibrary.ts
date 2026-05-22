'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';

export type LibraryTab = 'completed' | 'ongoing' | 'dropped';

const LIBRARY_TAB_STATUSES: Record<LibraryTab, string> = {
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
  const { session, authLoading } = useAuth();
  const isAuthenticated = session !== null;

  const PAGE_SIZE = 20;

  const [games, setGames] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [tab, setTab] = useState<LibraryTab>('completed');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const loading = authLoading || dataLoading;

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch(`/api/games?status=${LIBRARY_TAB_STATUSES[tab]}`),
        fetch('/api/moods'),
      ]);
      setGames(await gamesRes.json());
      setMoods(await moodsRes.json());
    } finally {
      setDataLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const filtered = searchQuery.trim()
    ? games.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const handleStatusChange = async (id: string, status: GameStatus) => {
    await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const handleEdit = async (data: object) => {
    if (!editGame) return;
    await fetch(`/api/games/${editGame.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    setEditGame(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game?')) return;
    await fetch(`/api/games/${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchData();
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
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  };
}
