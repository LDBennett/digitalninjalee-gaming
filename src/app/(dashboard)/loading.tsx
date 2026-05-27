import { GameCardSkeleton } from "@/src/domains/games/components/card/GameCardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex justify-between items-center gap-4 mb-8">
        <div>
          <div className="bg-gray-800 rounded w-28 h-7 animate-pulse" />
          <div className="bg-gray-800 rounded w-32 h-4 animate-pulse mt-1.5" />
        </div>
        <div className="bg-gray-800 rounded-lg w-32 h-9 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-20 animate-pulse" />
        ))}
      </div>

      <div className="flex gap-1 mb-6">
        <div className="bg-gray-800 rounded-lg w-28 h-9 animate-pulse" />
        <div className="bg-gray-800 rounded-lg w-20 h-9 animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
