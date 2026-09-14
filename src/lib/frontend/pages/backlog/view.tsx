"use client";
import { useState } from "react";
import { useBacklog } from "./useBacklog";
import { GameCard, GameCardList } from "@/src/lib/frontend/entities/game";
import { GameFiltersPanel } from "@/src/lib/frontend/features/game-filters";
import {
  EmptyState,
  PageHeader,
  SearchInput,
  useAuthStore,
  useGameModalStore,
  useScrollToTop,
} from "@/src/lib/frontend/shared";
import { SlidersHorizontal } from "lucide-react";

export function BacklogView() {
  const {
    filtered,
    paginated,
    page, setPage, totalPages,
    moods,
    moodFilter,
    setMoodFilter,
    sortBy,
    setSortBy,
    platformFilter,
    setPlatformFilter,
    playGoalFilter,
    setPlayGoalFilter,
    durationFilter,
    setDurationFilter,
    searchQuery,
    setSearchQuery,
    loading,
    isAuthenticated,
    handlePriorityChange,
    replayOnly,
    setReplayOnly,
    wantToReplayCount,
  } = useBacklog();

  const { openLoginModal } = useAuthStore();
  const { openAdd, openEdit } = useGameModalStore();
  const topRef = useScrollToTop(page);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    moodFilter !== null,
    platformFilter !== null,
    playGoalFilter !== null,
    durationFilter !== null,
    sortBy !== "priority-desc",
    replayOnly,
  ].filter(Boolean).length;

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    );

  return (
    <div ref={topRef} className="mx-auto max-w-5xl">
      <PageHeader
        subtitle={
          replayOnly
            ? `${filtered.length} game${filtered.length !== 1 ? "s" : ""} to replay${moodFilter ? ` · ${moodFilter}` : ""}`
            : `${filtered.length} game${filtered.length !== 1 ? "s" : ""}${wantToReplayCount > 0 ? ` · ${wantToReplayCount} to replay` : ""}${moodFilter ? ` · ${moodFilter}` : ""}`
        }
      />

      <div className="mb-5 flex gap-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-brand-800/30 border-brand-700 text-brand-300"
              : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
          }`}
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
            playGoalFilter,
            setPlayGoalFilter,
            durationFilter,
            setDurationFilter,
          }}
          moods={moods}
          className="mb-5"
        >
          <label className="inline-flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={replayOnly}
              onChange={(e) => setReplayOnly(e.target.checked)}
              className="accent-brand-800 h-4 w-4"
            />
            <span className="text-sm text-gray-300">Replays Only</span>
          </label>
        </GameFiltersPanel>
      )}

      <GameCardList
        games={paginated}
        emptyState={
          <EmptyState
            heading={
              moodFilter
                ? `No "${moodFilter}" games in backlog`
                : replayOnly
                  ? "No games marked 'Want to Replay'"
                  : "Backlog is empty!"
            }
            hint={
              moodFilter
                ? "Try another filter or add a new game."
                : replayOnly
                  ? "Edit a completed game and set its Replay Status."
                  : "Add games you want to play."
            }
            actionLabel={
              isAuthenticated && !moodFilter ? "+ Add Game" : undefined
            }
            onAction={
              isAuthenticated && !moodFilter
                ? () => openAdd("backlog")
                : undefined
            }
          />
        }
        renderCard={(game, i) => (
          <GameCard
            key={game.id}
            game={game}
            index={i}
            rank={(page - 1) * 20 + i + 1}
            onEdit={() => openEdit(game.id)}
            onPriorityChange={handlePriorityChange}
            isAuthenticated={isAuthenticated}
            onSignIn={openLoginModal}
            showPriority
          />
        )}
        pagination={{ page, totalPages, onPageChange: setPage }}
      />
    </div>
  );
}
