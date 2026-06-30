"use client";

import { useEffect, useState } from "react";
import {
  GameDto,
  GameStatus,
  MoodDto,
  PlayGoal,
} from "@/src/lib/backend/backlog/domain/models";
import { AddGamePayload } from "@/src/lib/frontend/features/add-game/types";
import { useAuthFetch } from "@/src/lib/frontend/shared/hooks/useAuthFetch";
import { useAuthStore } from "@/src/lib/frontend/shared/store/auth.store";
import { useAddGameFormState } from "./useAddGameFormState";
import { useIgdbSearch } from "./useIgdbSearch";
import { useGameDataFetch } from "./useGameDataFetch";

interface UseAddGameFormOptions {
  editGame?: GameDto | null;
  isOpen: boolean;
  defaultStatus: GameStatus;
  onSave: (data: AddGamePayload) => void | Promise<void>;
  onClose: () => void;
}

export function useAddGameForm({
  editGame,
  isOpen,
  defaultStatus,
  onSave,
  onClose,
}: UseAddGameFormOptions) {
  const { authHeaders } = useAuthFetch();
  const { session, authLoading } = useAuthStore();

  const state = useAddGameFormState(editGame, isOpen, defaultStatus);

  const [allMoods, setAllMoods] = useState<MoodDto[]>([]);
  useEffect(() => {
    if (authLoading || !session) return;
    fetch("/api/moods", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllMoods(data);
      })
      .catch(() => {});
  }, [authLoading, session]);

  useIgdbSearch({
    title: state.title,
    igdbId: state.igdbId,
    editGame,
    authHeaders,
    setIgdbResults: state.setIgdbResults,
    setShowDropdown: state.setShowDropdown,
    setSearchLoading: state.setSearchLoading,
  });

  const { handleIgdbSelect } = useGameDataFetch({
    allMoods,
    authHeaders,
    setTitle: state.setTitle,
    setBackgroundUrl: state.setBackgroundUrl,
    setCoverArtUrl: state.setCoverArtUrl,
    setIgdbResults: state.setIgdbResults as (v: never[]) => void,
    setShowDropdown: state.setShowDropdown,
    setEnrichLoading: state.setEnrichLoading,
    setEnrichLoaded: state.setEnrichLoaded,
    setGameDescription: state.setGameDescription,
    setIgdbId: state.setIgdbId,
    setSelectedMoods: state.setSelectedMoods,
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
    });
    state.setSaving(false);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const saved = await doSave();
    if (saved && !editGame) onClose();
  };

  const handleSubmitAndAdd = async () => {
    const saved = await doSave();
    if (saved) resetForm();
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
    toggleMood,
    togglePlayGoal,
    handleSubmit,
    handleSubmitAndAdd,
    clearCoverArt,
  };
}
