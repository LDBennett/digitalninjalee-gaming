"use client";

import { useScrollToTop } from "@/src/domains/shared/hooks/useScrollToTop";
import { useLibrary, LibraryTab, LIBRARY_TAB_LABELS } from "./useLibrary";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { GameCardList } from "@/src/domains/games/components/GameCardList";
import { GameCardSkeleton } from "@/src/domains/games/components/GameCardSkeleton";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { MoodFilter } from "@/src/domains/games/components/MoodFilter";
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
    moodFilter,
    setMoodFilter,
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

  const topRef = useScrollToTop(page);

  return (
    <div ref={topRef} className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-white text-2xl">Library</h1>
          {isAuthenticated && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all shrink-0"
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
          className="mb-5"
        />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          className="mb-5"
        />

        <MoodFilter
          moods={moods}
          value={moodFilter}
          onChange={setMoodFilter}
          className="mb-5"
        />
      </div>

      {gamesLoading ? (
        <div className="space-y-3 md:space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {filtered.length > 0 && (
            <p className="mb-3 text-gray-600 text-sm">
              {filtered.length} {LIBRARY_TAB_LABELS[tab].toLowerCase()} game
              {filtered.length !== 1 ? "s" : ""}
            </p>
          )}
          <GameCardList
            games={paginated}
            emptyState={
              games.length === 0 ? (
                <EmptyState
                  heading={
                    tab === "all"
                      ? "No games yet"
                      : `No ${LIBRARY_TAB_LABELS[tab].toLowerCase()} games yet`
                  }
                />
              ) : (
                <EmptyState heading={`No games found for "${searchQuery}"`} />
              )
            }
            renderCard={(game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onStatusChange={
                  isAuthenticated ? handleStatusChange : undefined
                }
                showStatusBadge={tab === "all" || tab === "completed"}
              />
            )}
            spacing="space-y-3"
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
