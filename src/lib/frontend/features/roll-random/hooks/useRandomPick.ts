"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { useAuthFetch } from "@/src/lib/frontend/shared";

export type Pool = "backlog" | "playing";

function poolToStatusParam(pool: Pool): string {
  return pool === "playing" ? "playing,ongoing" : pool;
}

export function useRandomPick(selectedPool: Pool) {
  const { authHeaders } = useAuthFetch();
  const [candidates, setCandidates] = useState<GameDto[]>([]);
  const [pickedGame, setPickedGame] = useState<GameDto | null>(null);
  const [noGamesMsg, setNoGamesMsg] = useState("");

  const { mutate: executePick } = useMutation({
    mutationFn: async (moodNames: string[]) => {
      const params = new URLSearchParams({
        status: poolToStatusParam(selectedPool),
      });
      if (moodNames.length) params.set("moods", moodNames.join(","));
      const res = await fetch(`/api/games/random?${params}`, {
        headers: authHeaders(),
      });
      return res.json() as Promise<{ game?: GameDto; message?: string }>;
    },
    onSuccess: (data) => {
      if (data.game) setPickedGame(data.game);
      else setNoGamesMsg(data.message ?? "No games found");
    },
  });

  const fetchCandidates = async (moodNames: string[]) => {
    const params = new URLSearchParams({
      status: poolToStatusParam(selectedPool),
    });
    const res = await fetch(`/api/games?${params}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return;
    const data: GameDto[] = await res.json();

    let pool = data;
    if (moodNames.length > 0) {
      const filtered = data.filter((g) =>
        g.moods?.some((m) => moodNames.includes(m.name)),
      );
      if (filtered.length > 0) pool = filtered;
    }
    setCandidates(pool);
  };

  const pick = (moodNames: string[]) => {
    setPickedGame(null);
    setCandidates([]);
    setNoGamesMsg("");
    fetchCandidates(moodNames);
    executePick(moodNames);
  };

  const reset = () => {
    setPickedGame(null);
    setCandidates([]);
    setNoGamesMsg("");
  };

  return { candidates, pickedGame, noGamesMsg, pick, reset };
}
