'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto } from '@/src/Application/DTOs/GameDto';
import { MoodDto } from '@/src/Application/DTOs/MoodDto';
import { useAuth } from '@/src/Presentation/Web/Context/AuthContext';

export function usePlaying() {
  const { session } = useAuth();
  const isAuthenticated = session !== null;

  const [games, setGames] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch('/api/games?status=playing'),
        fetch('/api/moods'),
      ]);
      setGames(await gamesRes.json());
      setMoods(await moodsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const handleStatusChange = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'completed') updates.last_played_at = new Date().toISOString();
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
    await fetch(`/api/games/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchData();
  };

  return {
    games,
    moods,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  };
}
