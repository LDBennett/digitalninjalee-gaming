'use client';

import { useEffect, useState } from 'react';
import { GameDto, GameStatus, MoodDto } from '@/src/lib/backend/backlog/domain/models';
import { AddGamePayload } from '@/src/lib/frontend/features/add-game/types';
import { useAuthFetch } from '@/src/lib/frontend/shared/auth/useAuthFetch';
import { useAuthStore } from '@/src/lib/frontend/shared/auth/auth.store';
import { useAddGameFormState } from './useAddGameFormState';
import { useRawgSearch } from './useRawgSearch';
import { useGameDataFetch } from './useGameDataFetch';

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
    fetch('/api/moods', { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllMoods(data); })
      .catch(() => {});
  }, [authLoading, session]);

  useRawgSearch({
    title: state.title,
    editGame,
    authHeaders,
    setRawgResults: state.setRawgResults,
    setShowDropdown: state.setShowDropdown,
    setSearchLoading: state.setSearchLoading,
  });

  const { handleRawgSelect } = useGameDataFetch({
    allMoods,
    authHeaders,
    gameDescription: state.gameDescription,
    setTitle: state.setTitle,
    setBackgroundUrl: state.setBackgroundUrl,
    setRawgId: state.setRawgId,
    setRawgResults: state.setRawgResults as (v: never[]) => void,
    setShowDropdown: state.setShowDropdown,
    setIgdbLoading: state.setIgdbLoading,
    setIgdbLoaded: state.setIgdbLoaded,
    setCoverArtUrl: state.setCoverArtUrl,
    setGameDescription: state.setGameDescription,
    setIgdbId: state.setIgdbId,
    setSelectedMoods: state.setSelectedMoods,
  });

  const toggleMood = (id: string) =>
    state.setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const resetForm = () => {
    state.setTitle('');
    state.setPlatform('pc');
    state.setStatus(defaultStatus);
    state.setPriorityScore(50);
    state.setBackgroundUrl('');
    state.setCoverArtUrl('');
    state.setGameDescription('');
    state.setPersonalNote('');
    state.setRating(null);
    state.setRawgId(null);
    state.setIgdbId(null);
    state.setSelectedMoods([]);
    state.setReplayStatus(null);
    state.setRawgResults([]);
    state.setShowDropdown(false);
    state.setIgdbLoading(false);
    state.setIgdbLoaded(false);
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
      rawg_id: state.rawgId,
      igdb_id: state.igdbId,
      mood_ids: state.selectedMoods,
      replay_status: state.replayStatus,
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
    state.setBackgroundUrl('');
    state.setCoverArtUrl('');
    state.setGameDescription('');
    state.setRawgId(null);
    state.setIgdbId(null);
    state.setIgdbLoaded(false);
  };

  return {
    ...state,
    handleRawgSelect,
    toggleMood,
    handleSubmit,
    handleSubmitAndAdd,
    clearCoverArt,
  };
}
