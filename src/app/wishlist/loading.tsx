import { GameCardSkeleton } from "@/src/lib/frontend/entities/game";

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex justify-between items-center gap-4 mb-5">
        <div>
          <div className="bg-gray-800 rounded w-20 h-7 animate-pulse" />
          <div className="bg-gray-800 mt-1.5 rounded w-24 h-4 animate-pulse" />
        </div>
        <div className="bg-gray-800 rounded-lg w-24 h-9 animate-pulse" />
      </div>

      <div className="flex gap-1 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg w-28 h-9 animate-pulse"
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
