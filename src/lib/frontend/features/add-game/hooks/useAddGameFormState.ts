"use client";

import { useState, useEffect } from "react";
import {
  GameDto,
  GameStatus,
  Platform,
  ReplayStatus,
  PlayGoal,
} from "@/src/lib/backend/backlog/domain/models";
import { IgdbSearchResult } from "@/src/lib/frontend/features/add-game/types";

export function useAddGameFormState(
  editGame: GameDto | null | undefined,
  isOpen: boolean,
  defaultStatus: GameStatus,
) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [status, setStatus] = useState<GameStatus>(defaultStatus);
  const [priorityScore, setPriorityScore] = useState(50);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [igdbId, setIgdbId] = useState<number | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [replayStatus, setReplayStatus] = useState<ReplayStatus>(null);
  const [selectedPlayGoals, setSelectedPlayGoals] = useState<PlayGoal[]>([]);
  const [saving, setSaving] = useState(false);
  const [igdbResults, setIgdbResults] = useState<IgdbSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichLoaded, setEnrichLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editGame) {
      setTitle(editGame.title);
      setPlatform(editGame.platform);
      setStatus(editGame.status);
      setPriorityScore(editGame.priority_score);
      setBackgroundUrl(editGame.background_url ?? "");
      setCoverArtUrl(editGame.cover_art_url ?? "");
      setGameDescription(editGame.game_description ?? "");
      setPersonalNote(editGame.personal_note ?? "");
      setRating(editGame.rating ?? null);
      setIgdbId(null);
      setSelectedMoods(editGame.moods?.map((m) => m.id) ?? []);
      setReplayStatus(editGame.replay_status ?? null);
      setSelectedPlayGoals(editGame.play_goals ?? []);
    } else {
      setTitle("");
      setPlatform("pc");
      setStatus(defaultStatus);
      setPriorityScore(50);
      setBackgroundUrl("");
      setCoverArtUrl("");
      setGameDescription("");
      setPersonalNote("");
      setRating(null);
      setIgdbId(null);
      setSelectedMoods([]);
      setReplayStatus(null);
      setSelectedPlayGoals([]);
    }
    setIgdbResults([]);
    setShowDropdown(false);
    setEnrichLoading(false);
    setEnrichLoaded(false);
  }, [editGame, isOpen, defaultStatus]);

  return {
    title,
    setTitle,
    platform,
    setPlatform,
    status,
    setStatus,
    priorityScore,
    setPriorityScore,
    backgroundUrl,
    setBackgroundUrl,
    coverArtUrl,
    setCoverArtUrl,
    gameDescription,
    setGameDescription,
    personalNote,
    setPersonalNote,
    rating,
    setRating,
    igdbId,
    setIgdbId,
    selectedMoods,
    setSelectedMoods,
    replayStatus,
    setReplayStatus,
    selectedPlayGoals,
    setSelectedPlayGoals,
    saving,
    setSaving,
    igdbResults,
    setIgdbResults,
    showDropdown,
    setShowDropdown,
    searchLoading,
    setSearchLoading,
    enrichLoading,
    setEnrichLoading,
    enrichLoaded,
    setEnrichLoaded,
  };
}
