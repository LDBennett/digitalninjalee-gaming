'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';

export type WishlistTab = 'interested' | 'pre-ordered' | 'keep-an-eye-on' | 'all';

export const WISHLIST_TAB_LABELS: Record<WishlistTab, string> = {
  all:              'All',
  interested:       'Interested',
  'pre-ordered':    'Pre-Ordered',
  'keep-an-eye-on': 'Keep an Eye On',
};

const ALL_WISHLIST_STATUSES = 'interested,pre-ordered,keep-an-eye-on';

export function useWishlist() {
  const { session } = useAuth();
  const isAuthenticated = session !== null;

  const PAGE_SIZE = 20;

  const [games, setGames] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [tab, setTab] = useState<WishlistTab>('all');
  const [page, setPage] = useState(1);
  const [editGame, setEditGame] = useState<GameDto | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = tab === 'all' ? ALL_WISHLIST_STATUSES : tab;
      const [gamesRes, moodsRes] = await Promise.all([
        fetch(`/api/games?status=${statusParam}`),
        fetch('/api/moods'),
      ]);
      setGames(await gamesRes.json());
      setMoods(await moodsRes.json());
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [tab]);

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const paginated = games.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const authHeaders = (): Record<string, string> =>
    session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

  const handleAdd = async (data: object) => {
    await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
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
    if (!confirm('Remove this game from your wishlist?')) return;
    await fetch(`/api/games/${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchData();
  };

  const handleStatusChange = async (id: string, status: GameStatus) => {
    await fetch(`/api/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
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
    loading,
    isAuthenticated,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  };
}
