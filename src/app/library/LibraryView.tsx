"use client";

import { useLibrary, LibraryTab, LIBRARY_TAB_LABELS } from "./useLibrary";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { GameCardSkeleton } from "@/src/domains/backlog/components/GameCardSkeleton";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { TabBar } from "@/src/components/ui/TabBar";
import { Plus } from "lucide-react";

const TABS: LibraryTab[] = [
  "all",
  "completed",
  "main-complete",
  "ongoing",
  "dropped",
];

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
    handleAdd,
    showAdd,
    setShowAdd,
  } = useLibrary();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-white text-2xl">Library</h1>
          {isAuthenticated && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all"
            >
              <Plus size={15} /> Add Game
            </button>
          )}
        </div>
        <TabBar
          tabs={TABS}
          value={tab}
          onChange={setTab}
          labels={LIBRARY_TAB_LABELS}
          className="mt-3"
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          className="mt-3"
        />
      </div>

      {gamesLoading ? (
        <div className="space-y-3 md:space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
          <p className="text-gray-500 text-lg">
            {tab === "all"
              ? "No games yet"
              : `No ${LIBRARY_TAB_LABELS[tab].toLowerCase()} games yet`}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
          <p className="text-gray-500 text-lg">
            No games found for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              {filtered.length} {LIBRARY_TAB_LABELS[tab].toLowerCase()} game
              {filtered.length !== 1 ? "s" : ""}
            </p>
            {paginated.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onStatusChange={
                  isAuthenticated ? handleStatusChange : undefined
                }
                showStatusBadge={tab === "all" || tab === "completed"}
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
          onDelete={isAuthenticated ? handleDelete : undefined}
          editGame={editGame}
          moods={moods}
        />
      )}
      {showAdd && (
        <AddGameModal
          isOpen
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
          moods={moods}
        />
      )}
    </div>
  );
}
