import { GameCardSkeleton } from "@/src/domains/games/components/card/GameCardSkeleton";

export default function PlayingLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex justify-between items-center gap-4 mb-5">
        <div>
          <div className="bg-gray-800 rounded w-32 h-7 animate-pulse" />
          <div className="bg-gray-800 rounded w-24 h-4 animate-pulse mt-1.5" />
        </div>
        <div className="bg-gray-800 rounded-lg w-24 h-9 animate-pulse" />
      </div>

      <div className="flex gap-1 mb-5">
        {["Playing", "Ongoing", "Replaying"].map((label) => (
          <div key={label} className="bg-gray-800 rounded-lg w-24 h-9 animate-pulse" />
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <div className="bg-gray-800 rounded-lg flex-1 h-10 animate-pulse" />
        <div className="bg-gray-800 rounded-lg w-24 h-10 animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
