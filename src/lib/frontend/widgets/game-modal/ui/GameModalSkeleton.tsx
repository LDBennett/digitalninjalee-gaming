"use client";

export function GameModalSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 animate-pulse" data-testid="game-modal-skeleton">
      {/* Left Column Skeleton */}
      <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-4">
        <div className="aspect-[3/4] w-36 sm:w-44 rounded-xl bg-gray-800" />
        <div className="w-full space-y-3">
          <div className="h-9 w-full rounded-lg bg-gray-800" />
          <div className="h-6 w-28 rounded bg-gray-800" />
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="md:col-span-8 space-y-4">
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
