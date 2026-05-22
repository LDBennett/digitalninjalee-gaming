"use client";

import {
  useLibrary,
  LibraryTab,
  LIBRARY_TAB_LABELS,
} from "@/src/domains/backlog/hooks/useLibrary";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";

const TABS: LibraryTab[] = ["completed", "ongoing", "dropped"];

export default function LibraryPage() {
  const {
    games,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  } = useLibrary();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-bold text-white text-2xl">Library</h1>
        {/* Mobile: dropdown */}
        <div className="sm:hidden mt-3">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as LibraryTab)}
            className="bg-gray-900 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm"
          >
            {TABS.map((t) => (
              <option key={t} value={t}>
                {LIBRARY_TAB_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop: tabs */}
        <div className="hidden sm:flex gap-1 bg-gray-900 mt-3 p-1 border border-gray-800 rounded-lg">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {LIBRARY_TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} className="mt-3" />
      </div>

      {games.length === 0 ? (
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
          <p className="text-gray-500 text-lg">
            No {LIBRARY_TAB_LABELS[tab].toLowerCase()} games yet
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
          <p className="text-gray-500 text-lg">No games found for &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              {filtered.length} game{filtered.length !== 1 ? "s" : ""}
            </p>
            {paginated.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onDelete={isAuthenticated ? handleDelete : undefined}
                onStatusChange={
                  isAuthenticated ? handleStatusChange : undefined
                }
                showStatusBadge={tab === "completed"}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {editGame && (
        <AddGameModal
          isOpen
          onClose={() => setEditGame(null)}
          onSave={handleEdit}
          editGame={editGame}
          moods={moods}
        />
      )}
    </div>
  );
}
