"use client";

import { useEffect } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { RawgResult } from "@/src/lib/frontend/features/add-game/types";

interface UseRawgSearchParams {
  title: string;
  editGame: GameDto | null | undefined;
  authHeaders: () => Record<string, string>;
  setRawgResults: (results: RawgResult[]) => void;
  setShowDropdown: (show: boolean) => void;
  setSearchLoading: (loading: boolean) => void;
}

export function useRawgSearch({
  title,
  editGame,
  authHeaders,
  setRawgResults,
  setShowDropdown,
  setSearchLoading,
}: UseRawgSearchParams) {
  useEffect(() => {
    if (editGame || title.trim().length < 2) {
      setRawgResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/rawg?q=${encodeURIComponent(title.trim())}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        setRawgResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, editGame]);
}
