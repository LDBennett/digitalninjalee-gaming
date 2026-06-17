import { GameCardSkeleton } from "@/src/lib/frontend/entities/game";

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* PageHeader — static subtitle always shown on /wishlist */}
      <div className="mb-6">
        <div className="h-7 w-20 animate-pulse rounded bg-gray-800" />
        <div className="mt-0.5 h-4 w-72 animate-pulse rounded bg-gray-800" />
      </div>

      {/* Tabs: All / Interested / Pre-Ordered / Keep-an-Eye-On */}
      <div className="mb-5 flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-gray-800" />
        ))}
      </div>

      {/* Game cards */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
