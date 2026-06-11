"use client";

import { useEffect } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { IgdbSearchResult } from "@/src/lib/frontend/features/add-game/types";

interface UseIgdbSearchParams {
  title: string;
  igdbId: number | null;
  editGame: GameDto | null | undefined;
  authHeaders: () => Record<string, string>;
  setIgdbResults: (results: IgdbSearchResult[]) => void;
  setShowDropdown: (show: boolean) => void;
  setSearchLoading: (loading: boolean) => void;
}

export function useIgdbSearch({
  title,
  igdbId,
  editGame,
  authHeaders,
  setIgdbResults,
  setShowDropdown,
  setSearchLoading,
}: UseIgdbSearchParams) {
  useEffect(() => {
    if (editGame || igdbId || title.trim().length < 2) {
      setIgdbResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/igdb/search?q=${encodeURIComponent(title.trim())}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        setIgdbResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, igdbId, editGame]);
}
