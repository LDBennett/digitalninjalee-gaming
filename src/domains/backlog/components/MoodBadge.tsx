'use client';

type MoodName =
  | 'action' | 'chill' | 'story' | 'trophy-or-achievement-hunting'
  | 'online' | 'multiplayer' | 'co-op' | 'tactical' | 'puzzle'
  | 'quick-session' | 'new-release' | 'retro' | 'open-world' | 'rpg'
  | 'sports' | 'indie' | 'vr' | 'family-friendly' | 'roguelike'
  | 'strategy' | 'adventure' | 'fighting' | 'rhythm';

const MOOD_STYLES: Record<MoodName, { bg: string; text: string; label: string }> = {
  action:                          { bg: 'bg-red-900/60',      text: 'text-red-400',      label: 'Action' },
  chill:                           { bg: 'bg-sky-900/60',      text: 'text-sky-400',      label: 'Chill' },
  story:                           { bg: 'bg-brand-900/60',   text: 'text-brand-400',   label: 'Story' },
  'trophy-or-achievement-hunting': { bg: 'bg-yellow-900/60',   text: 'text-yellow-400',   label: 'Trophy Hunting' },
  online:                          { bg: 'bg-cyan-900/60',     text: 'text-cyan-400',     label: 'Online' },
  multiplayer:                     { bg: 'bg-green-900/60',    text: 'text-green-400',    label: 'Multiplayer' },
  'co-op':                         { bg: 'bg-teal-900/60',     text: 'text-teal-400',     label: 'Co-op' },
  tactical:                        { bg: 'bg-orange-900/60',   text: 'text-orange-400',   label: 'Tactical' },
  puzzle:                          { bg: 'bg-violet-900/60',   text: 'text-violet-400',   label: 'Puzzle' },
  'quick-session':                 { bg: 'bg-lime-900/60',     text: 'text-lime-400',     label: 'Quick Session' },
  'new-release':                   { bg: 'bg-pink-900/60',     text: 'text-pink-400',     label: 'New Release' },
  retro:                           { bg: 'bg-amber-900/60',    text: 'text-amber-400',    label: 'Retro' },
  'open-world':                    { bg: 'bg-emerald-900/60',  text: 'text-emerald-400',  label: 'Open World' },
  rpg:                             { bg: 'bg-indigo-900/60',   text: 'text-indigo-400',   label: 'RPG' },
  sports:                          { bg: 'bg-brand-900/60',     text: 'text-brand-400',     label: 'Sports' },
  indie:                           { bg: 'bg-fuchsia-900/60',  text: 'text-fuchsia-400',  label: 'Indie' },
  vr:                              { bg: 'bg-rose-900/60',     text: 'text-rose-400',     label: 'VR' },
  'family-friendly':               { bg: 'bg-green-900/60',    text: 'text-green-300',    label: 'Family Friendly' },
  roguelike:                       { bg: 'bg-red-900/60',      text: 'text-red-300',      label: 'Roguelike' },
  strategy:                        { bg: 'bg-slate-700/60',    text: 'text-slate-300',    label: 'Strategy' },
  adventure:                       { bg: 'bg-yellow-900/60',   text: 'text-yellow-300',   label: 'Adventure' },
  fighting:                        { bg: 'bg-orange-900/60',   text: 'text-orange-300',   label: 'Fighting' },
  rhythm:                          { bg: 'bg-pink-900/60',     text: 'text-pink-300',     label: 'Rhythm' },
};

export function getMoodLabel(mood: string): string {
  return MOOD_STYLES[mood as MoodName]?.label ?? mood;
}

export function MoodBadge({ mood }: { mood: string }) {
  const style = MOOD_STYLES[mood as MoodName];
  if (!style) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
