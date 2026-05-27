"use client";

import { useState, useEffect } from "react";
import {
  GameDto,
  GameStatus,
  Platform,
  ReplayStatus,
} from "@/src/domains/games/models/game.types";
import { AddGamePayload } from "@/src/domains/games/components/add-game/AddGameModal";

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
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [status, setStatus] = useState<GameStatus>(defaultStatus);
  const [priorityScore, setPriorityScore] = useState(50);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [externalId, setExternalId] = useState<string | null>(null);
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
      setCoverUrl(editGame.cover_url ?? "");
      setCoverArtUrl(editGame.cover_art_url ?? "");
      setGameDescription(editGame.game_description ?? "");
      setExternalId(editGame.external_id ?? null);
      setSelectedMoods(editGame.moods?.map((m) => m.id) ?? []);
      setReplayStatus(editGame.replay_status ?? null);
    } else {
      setTitle("");
      setPlatform("pc");
      setStatus(defaultStatus);
      setPriorityScore(50);
      setCoverUrl("");
      setCoverArtUrl("");
      setGameDescription("");
      setExternalId(null);
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
        const res = await fetch(`/api/rawg?q=${encodeURIComponent(title.trim())}`);
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
    setCoverUrl(game.coverUrl ?? "");
    setExternalId(String(game.id));
    setRawgResults([]);
    setShowDropdown(false);
    setIgdbLoading(true);
    setIgdbLoaded(false);
    try {
      const res = await fetch(`/api/igdb?q=${encodeURIComponent(game.name)}`);
      const data = await res.json();
      if (data?.coverArtUrl) setCoverArtUrl(data.coverArtUrl);
      if (data?.summary) setGameDescription(data.summary);
      setIgdbLoaded(true);
    } catch {
      // IGDB is best-effort; RAWG data still saved
    } finally {
      setIgdbLoading(false);
    }
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
    setCoverUrl("");
    setCoverArtUrl("");
    setGameDescription("");
    setExternalId(null);
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
      cover_url: coverUrl.trim() || null,
      cover_art_url: coverArtUrl.trim() || null,
      game_description: gameDescription.trim() || null,
      external_id: externalId,
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
    setCoverUrl("");
    setCoverArtUrl("");
    setGameDescription("");
    setExternalId(null);
    setIgdbLoaded(false);
  };

  return {
    title, setTitle,
    platform, setPlatform,
    status, setStatus,
    priorityScore, setPriorityScore,
    coverUrl, setCoverUrl,
    coverArtUrl, setCoverArtUrl,
    gameDescription, setGameDescription,
    externalId, setExternalId,
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
