"use client";

import { Badge } from "@/src/lib/frontend/shared";

type MoodName =
  | "action"
  | "chill"
  | "story"
  | "trophy-or-achievement-hunting"
  | "online"
  | "multiplayer"
  | "co-op"
  | "tactical"
  | "puzzle"
  | "quick-session"
  | "new-release"
  | "retro"
  | "open-world"
  | "rpg"
  | "sports"
  | "indie"
  | "vr"
  | "family-friendly"
  | "roguelike"
  | "strategy"
  | "adventure"
  | "fighting"
  | "rhythm"
  | "shooter";

const MOOD_STYLES: Record<
  MoodName,
  { bg: string; text: string; label: string }
> = {
  action: {
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-300",
    label: "Action",
  },
  chill: {
    bg: "bg-sky-500/15 border-sky-500/30",
    text: "text-sky-300",
    label: "Chill",
  },
  story: {
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-300",
    label: "Story",
  },
  "trophy-or-achievement-hunting": {
    bg: "bg-yellow-500/15 border-yellow-500/30",
    text: "text-yellow-300",
    label: "Trophy Hunting",
  },
  online: {
    bg: "bg-cyan-500/15 border-cyan-500/30",
    text: "text-cyan-300",
    label: "Online",
  },
  multiplayer: {
    bg: "bg-green-500/15 border-green-500/30",
    text: "text-green-300",
    label: "Multiplayer",
  },
  "co-op": {
    bg: "bg-teal-500/15 border-teal-500/30",
    text: "text-teal-300",
    label: "Co-op",
  },
  tactical: {
    bg: "bg-orange-500/15 border-orange-500/30",
    text: "text-orange-300",
    label: "Tactical",
  },
  puzzle: {
    bg: "bg-violet-500/15 border-violet-500/30",
    text: "text-violet-300",
    label: "Puzzle",
  },
  "quick-session": {
    bg: "bg-lime-500/15 border-lime-500/30",
    text: "text-lime-300",
    label: "Quick Session",
  },
  "new-release": {
    bg: "bg-pink-500/15 border-pink-500/30",
    text: "text-pink-300",
    label: "New Release",
  },
  retro: {
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-300",
    label: "Retro",
  },
  "open-world": {
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-300",
    label: "Open World",
  },
  rpg: {
    bg: "bg-indigo-500/15 border-indigo-500/30",
    text: "text-indigo-300",
    label: "RPG",
  },
  sports: {
    bg: "bg-sky-500/15 border-sky-500/30",
    text: "text-sky-300",
    label: "Sports",
  },
  indie: {
    bg: "bg-fuchsia-500/15 border-fuchsia-500/30",
    text: "text-fuchsia-300",
    label: "Indie",
  },
  vr: {
    bg: "bg-rose-500/15 border-rose-500/30",
    text: "text-rose-300",
    label: "VR",
  },
  "family-friendly": {
    bg: "bg-green-500/15 border-green-500/30",
    text: "text-green-300",
    label: "Family Friendly",
  },
  roguelike: {
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-300",
    label: "Roguelike",
  },
  strategy: {
    bg: "bg-slate-500/15 border-slate-500/30",
    text: "text-slate-300",
    label: "Strategy",
  },
  adventure: {
    bg: "bg-yellow-500/15 border-yellow-500/30",
    text: "text-yellow-300",
    label: "Adventure",
  },
  fighting: {
    bg: "bg-orange-500/15 border-orange-500/30",
    text: "text-orange-300",
    label: "Fighting",
  },
  rhythm: {
    bg: "bg-pink-500/15 border-pink-500/30",
    text: "text-pink-300",
    label: "Rhythm",
  },
  shooter: {
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-300",
    label: "Shooter",
  },
};

export function getMoodLabel(mood: string): string {
  return MOOD_STYLES[mood as MoodName]?.label ?? mood;
}

export function getMoodStyle(
  mood: string,
): { bg: string; text: string; label: string } | undefined {
  return MOOD_STYLES[mood as MoodName];
}

export function MoodBadge({
  mood,
  className,
}: {
  mood: string;
  className?: string;
}) {
  const style = MOOD_STYLES[mood as MoodName];
  if (!style) return null;
  return (
    <Badge bg={style.bg} text={style.text} className={className}>
      {style.label}
    </Badge>
  );
}
