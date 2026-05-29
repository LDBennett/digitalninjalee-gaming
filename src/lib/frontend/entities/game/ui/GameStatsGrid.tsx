"use client";

interface Stats {
  playing: number;
  ongoing: number;
  backlog: number;
  completed: number;
  completedFull: number;
  wishlist: number;
}

const STAT_CARDS: {
  label: string;
  color: string;
  getValue: (s: Stats) => number;
}[] = [
  {
    label: "Playing",
    color: "text-emerald-400",
    getValue: (s) => s.playing + s.ongoing,
  },
  { label: "Backlog", color: "text-violet-400", getValue: (s) => s.backlog },
  { label: "Completed", color: "text-green-400", getValue: (s) => s.completed },
  {
    label: "100% Complete",
    color: "text-cyan-400",
    getValue: (s) => s.completedFull,
  },
  { label: "Wishlist", color: "text-yellow-400", getValue: (s) => s.wishlist },
];

export function GameStatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="gap-3 md:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
      {STAT_CARDS.map((s) => (
        <div
          key={s.label}
          className="bg-gray-900 p-4 border border-gray-800 rounded-xl"
        >
          <p className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            {s.label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${s.color}`}>
            {s.getValue(stats)}
          </p>
        </div>
      ))}
    </div>
  );
}
