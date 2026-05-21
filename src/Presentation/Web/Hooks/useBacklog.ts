'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto } from '@/src/Application/DTOs/GameDto';
import { MoodDto } from '@/src/Application/DTOs/MoodDto';

export function useBacklog() {
  const [games, setGames] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch('/api/games?status=backlog'),
        fetch('/api/moods'),
      ]);
      setGames(await gamesRes.json());
      setMoods(await moodsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = moodFilter
    ? games.filter((g) => g.moods?.some((m) => m.name === moodFilter))
    : games;

  const handleAdd = async (data: object) => {
    await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: 'backlog' }),
    });
    fetchData();
  };

  const handleEdit = async (data: object) => {
    if (!editGame) return;
    await fetch(`/api/games/${editGame.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditGame(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this game from your backlog?')) return;
    await fetch(`/api/games/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'playing') updates.last_played_at = new Date().toISOString();
    await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    moods,
    moodFilter,
    setMoodFilter,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    editGame,
    setEditGame,
    loading,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  };
}
