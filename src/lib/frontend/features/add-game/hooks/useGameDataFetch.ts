"use client";

import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { IgdbSearchResult } from "@/src/lib/frontend/features/add-game/types";

interface UseGameDataFetchParams {
  allMoods: MoodDto[];
  authHeaders: () => Record<string, string>;
  setTitle: (v: string) => void;
  setBackgroundUrl: (v: string) => void;
  setCoverArtUrl: (v: string) => void;
  setIgdbResults: (v: never[]) => void;
  setShowDropdown: (v: boolean) => void;
  setEnrichLoading: (v: boolean) => void;
  setEnrichLoaded: (v: boolean) => void;
  setGameDescription: (v: string) => void;
  setIgdbId: (v: number | null) => void;
  setSelectedMoods: (fn: (prev: string[]) => string[]) => void;
}

export function useGameDataFetch(params: UseGameDataFetchParams) {
  const handleIgdbSelect = async (game: IgdbSearchResult) => {
    const {
      allMoods,
      authHeaders,
      setTitle,
      setBackgroundUrl,
      setCoverArtUrl,
      setIgdbResults,
      setShowDropdown,
      setEnrichLoading,
      setEnrichLoaded,
      setGameDescription,
      setIgdbId,
      setSelectedMoods,
    } = params;

    setTitle(game.name);
    setCoverArtUrl(game.coverUrl ?? "");
    setIgdbResults([]);
    setShowDropdown(false);
    setEnrichLoading(true);
    setEnrichLoaded(false);

    try {
      const res = await fetch(`/api/igdb/${game.id}`, {
        headers: authHeaders(),
      });
      const igdb = await res.json();

      if (igdb) {
        if (igdb.coverArtUrl) setCoverArtUrl(igdb.coverArtUrl);
        if (igdb.backgroundUrl) setBackgroundUrl(igdb.backgroundUrl);
        if (igdb.summary) setGameDescription(igdb.summary);
        if (igdb.igdbId) setIgdbId(igdb.igdbId);

        const moodNameToId = new Map<string, string>(
          allMoods.map((m) => [m.name, m.id]),
        );
        const newMoodIds = ((igdb.suggestedMoods as string[] | undefined) ?? [])
          .map((name) => moodNameToId.get(name))
          .filter((id): id is string => id !== undefined);

        if (newMoodIds.length > 0) {
          setSelectedMoods((prev) => [...new Set([...prev, ...newMoodIds])]);
        }
      }
    } finally {
      setEnrichLoaded(true);
      setEnrichLoading(false);
    }
  };

  return { handleIgdbSelect };
}
