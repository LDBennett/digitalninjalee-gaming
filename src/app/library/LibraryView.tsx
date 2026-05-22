"use client";

import {
  useLibrary,
  LibraryTab,
  LIBRARY_TAB_LABELS,
} from "@/src/domains/backlog/hooks/useLibrary";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { GameCardSkeleton } from "@/src/domains/backlog/components/GameCardSkeleton";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { TabBar } from "@/src/components/ui/TabBar";

const TABS: LibraryTab[] = ["completed", "ongoing", "dropped"];

export function LibraryView() {
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
    gamesLoading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  } = useLibrary();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-bold text-white text-2xl">Library</h1>
        <TabBar
          tabs={TABS}
          value={tab}
          onChange={setTab}
          labels={LIBRARY_TAB_LABELS}
          className="mt-3"
        />
        <SearchInput value={searchQuery} onChange={setSearchQuery} className="mt-3" />
      </div>

      {gamesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : games.length === 0 ? (
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
