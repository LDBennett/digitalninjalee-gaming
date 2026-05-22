export function GameCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="bg-gray-800 rounded-lg w-14 h-20 shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-800 rounded h-4 w-3/4 animate-pulse" />
          <div className="flex gap-2 mt-2">
            <div className="bg-gray-800 rounded h-4 w-16 animate-pulse" />
            <div className="bg-gray-800 rounded h-4 w-12 animate-pulse" />
          </div>
          <div className="flex gap-1 mt-3">
            <div className="bg-gray-800 rounded-full h-4 w-14 animate-pulse" />
            <div className="bg-gray-800 rounded-full h-4 w-10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
