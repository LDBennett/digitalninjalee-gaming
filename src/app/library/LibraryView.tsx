"use client";

import { useState } from "react";
import { useScrollToTop } from "@/src/domains/shared/hooks/useScrollToTop";
import { useLibrary, LibraryTab, LIBRARY_TAB_LABELS } from "./useLibrary";
import { GameCard } from "@/src/domains/games/components/card/GameCard";
import { GameCardList } from "@/src/domains/games/components/card/GameCardList";
import { GameCardSkeleton } from "@/src/domains/games/components/card/GameCardSkeleton";
import { AddGameModal } from "@/src/domains/games/components/add-game/AddGameModal";
import { GameFiltersPanel } from "@/src/domains/games/components/filters/GameFiltersPanel";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { TabBar } from "@/src/components/ui/TabBar";
import { Plus, SlidersHorizontal } from "lucide-react";

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
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
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
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    moodFilter !== null,
    platformFilter !== null,
    sortBy !== "priority-desc",
  ].filter(Boolean).length;

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
        <div className="flex gap-2 mb-5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-brand-800/30 border-brand-700 text-brand-300"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-brand-600 px-1.5 rounded-full text-white text-xs leading-tight">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <GameFiltersPanel
            moods={moods}
            moodFilter={moodFilter}
            onMoodChange={setMoodFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            platformFilter={platformFilter}
            onPlatformChange={setPlatformFilter}
            className="mb-5"
          />
        )}
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
