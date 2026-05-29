"use client";

import { useState } from "react";
import { useLibrary, LibraryTab, LIBRARY_TAB_LABELS } from "./useLibrary";
import { useScrollToTop } from "@/src/lib/frontend/shared/hooks/useScrollToTop";
import {
  GameCard,
  GameCardList,
  GameCardSkeleton,
} from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { GameFiltersPanel } from "@/src/lib/frontend/features/game-filters";
import { EmptyState, SearchInput, TabBar } from "@/src/lib/frontend/shared";
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
    <div ref={topRef} className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Library</h1>
          {isAuthenticated && (
            <button
              onClick={() => setShowAdd(true)}
              className="from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-linear-to-r px-4 py-2 text-center text-sm font-semibold text-white shadow-lg transition-all sm:flex-none"
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
        <div className="mb-5 flex gap-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? "bg-brand-800/30 border-brand-700 text-brand-300" : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"}`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-brand-600 rounded-full px-1.5 text-xs leading-tight text-white">
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
            <p className="mb-3 text-sm text-gray-600">
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
            renderCard={(game, i) => (
              <GameCard
                key={game.id}
                game={game}
                index={i}
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
