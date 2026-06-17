export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* PageHeader */}
      <div className="mb-8">
        <div className="h-7 w-28 animate-pulse rounded bg-gray-800" />
        <div className="mt-1.5 h-4 w-36 animate-pulse rounded bg-gray-800" />
      </div>

      {/* Stats grid — 4 cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-l-2 border-gray-800 bg-gray-900"
          />
        ))}
      </div>

      {/* Hero + queue two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Hero card */}
        <div className="h-75 animate-pulse rounded-2xl border border-gray-800 bg-gray-900 md:h-90 lg:col-span-3" />

        {/* Backlog queue */}
        <div className="flex flex-col gap-2 lg:col-span-2">
          <div className="mb-1 h-4 w-36 animate-pulse rounded bg-gray-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-gray-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-800" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-800" />
              </div>
              <div className="h-5 w-14 animate-pulse rounded-full bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
