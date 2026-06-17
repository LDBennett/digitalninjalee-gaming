import { GameCardSkeleton } from "@/src/lib/frontend/entities/game";

export default function BacklogLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* PageHeader */}
      <div className="mb-6">
        <div className="h-7 w-24 animate-pulse rounded bg-gray-800" />
        <div className="mt-1.5 h-4 w-32 animate-pulse rounded bg-gray-800" />
      </div>

      {/* Search + sort */}
      <div className="mb-5 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-800" />
      </div>

      {/* Game cards */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
