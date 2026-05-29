import { GameCardSkeleton } from "@/src/lib/frontend/entities/game";

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
          <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-800" />
      </div>

      <div className="mb-5 flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-28 animate-pulse rounded-lg bg-gray-800"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
