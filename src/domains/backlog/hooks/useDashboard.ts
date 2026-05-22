'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameDto, GameStatus } from '@/src/domains/backlog/models/game.types';
import { MoodDto } from '@/src/domains/backlog/models/mood.types';
import { useAuth } from '@/src/domains/shared/auth/AuthContext';

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

  const [stats, setStats] = useState<Stats>({
    backlog: 0,
    playing: 0,
    completed: 0,
    ongoing: 0,
    wishlist: 0,
    total: 0,
  });
  const [allGames, setAllGames] = useState<GameDto[]>([]);
  const [topPriority, setTopPriority] = useState<GameDto[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const loading = authLoading || dataLoading;

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/moods'),
      ]);

      const games: GameDto[] = await gamesRes.json();
      const moodsData: MoodDto[] = await moodsRes.json();
      setMoods(moodsData);
      setAllGames(games);

      setStats({
        backlog:   games.filter((g) => g.status === 'backlog').length,
        playing:   games.filter((g) => g.status === 'playing').length,
        completed: games.filter((g) => g.status === 'completed' || g.status === 'main-complete').length,
        ongoing:   games.filter((g) => g.status === 'ongoing').length,
        wishlist:  games.filter((g) => g.status === 'interested' || g.status === 'pre-ordered' || g.status === 'keep-an-eye-on').length,
        total:     games.length,
      });

      setTopPriority(
        games
          .filter((g) => g.status === 'backlog')
          .sort((a, b) => b.priority_score - a.priority_score)
          .slice(0, 5),
      );

      setRecentlyPlayed(
        games
          .filter((g) => g.last_played_at)
          .sort((a, b) => new Date(b.last_played_at!).getTime() - new Date(a.last_played_at!).getTime())
          .slice(0, 5),
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const searchResults = searchQuery.trim()
    ? allGames.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

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
