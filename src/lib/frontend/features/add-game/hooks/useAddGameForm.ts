"use client";

import {
  GameDto,
  GameStatus,
  MoodDto,
  PlayGoal,
} from "@/src/lib/backend/backlog/domain/models";
import { AddGamePayload } from "@/src/lib/frontend/features/add-game/types";
import { useAuthFetch } from "@/src/lib/frontend/shared";
import { useAddGameFormState } from "./useAddGameFormState";
import { useIgdbSearch } from "./useIgdbSearch";
import { useGameDataFetch } from "./useGameDataFetch";

interface UseAddGameFormOptions {
  editGame?: GameDto | null;
  isOpen: boolean;
  defaultStatus: GameStatus;
  moods: MoodDto[];
  onSave: (data: AddGamePayload) => void | Promise<void>;
  onClose: () => void;
}

export function useAddGameForm({
  editGame,
  isOpen,
  defaultStatus,
  moods,
  onSave,
  onClose,
}: UseAddGameFormOptions) {
  const { authHeaders } = useAuthFetch();

  const state = useAddGameFormState(editGame, isOpen, defaultStatus);

  useIgdbSearch({
    editGame,
    isOpen,
    authHeaders,
    state,
  });

  const { handleIgdbSelect } = useGameDataFetch({
    allMoods: moods,
    authHeaders,
    state,
  });

  const toggleMood = (id: string) =>
    state.setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const togglePlayGoal = (goal: PlayGoal) =>
    state.setSelectedPlayGoals((prev) =>
      prev.includes(goal) ? prev.filter((x) => x !== goal) : [...prev, goal],
    );

  const resetForm = () => {
    state.setTitle("");
    state.setPlatform("pc");
    state.setStatus(defaultStatus);
    state.setPriorityScore(50);
    state.setBackgroundUrl("");
    state.setCoverArtUrl("");
    state.setGameDescription("");
    state.setPersonalNote("");
    state.setRating(null);
    state.setIgdbId(null);
    state.setSelectedMoods([]);
    state.setReplayStatus(null);
    state.setSelectedPlayGoals([]);
    state.setIgdbResults([]);
    state.setShowDropdown(false);
    state.setEnrichLoading(false);
    state.setEnrichLoaded(false);
  };

  const doSave = async () => {
    if (!state.title.trim()) return false;
    state.setSaving(true);
    try {
      await onSave({
        title: state.title.trim(),
        platform: state.platform,
        status: state.status,
        priority_score: state.priorityScore,
        background_url: state.backgroundUrl.trim() || null,
        cover_art_url: state.coverArtUrl.trim() || null,
        game_description: state.gameDescription.trim() || null,
        personal_note: state.personalNote.trim() || null,
        rating: state.rating,
        rawg_id: null,
        igdb_id: state.igdbId,
        mood_ids: state.selectedMoods,
        replay_status: state.replayStatus,
        play_goals: state.selectedPlayGoals,
        time_to_beat: state.timeToBeat,
        completion_roadmap: state.completionRoadmap,
      });
      return true;
    } catch {
      return false;
    } finally {
      state.setSaving(false);
    }
  };

  const handleExtractGuide = async (url: string) => {
    if (!url.trim()) return;
    state.setIsExtractingGuide(true);
    state.setExtractError(null);

    try {
      const res = await fetch("/api/guides/extract", {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        state.setExtractError(data.error || "Failed to extract guide");
        return;
      }

      if (data.roadmap) {
        state.setCompletionRoadmap(data.roadmap);
        state.setIsManualRoadmapDirty(true);
      }
    } catch (err) {
      state.setExtractError(
        err instanceof Error ? err.message : "Failed to extract guide",
      );
    } finally {
      state.setIsExtractingGuide(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((await doSave()) && !editGame) onClose();
  };

  const handleSubmitAndAdd = async () => {
    if (await doSave()) resetForm();
  };

  const clearCoverArt = () => {
    state.setBackgroundUrl("");
    state.setCoverArtUrl("");
    state.setGameDescription("");
    state.setIgdbId(null);
    state.setEnrichLoaded(false);
  };

  return {
    ...state,
    handleIgdbSelect,
    handleExtractGuide,
    toggleMood,
    togglePlayGoal,
    handleSubmit,
    handleSubmitAndAdd,
    clearCoverArt,
  };
}
