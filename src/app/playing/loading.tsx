import { GameCardSkeleton } from "@/src/lib/frontend/entities/game";

export default function PlayingLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-gray-800" />
          <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-800" />
      </div>

      <div className="mb-5 flex gap-1">
        {["Playing", "Ongoing", "Replaying"].map((label) => (
          <div
            key={label}
            className="h-9 w-24 animate-pulse rounded-lg bg-gray-800"
          />
        ))}
      </div>

      <div className="mb-5 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-800" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
