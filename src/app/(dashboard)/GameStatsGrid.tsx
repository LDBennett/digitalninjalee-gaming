"use client";

interface Stats {
  playing: number;
  backlog: number;
  completed: number;
  ongoing: number;
  wishlist: number;
}

interface Props {
  stats: Stats;
}

const STAT_CARDS = [
  { key: "playing" as const, label: "Playing", color: "text-emerald-400" },
  { key: "backlog" as const, label: "Backlog", color: "text-violet-400" },
  { key: "completed" as const, label: "Completed", color: "text-green-400" },
  { key: "ongoing" as const, label: "Ongoing", color: "text-cyan-400" },
  { key: "wishlist" as const, label: "Wishlist", color: "text-yellow-400" },
] as const;

export function GameStatsGrid({ stats }: Props) {
  return (
    <div className="gap-3 md:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
      {STAT_CARDS.map((s) => (
        <div key={s.label} className="bg-gray-900 p-4 border border-gray-800 rounded-xl">
          <p className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            {s.label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${s.color}`}>{stats[s.key]}</p>
        </div>
      ))}
    </div>
  );
}
