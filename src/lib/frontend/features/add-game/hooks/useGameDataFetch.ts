"use client";

import { MoodDto } from "@/src/lib/backend/backlog/domain/models";
import { IgdbSearchResult } from "@/src/lib/frontend/features/add-game/types";
import { AddGameFormState } from "./useAddGameFormState";

interface UseGameDataFetchParams {
  allMoods: MoodDto[];
  authHeaders: () => Record<string, string>;
  state: AddGameFormState;
}

export function useGameDataFetch({
  allMoods,
  authHeaders,
  state,
}: UseGameDataFetchParams) {
  const handleIgdbSelect = async (game: IgdbSearchResult) => {
    state.setTitle(game.name);
    state.setCoverArtUrl(game.coverUrl ?? "");
    state.setIgdbId(game.id);
    state.setIgdbResults([]);
    state.setShowDropdown(false);
    state.setEnrichLoading(true);
    state.setEnrichLoaded(false);

    try {
      const res = await fetch(`/api/igdb/${game.id}`, {
        headers: authHeaders(),
      });
      const igdb = await res.json();

      if (igdb) {
        if (igdb.coverArtUrl) state.setCoverArtUrl(igdb.coverArtUrl);
        if (igdb.backgroundUrl) state.setBackgroundUrl(igdb.backgroundUrl);
        if (igdb.summary) state.setGameDescription(igdb.summary);
        if (igdb.igdbId) state.setIgdbId(igdb.igdbId);

        const moodNameToId = new Map<string, string>(
          allMoods.map((m) => [m.name, m.id]),
        );
        const newMoodIds = ((igdb.suggestedMoods as string[] | undefined) ?? [])
          .map((name) => moodNameToId.get(name))
          .filter((id): id is string => id !== undefined);

        if (newMoodIds.length > 0) {
          state.setSelectedMoods((prev) => [
            ...new Set([...prev, ...newMoodIds]),
          ]);
        }

        // Concurrency-safe auto-fetch for HowLongToBeat pacing
        if (!state.isManualPlaytimeDirty) {
          try {
            const hltbRes = await fetch(
              `/api/hltb/search?title=${encodeURIComponent(game.name)}`,
              { headers: authHeaders() },
            );
            if (hltbRes.ok) {
              const hltbData = await hltbRes.json();
              if (hltbData?.time_to_beat) {
                state.setTimeToBeat(hltbData.time_to_beat);
              }
            }
          } catch {
            // Non-blocking: failure to reach HLTB does not disrupt IGDB enrichment
          }
        }
      }
    } finally {
      state.setEnrichLoaded(true);
      state.setEnrichLoading(false);
    }
  };

  return { handleIgdbSelect };
}

