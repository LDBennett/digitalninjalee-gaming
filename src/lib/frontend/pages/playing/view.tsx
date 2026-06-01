"use client";

import { useState } from "react";
import { usePlaying, PlayingTab } from "./usePlaying";
import { useScrollToTop } from "@/src/lib/frontend/shared/hooks/useScrollToTop";
import { GameCard, GameCardList } from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { GameFiltersPanel } from "@/src/lib/frontend/features/game-filters";
import { EmptyState, SearchInput, TabBar } from "@/src/lib/frontend/shared";
import { Dices, DicesIcon, SlidersHorizontal } from "lucide-react";
import { RandomPicker } from "../../features";

const TAB_VALUES: PlayingTab[] = ["playing", "ongoing", "replaying"];
const TAB_LABELS: Record<PlayingTab, string> = {
  playing: "Playing",
  ongoing: "Ongoing",
  replaying: "Replaying",
};
const EMPTY_STATE = {
  playing: {
    heading: "Nothing in progress",
    hint: "Head to your Backlog to start a game.",
  },
  ongoing: {
    heading: "No ongoing games",
    hint: "Move a game to Ongoing from the playing page.",
  },
  replaying: {
    heading: "No games being replayed",
    hint: "Mark a completed game as 'Replaying' to see it here.",
  },
} as const;

export function PlayingView() {
  const {
    activeTab,
    setActiveTab,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    moodFilter,
    setMoodFilter,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    searchQuery,
    setSearchQuery,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
    showPicker,
    setShowPicker,
    truncatedButtonText,
  } = usePlaying();

  const topRef = useScrollToTop(page);
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = [
    moodFilter !== null,
    platformFilter !== null,
    sortBy !== "priority-desc",
  ].filter(Boolean).length;
  const emptyState = EMPTY_STATE[activeTab];
  const countLabel =
    activeTab === "playing"
      ? "active game"
      : activeTab === "ongoing"
        ? "ongoing game"
        : "replaying game";

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    );

  return (
    <div ref={topRef} className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Backlog</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {filtered.length} {countLabel}
            {filtered.length !== 1 ? "s" : ""}
            {moodFilter ? ` · ${moodFilter}` : ""}
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className={`"flex from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 transition-all" flex-1 items-center justify-center gap-2 bg-linear-to-r text-center text-sm font-semibold text-white shadow-lg sm:flex-none ${truncatedButtonText ? "rounded-full p-2" : "rounded-lg px-4 py-2"}`}
            >
              {truncatedButtonText ? (
                <Dices size={16} />
              ) : (
                <div className="flex items-center gap-2">
                  <DicesIcon size={16} />
                  Random
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      <TabBar
        tabs={TAB_VALUES}
        value={activeTab}
        onChange={setActiveTab}
        labels={TAB_LABELS}
        className="mb-6"
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
          filters={{
            moodFilter,
            setMoodFilter,
            sortBy,
            setSortBy,
            platformFilter,
            setPlatformFilter,
          }}
          moods={moods}
          className="mb-5"
        />
      )}

      <GameCardList
        games={paginated}
        emptyState={
          <EmptyState
            heading={emptyState.heading}
            hint={moodFilter ? "Try another filter." : emptyState.hint}
          />
        }
        renderCard={(game, i) => (
          <GameCard
            key={game.id}
            game={game}
            index={i}
            onEdit={isAuthenticated ? setEditGame : undefined}
            onStatusChange={isAuthenticated ? handleStatusChange : undefined}
          />
        )}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
      <RandomPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        moods={moods}
      />
    </div>
  );
}
