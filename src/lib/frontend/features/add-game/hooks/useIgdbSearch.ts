"use client";

import { useEffect } from "react";
import { GameDto } from "@/src/lib/backend/backlog/domain/models";
import { AddGameFormState } from "./useAddGameFormState";

interface UseIgdbSearchParams {
  editGame: GameDto | null | undefined;
  isOpen: boolean;
  authHeaders: () => Record<string, string>;
  state: AddGameFormState;
}

export function useIgdbSearch({
  editGame,
  isOpen,
  authHeaders,
  state,
}: UseIgdbSearchParams) {
  const { title, igdbId, setIgdbResults, setShowDropdown, setSearchLoading } =
    state;

  useEffect(() => {
    if (!isOpen || editGame || igdbId || title.trim().length < 2) {
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
  }, [title, igdbId, editGame, isOpen]);
}
