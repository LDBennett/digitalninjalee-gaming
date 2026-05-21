'use client';

import { useState } from 'react';
import { GameDto } from '@/src/Application/DTOs/GameDto';
import { MoodDto } from '@/src/Application/DTOs/MoodDto';
import { MoodBadge } from '@/src/Presentation/Web/Components/MoodBadge';
import { PlatformBadge } from '@/src/Presentation/Web/Components/PlatformBadge';

interface RandomPickerProps {
  isOpen: boolean;
  onClose: () => void;
  moods: MoodDto[];
}

export function RandomPicker({ isOpen, onClose, moods }: RandomPickerProps) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [pickedGame, setPickedGame] = useState<GameDto | null>(null);
  const [noGamesMsg, setNoGamesMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMood = (name: string) => {
    setSelectedMoods((prev) => (prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]));
    setPickedGame(null);
    setNoGamesMsg('');
  };

  const pick = async () => {
    setLoading(true);
    setPickedGame(null);
    setNoGamesMsg('');

    const params = new URLSearchParams({ status: 'backlog' });
    if (selectedMoods.length) params.set('moods', selectedMoods.join(','));

    await new Promise((r) => setTimeout(r, 900));

    const res = await fetch(`/api/games/random?${params}`);
    const data = await res.json();
    setLoading(false);

    if (data.game) setPickedGame(data.game);
    else setNoGamesMsg(data.message ?? 'No games found');
  };

  const handleClose = () => {
    setPickedGame(null);
    setSelectedMoods([]);
    setNoGamesMsg('');
    onClose();
  };

  if (!isOpen) return null;

  const gameMoods = pickedGame?.moods ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">🎲 Pick a Game</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">Filter by mood (optional)</p>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => toggleMood(mood.name)}
                  className={`transition-all duration-150 ${
                    selectedMoods.includes(mood.name) ? 'ring-2 ring-white/40 scale-105' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <MoodBadge mood={mood.name} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={pick}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 disabled:opacity-60 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block">🎲</span> Picking…
              </span>
            ) : (
              'Pick For Me'
            )}
          </button>

          {noGamesMsg && (
            <p className="text-center text-gray-500 text-sm py-2">{noGamesMsg}</p>
          )}

          {pickedGame && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3 slide-up">
              <div className="flex gap-3">
                <div className="shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-gray-700">
                  {pickedGame.cover_url ? (
                    <img src={pickedGame.cover_url} alt={pickedGame.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                      <span className="text-xl font-bold text-white/30">
                        {pickedGame.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-purple-400 font-medium mb-0.5">Tonight you&apos;re playing…</p>
                  <h3 className="font-bold text-white leading-snug">{pickedGame.title}</h3>
                  <div className="mt-1.5">
                    <PlatformBadge platform={pickedGame.platform} />
                  </div>
                </div>
              </div>
              {gameMoods.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {gameMoods.map((mood) => (
                    <MoodBadge key={mood.id} mood={mood.name} />
                  ))}
                </div>
              )}
              <button onClick={pick} className="w-full text-xs text-gray-500 hover:text-white transition-colors py-1">
                Pick again →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
