'use client';

import { MoodDto } from '@/src/lib/backend/backlog/domain/models';
import { RawgResult } from '@/src/lib/frontend/features/add-game/types';

interface UseGameDataFetchParams {
  allMoods: MoodDto[];
  authHeaders: () => Record<string, string>;
  gameDescription: string;
  setTitle: (v: string) => void;
  setBackgroundUrl: (v: string) => void;
  setRawgId: (v: number | null) => void;
  setRawgResults: (v: never[]) => void;
  setShowDropdown: (v: boolean) => void;
  setIgdbLoading: (v: boolean) => void;
  setIgdbLoaded: (v: boolean) => void;
  setCoverArtUrl: (v: string) => void;
  setGameDescription: (v: string) => void;
  setIgdbId: (v: number | null) => void;
  setSelectedMoods: (fn: (prev: string[]) => string[]) => void;
}

export function useGameDataFetch(params: UseGameDataFetchParams) {
  const handleRawgSelect = async (game: RawgResult) => {
    const {
      allMoods, authHeaders, gameDescription,
      setTitle, setBackgroundUrl, setRawgId, setRawgResults, setShowDropdown,
      setIgdbLoading, setIgdbLoaded, setCoverArtUrl, setGameDescription,
      setIgdbId, setSelectedMoods,
    } = params;

    setTitle(game.name);
    setBackgroundUrl(game.coverUrl ?? '');
    setRawgId(game.id);
    setRawgResults([]);
    setShowDropdown(false);
    setIgdbLoading(true);
    setIgdbLoaded(false);

    const [igdbResult, rawgDetailResult] = await Promise.allSettled([
      fetch(`/api/igdb?q=${encodeURIComponent(game.name)}`, { headers: authHeaders() }).then((r) => r.json()),
      fetch(`/api/rawg/${game.id}`, { headers: authHeaders() }).then((r) => r.json()),
    ]);

    const moodNameToId = new Map<string, string>(allMoods.map((m) => [m.name, m.id]));
    const suggestedMoodNames = new Set<string>();

    if (igdbResult.status === 'fulfilled' && igdbResult.value) {
      const igdb = igdbResult.value;
      if (igdb.coverArtUrl) setCoverArtUrl(igdb.coverArtUrl);
      if (igdb.summary) setGameDescription(igdb.summary);
      if (igdb.igdbId) setIgdbId(igdb.igdbId);
      for (const name of (igdb.suggestedMoods as string[] | undefined) ?? []) suggestedMoodNames.add(name);
    }

    if (rawgDetailResult.status === 'fulfilled' && rawgDetailResult.value) {
      const rawg = rawgDetailResult.value;
      if (!gameDescription && rawg.description) setGameDescription(rawg.description);
      for (const name of (rawg.suggestedMoods as string[] | undefined) ?? []) suggestedMoodNames.add(name);
    }

    const newMoodIds = [...suggestedMoodNames]
      .map((name) => moodNameToId.get(name))
      .filter((id): id is string => id !== undefined);

    if (newMoodIds.length > 0) {
      setSelectedMoods((prev) => [...new Set([...prev, ...newMoodIds])]);
    }

    setIgdbLoaded(true);
    setIgdbLoading(false);
  };

  return { handleRawgSelect };
}
