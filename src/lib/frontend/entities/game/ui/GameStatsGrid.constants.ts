import { ClipboardList, Gift, SquarePlay, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Stats {
  playing: number;
  ongoing: number;
  backlog: number;
  completed: number;
  completedFull: number;
  wishlist: number;
}

export type StatCard =
  | {
      label: string;
      color: string;
      activeColor: string;
      accentBorder: string;
      activeBorder: string;
      ambient: string;
      activeAmbient: string;
      Icon: LucideIcon;
      filterKey?: string;
      kind: "single";
      getValue: (s: Stats) => number;
    }
  | {
      label: string;
      color: string;
      activeColor: string;
      accentBorder: string;
      activeBorder: string;
      ambient: string;
      activeAmbient: string;
      Icon: LucideIcon;
      filterKey?: string;
      kind: "split";
      getPrimary: (s: Stats) => number;
      getSecondary: (s: Stats) => number;
      subLabel: string;
    };

export const STAT_CARDS: StatCard[] = [
  {
    kind: "single",
    label: "Playing",
    color: "text-emerald-400",
    activeColor: "text-emerald-300",
    accentBorder: "border-l-emerald-800",
    activeBorder: "border-l-emerald-500",
    ambient: "from-emerald-950/60",
    activeAmbient: "from-emerald-900/30",
    Icon: SquarePlay,
    filterKey: "playing",
    getValue: (s) => s.playing + s.ongoing,
  },
  {
    kind: "single",
    label: "Backlog",
    color: "text-violet-400",
    activeColor: "text-violet-300",
    accentBorder: "border-l-violet-800",
    activeBorder: "border-l-violet-500",
    ambient: "from-violet-950/60",
    activeAmbient: "from-violet-900/30",
    Icon: ClipboardList,
    filterKey: "backlog",
    getValue: (s) => s.backlog,
  },
  {
    kind: "split",
    label: "Completed",
    color: "text-sky-400",
    activeColor: "text-sky-300",
    accentBorder: "border-l-sky-800",
    activeBorder: "border-l-sky-500",
    ambient: "from-sky-950/60",
    activeAmbient: "from-sky-900/30",
    Icon: Trophy,
    filterKey: "completed",
    getPrimary: (s) => s.completedFull,
    getSecondary: (s) => s.completed,
    subLabel: "100% clear / total",
  },
  {
    kind: "single",
    label: "Wishlist",
    color: "text-yellow-400",
    activeColor: "text-yellow-300",
    accentBorder: "border-l-yellow-800",
    activeBorder: "border-l-yellow-500",
    ambient: "from-yellow-950/60",
    activeAmbient: "from-yellow-900/30",
    Icon: Gift,
    filterKey: "wishlist",
    getValue: (s) => s.wishlist,
  },
];
