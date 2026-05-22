'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';

export function usePlaying() {
  const { session, authLoading } = useAuth();
  const isAuthenticated = session !== null;

  const PAGE_SIZE = 20;

  const [games, setGames] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const loading = authLoading || dataLoading;

  const moodFiltered = moodFilter ? games.filter((g) => g.moods?.some((m) => m.name === moodFilter)) : games;

  const filtered = searchQuery.trim()
    ? moodFiltered.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : moodFiltered;

  useEffect(() => { setPage(1); }, [moodFilter]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch('/api/games?status=playing'),
        fetch('/api/moods'),
      ]);
      setGames(await gamesRes.json());
      setMoods(await moodsRes.json());
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const handleStatusChange = async (id: string, status: GameStatus) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'completed' || status === 'main-complete') {
      updates.last_played_at = new Date().toISOString();
    }
    await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
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
