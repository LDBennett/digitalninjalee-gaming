"use client";

import { useState, useEffect } from "react";
import {
  GameDto,
  GameStatus,
  Platform,
  ReplayStatus,
} from "@/src/domains/games/models/game.types";
import { MoodDto } from "@/src/domains/games/models/mood.types";
import { AddGamePayload } from "@/src/domains/games/components/add-game/AddGameModal";
import { useAuthFetch } from "@/src/domains/shared/auth/useAuthFetch";
import { useAuthStore } from "@/src/domains/shared/auth/auth.store";

export interface RawgResult {
  id: number;
  name: string;
  coverUrl: string | null;
  released: string | null;
}

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
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [status, setStatus] = useState<GameStatus>(defaultStatus);
  const [priorityScore, setPriorityScore] = useState(50);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [personalNote, setPersonalNote] = useState("");
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

  // Mood list is needed to resolve suggested mood names → IDs
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
      setRawgId(null);
      setIgdbId(null);
      setSelectedMoods(editGame.moods?.map((m) => m.id) ?? []);
      setReplayStatus(editGame.replay_status ?? null);
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

  useEffect(() => {
    if (editGame || title.trim().length < 2) {
      setRawgResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/rawg?q=${encodeURIComponent(title.trim())}`, { headers: authHeaders() });
        const data = await res.json();
        setRawgResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, editGame]);

  const handleRawgSelect = async (game: RawgResult) => {
    setTitle(game.name);
    setBackgroundUrl(game.coverUrl ?? "");
    setRawgId(game.id);
    setRawgResults([]);
    setShowDropdown(false);
    setIgdbLoading(true);
    setIgdbLoaded(false);

    const [igdbResult, rawgDetailResult] = await Promise.allSettled([
      fetch(`/api/igdb?q=${encodeURIComponent(game.name)}`, { headers: authHeaders() }).then((r) => r.json()),
      fetch(`/api/rawg/${game.id}`, { headers: authHeaders() }).then((r) => r.json()),
    ]);

    const moodNameToId = new Map<string, string>(
      allMoods.map((m) => [m.name, m.id]),
    );
    const suggestedMoodNames = new Set<string>();

    // Apply IGDB data (returns suggestedMoods: string[] alongside IgdbGameData)
    if (igdbResult.status === "fulfilled" && igdbResult.value) {
      const igdb = igdbResult.value;
      if (igdb.coverArtUrl) setCoverArtUrl(igdb.coverArtUrl);
      if (igdb.summary) setGameDescription(igdb.summary);
      if (igdb.igdbId) setIgdbId(igdb.igdbId);
      for (const name of (igdb.suggestedMoods as string[] | undefined) ?? []) suggestedMoodNames.add(name);
    }

    // Apply RAWG detail data (returns suggestedMoods: string[] alongside RawgGameData)
    if (rawgDetailResult.status === "fulfilled" && rawgDetailResult.value) {
      const rawg = rawgDetailResult.value;
      // Use RAWG description only as fallback
      if (!gameDescription && rawg.description) setGameDescription(rawg.description);
      for (const name of (rawg.suggestedMoods as string[] | undefined) ?? []) suggestedMoodNames.add(name);
    }

    // Merge suggested moods into selected (add only, never remove user's existing picks)
    const newMoodIds = [...suggestedMoodNames]
      .map((name) => moodNameToId.get(name))
      .filter((id): id is string => id !== undefined);

    if (newMoodIds.length > 0) {
      setSelectedMoods((prev) => [...new Set([...prev, ...newMoodIds])]);
    }

    setIgdbLoaded(true);
    setIgdbLoading(false);
  };

  const toggleMood = (id: string) =>
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const resetForm = () => {
    setTitle("");
    setPlatform("pc");
    setStatus(defaultStatus);
    setPriorityScore(50);
    setBackgroundUrl("");
    setCoverArtUrl("");
    setGameDescription("");
    setPersonalNote("");
    setRating(null);
    setRawgId(null);
    setIgdbId(null);
    setSelectedMoods([]);
    setReplayStatus(null);
    setRawgResults([]);
    setShowDropdown(false);
    setIgdbLoading(false);
    setIgdbLoaded(false);
  };

  const doSave = async () => {
    if (!title.trim()) return false;
    setSaving(true);
    await onSave({
      title: title.trim(),
      platform,
      status,
      priority_score: priorityScore,
      background_url: backgroundUrl.trim() || null,
      cover_art_url: coverArtUrl.trim() || null,
      game_description: gameDescription.trim() || null,
      personal_note: personalNote.trim() || null,
      rating,
      rawg_id: rawgId,
      igdb_id: igdbId,
      mood_ids: selectedMoods,
      replay_status: replayStatus,
    });
    setSaving(false);
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
    setBackgroundUrl("");
    setCoverArtUrl("");
    setGameDescription("");
    setRawgId(null);
    setIgdbId(null);
    setIgdbLoaded(false);
  };

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
    selectedMoods,
    replayStatus, setReplayStatus,
    saving,
    rawgResults,
    showDropdown, setShowDropdown,
    searchLoading,
    igdbLoading,
    igdbLoaded,
    handleRawgSelect,
    toggleMood,
    handleSubmit,
    handleSubmitAndAdd,
    clearCoverArt,
  };
}
