"use client";

export function GameModalSkeleton() {
  return (
    <div
      className="grid animate-pulse grid-cols-1 gap-6 p-6 md:grid-cols-12"
      data-testid="game-modal-skeleton"
    >
      {/* Left Column Skeleton */}
      <div className="flex flex-col items-center space-y-4 md:col-span-4 md:items-start">
        <div className="aspect-[3/4] w-36 rounded-xl bg-gray-800 sm:w-44" />
        <div className="w-full space-y-3">
          <div className="h-9 w-full rounded-lg bg-gray-800" />
          <div className="h-6 w-28 rounded bg-gray-800" />
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="space-y-4 md:col-span-8">
        <div className="flex gap-2 border-b border-gray-800 pb-3">
          <div className="h-8 w-20 rounded bg-gray-800" />
          <div className="h-8 w-24 rounded bg-gray-800" />
          <div className="h-8 w-28 rounded bg-gray-800" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 rounded-lg bg-gray-800" />
          <div className="h-10 rounded-lg bg-gray-800" />
        </div>
        <div className="h-24 w-full rounded-lg bg-gray-800" />
        <div className="h-10 w-full rounded-lg bg-gray-800" />
      </div>
    </div>
  );
}
