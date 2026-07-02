export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex gap-4 p-4">
        <div className="h-30 w-14 shrink-0 animate-pulse rounded-lg bg-gray-800" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800" />
          <div className="mt-2 flex gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-12 animate-pulse rounded bg-gray-800" />
          </div>
          <div className="mt-3 flex gap-1">
            <div className="h-4 w-14 animate-pulse rounded-full bg-gray-800" />
            <div className="h-4 w-10 animate-pulse rounded-full bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
