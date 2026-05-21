"use client";

import { useState, useEffect, useCallback } from "react";
import { GameDto } from "@/src/Application/DTOs/GameDto";
import { MoodDto } from "@/src/Application/DTOs/MoodDto";
import { useAuth } from "@/src/Presentation/Web/Context/AuthContext";

interface Stats {
  backlog: number;
  playing: number;
  completed: number;
  dropped: number;
  total: number;
}

export function useDashboard() {
  const { session } = useAuth();
  const isAuthenticated = session !== null;

  const [stats, setStats] = useState<Stats>({
    backlog: 0,
    playing: 0,
    completed: 0,
    dropped: 0,
    total: 0,
  });
  const [topPriority, setTopPriority] = useState<GameDto[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<GameDto[]>([]);
  const [moods, setMoods] = useState<MoodDto[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gamesRes, moodsRes] = await Promise.all([
        fetch("/api/games"),
        fetch("/api/moods"),
      ]);

      const games: GameDto[] = await gamesRes.json();
      const moodsData: MoodDto[] = await moodsRes.json();
      setMoods(moodsData);

      setStats({
        backlog: games.filter((g) => g.status === "backlog").length,
        playing: games.filter((g) => g.status === "playing").length,
        completed: games.filter((g) => g.status === "completed").length,
        dropped: games.filter((g) => g.status === "dropped").length,
        total: games.length,
      });

      setTopPriority(
        games
          .filter((g) => g.status === "backlog")
          .sort((a, b) => b.priority_score - a.priority_score)
          .slice(0, 5),
      );

      setRecentlyPlayed(
        games
          .filter((g) => g.last_played_at)
          .sort(
            (a, b) =>
              new Date(b.last_played_at!).getTime() -
              new Date(a.last_played_at!).getTime(),
          )
          .slice(0, 5),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const authHeaders = (): Record<string, string> =>
    session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};

  const handleAdd = async (data: object) => {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === "playing") updates.last_played_at = new Date().toISOString();
    await fetch(`/api/games/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(updates),
    });
    fetchData();
  };

  return {
    stats,
    topPriority,
    recentlyPlayed,
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
