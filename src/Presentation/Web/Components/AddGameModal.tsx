'use client';

import { useState, useEffect } from 'react';
import { GameDto } from '@/src/Application/DTOs/GameDto';
import { MoodDto } from '@/src/Application/DTOs/MoodDto';
import { Platform, PLATFORMS } from '@/src/Domain/ValueObjects/Platform';
import { GameStatus, GAME_STATUSES } from '@/src/Domain/ValueObjects/GameStatus';
import { MoodBadge } from '@/src/Presentation/Web/Components/MoodBadge';

const PLATFORM_LABELS: Record<Platform, string> = {
  pc:          'PC',
  xbox:        'Xbox',
  playstation: 'PlayStation',
  switch:      'Switch',
  other:       'Other',
};

const STATUS_LABELS: Record<GameStatus, string> = {
  backlog:   'Backlog',
  playing:   'Playing',
  completed: 'Completed',
  dropped:   'Dropped',
};

export interface AddGamePayload {
  title: string;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  cover_url: string | null;
  mood_ids: string[];
}

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddGamePayload) => Promise<void>;
  editGame?: GameDto | null;
  moods: MoodDto[];
}

export function AddGameModal({ isOpen, onClose, onSave, editGame, moods }: AddGameModalProps) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<Platform>('pc');
  const [status, setStatus] = useState<GameStatus>('backlog');
  const [priorityScore, setPriorityScore] = useState(50);
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editGame) {
      setTitle(editGame.title);
      setPlatform(editGame.platform);
      setStatus(editGame.status);
      setPriorityScore(editGame.priority_score);
      setCoverUrl(editGame.cover_url ?? '');
      setSelectedMoods(editGame.moods?.map((m) => m.id) ?? []);
    } else {
      setTitle('');
      setPlatform('pc');
      setStatus('backlog');
      setPriorityScore(50);
      setCoverUrl('');
      setSelectedMoods([]);
    }
  }, [editGame, isOpen]);

  const toggleMood = (id: string) =>
    setSelectedMoods((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      platform,
      status,
      priority_score: priorityScore,
      cover_url: coverUrl.trim() || null,
      mood_ids: selectedMoods,
    });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">{editGame ? 'Edit Game' : 'Add Game'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Game title..."
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-600 text-sm"
              >
                {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GameStatus)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-600 text-sm"
              >
                {GAME_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Priority: <span className="text-purple-400 font-semibold">{priorityScore}</span>
              <span className="text-gray-600 ml-2">(1 = lowest · 100 = highest)</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={priorityScore}
              onChange={(e) => setPriorityScore(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-700 mt-0.5">
              <span>Low</span><span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Cover Image URL (optional)</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Mood Tags</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => toggleMood(mood.id)}
                  className={`transition-all duration-150 ${
                    selectedMoods.includes(mood.id) ? 'ring-2 ring-white/40 scale-105' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <MoodBadge mood={mood.name} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : editGame ? 'Update' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
