'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';

export function useBacklog() {
  const { session, authLoading } = useAuth();
  const isAuthenticated = session !== null;

  const PAGE_SIZE = 20;

  const [games, setGames] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const loading = authLoading || dataLoading;

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch('/api/games?status=backlog'),
        fetch('/api/moods'),
      ]);
      setGames(await gamesRes.json());
      setMoods(await moodsRes.json());
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleAdd = async (data: object) => {
    await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ ...data, status: 'backlog' }),
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
    if (!confirm('Remove this game from your backlog?')) return;
    await fetch(`/api/games/${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchData();
  };

  const handleStatusChange = async (id: string, status: GameStatus) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'playing') updates.last_played_at = new Date().toISOString();
    await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    });
    fetchData();
  };

  const handlePriorityChange = async (id: string, delta: number) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;
    const newScore = Math.min(100, Math.max(1, game.priority_score + delta));
    await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ priority_score: newScore }),
    });
    setGames((prev) =>
      prev.map((g) => g.id === id ? { ...g, priority_score: newScore } : g)
        .sort((a, b) => b.priority_score - a.priority_score),
    );
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
