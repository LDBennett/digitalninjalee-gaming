'use client';

import { useState, useEffect } from 'react';
import { GameDto, GameStatus, Platform, ReplayStatus } from '@/src/lib/backend/backlog/domain/models';
import { RawgResult } from '@/src/lib/frontend/features/add-game/types';

export function useAddGameFormState(
  editGame: GameDto | null | undefined,
  isOpen: boolean,
  defaultStatus: GameStatus,
) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<Platform>('pc');
  const [status, setStatus] = useState<GameStatus>(defaultStatus);
  const [priorityScore, setPriorityScore] = useState(50);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [rawgId, setRawgId] = useState<number | null>(null);
  const [igdbId, setIgdbId] = useState<number | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [replayStatus, setReplayStatus] = useState<ReplayStatus>(null);
  const [saving, setSaving] = useState(false);
  const [rawgResults, setRawgResults] = useState<RawgResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [igdbLoading, setIgdbLoading] = useState(false);
  const [igdbLoaded, setIgdbLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editGame) {
      setTitle(editGame.title);
      setPlatform(editGame.platform);
      setStatus(editGame.status);
      setPriorityScore(editGame.priority_score);
      setBackgroundUrl(editGame.background_url ?? '');
      setCoverArtUrl(editGame.cover_art_url ?? '');
      setGameDescription(editGame.game_description ?? '');
      setPersonalNote(editGame.personal_note ?? '');
      setRating(editGame.rating ?? null);
      setRawgId(null);
      setIgdbId(null);
      setSelectedMoods(editGame.moods?.map((m) => m.id) ?? []);
      setReplayStatus(editGame.replay_status ?? null);
    } else {
      setTitle('');
      setPlatform('pc');
      setStatus(defaultStatus);
      setPriorityScore(50);
      setBackgroundUrl('');
      setCoverArtUrl('');
      setGameDescription('');
      setPersonalNote('');
      setRating(null);
      setRawgId(null);
      setIgdbId(null);
      setSelectedMoods([]);
      setReplayStatus(null);
    }
    setRawgResults([]);
    setShowDropdown(false);
    setIgdbLoading(false);
    setIgdbLoaded(false);
  }, [editGame, isOpen, defaultStatus]);

  return {
    title, setTitle,
    platform, setPlatform,
    status, setStatus,
    priorityScore, setPriorityScore,
    backgroundUrl, setBackgroundUrl,
    coverArtUrl, setCoverArtUrl,
    gameDescription, setGameDescription,
    personalNote, setPersonalNote,
    rating, setRating,
    rawgId, setRawgId,
    igdbId, setIgdbId,
    selectedMoods, setSelectedMoods,
    replayStatus, setReplayStatus,
    saving, setSaving,
    rawgResults, setRawgResults,
    showDropdown, setShowDropdown,
    searchLoading, setSearchLoading,
    igdbLoading, setIgdbLoading,
    igdbLoaded, setIgdbLoaded,
  };
}
