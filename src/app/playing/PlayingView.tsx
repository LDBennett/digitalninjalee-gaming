"use client";

import { useState } from "react";
import { useScrollToTop } from "@/src/domains/shared/hooks/useScrollToTop";
import { usePlaying, PlayingTab } from "./usePlaying";
import { GameCard } from "@/src/domains/games/components/card/GameCard";
import { GameCardList } from "@/src/domains/games/components/card/GameCardList";
import { AddGameModal } from "@/src/domains/games/components/add-game/AddGameModal";
import { GameFiltersPanel } from "@/src/domains/games/components/filters/GameFiltersPanel";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { TabBar } from "@/src/components/ui/TabBar";
import { SlidersHorizontal } from "lucide-react";

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
  } = usePlaying();

  const topRef = useScrollToTop(page);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    moodFilter !== null,
    platformFilter !== null,
    sortBy !== "priority-desc",
  ].filter(Boolean).length;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  const emptyState = EMPTY_STATE[activeTab];
  const countLabel =
    activeTab === "playing" ? "active game"
    : activeTab === "ongoing" ? "ongoing game"
    : "replaying game";

  return (
    <div ref={topRef} className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-bold text-white text-2xl">Currently Playing</h1>
        <p className="mt-0.5 text-gray-500 text-sm">
          {filtered.length} {countLabel}
          {filtered.length !== 1 ? "s" : ""}
          {moodFilter ? ` · ${moodFilter}` : ""}
        </p>
      </div>

      <TabBar
        tabs={TAB_VALUES}
        value={activeTab}
        onChange={setActiveTab}
        labels={TAB_LABELS}
        className="mb-6"
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

      <GameCardList
        games={paginated}
        emptyState={
          <EmptyState
            heading={emptyState.heading}
            hint={moodFilter ? "Try another filter." : emptyState.hint}
          />
        }
        renderCard={(game) => (
          <GameCard
            key={game.id}
            game={game}
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
    </div>
  );
}
