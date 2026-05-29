"use client";
import { useState } from "react";
import { useBacklog } from "./useBacklog";
import { useScrollToTop } from "@/src/lib/frontend/shared/hooks/useScrollToTop";
import { useUIStore } from "@/src/lib/frontend/shared/store/ui.store";
import { GameCard, GameCardList } from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { RandomPicker } from "@/src/lib/frontend/features/roll-random";
import { GameFiltersPanel } from "@/src/lib/frontend/features/game-filters";
import { EmptyState, SearchInput } from "@/src/lib/frontend/shared";
import { Dices, DicesIcon, Plus, SlidersHorizontal } from "lucide-react";

export function BacklogView() {
  const {
    filtered, paginated, page, setPage, totalPages,
    moods, moodFilter, setMoodFilter, sortBy, setSortBy,
    platformFilter, setPlatformFilter, searchQuery, setSearchQuery,
    showAdd, setShowAdd, showPicker, setShowPicker,
    editGame, setEditGame, loading, isAuthenticated,
    handleAdd, handleEdit, handleDelete, handleStatusChange, handlePriorityChange,
    replayOnly, setReplayOnly, wantToReplayCount,
  } = useBacklog();

  const { truncatedButtonText } = useUIStore();
  const topRef = useScrollToTop(page);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    moodFilter !== null, platformFilter !== null, sortBy !== "priority-desc", replayOnly,
  ].filter(Boolean).length;

  if (loading)
    return <div className="flex justify-center items-center h-64"><div className="text-gray-600 text-sm">Loading…</div></div>;

  return (
    <div ref={topRef} className="mx-auto max-w-3xl">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-white text-2xl">Backlog</h1>
          <p className="mt-0.5 text-gray-500 text-sm">
            {replayOnly
              ? `${filtered.length} game${filtered.length !== 1 ? "s" : ""} to replay${moodFilter ? ` · ${moodFilter}` : ""}`
              : `${filtered.length} game${filtered.length !== 1 ? "s" : ""}${wantToReplayCount > 0 ? ` · ${wantToReplayCount} to replay` : ""}${moodFilter ? ` · ${moodFilter}` : ""}`
            }
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className={`"flex flex-1 sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg font-semibold text-white text-sm text-center transition-all" ${truncatedButtonText ? "rounded-full p-2" : "rounded-lg px-4 py-2"}`}
            >
              {truncatedButtonText ? <Dices size={16} /> : <div className="flex items-center gap-2"><DicesIcon size={16} />Random</div>}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-linear-to-r from-brand-800 hover:from-brand-700 to-brand-600 hover:to-brand-500 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all"
            >
              <div className="flex items-center gap-1"><Plus size={16} />{truncatedButtonText ? "Game" : "Add Game"}</div>
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        <SearchInput value={searchQuery} onChange={setSearchQuery} className="flex-1" />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0 ? "bg-brand-800/30 border-brand-700 text-brand-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && <span className="bg-brand-600 px-1.5 rounded-full text-white text-xs leading-tight">{activeFilterCount}</span>}
        </button>
      </div>

      {showFilters && (
        <GameFiltersPanel moods={moods} moodFilter={moodFilter} onMoodChange={setMoodFilter} sortBy={sortBy} onSortChange={setSortBy} platformFilter={platformFilter} onPlatformChange={setPlatformFilter} className="mb-5">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={replayOnly} onChange={(e) => setReplayOnly(e.target.checked)} className="w-4 h-4 accent-brand-800" />
            <span className="text-gray-300 text-sm">Replays Only</span>
          </label>
        </GameFiltersPanel>
      )}

      <GameCardList
        games={paginated}
        emptyState={
          <EmptyState
            heading={moodFilter ? `No "${moodFilter}" games in backlog` : replayOnly ? "No games marked 'Want to Replay'" : "Backlog is empty!"}
            hint={moodFilter ? "Try another filter or add a new game." : replayOnly ? "Edit a completed game and set its Replay Status." : "Add games you want to play."}
            actionLabel={isAuthenticated && !moodFilter ? "+ Add Game" : undefined}
            onAction={isAuthenticated && !moodFilter ? () => setShowAdd(true) : undefined}
          />
        }
        renderCard={(game, i) => (
          <GameCard key={game.id} game={game} rank={(page - 1) * 20 + i + 1} onEdit={isAuthenticated ? setEditGame : undefined} onStatusChange={isAuthenticated ? handleStatusChange : undefined} onPriorityChange={isAuthenticated ? handlePriorityChange : undefined} showPriority />
        )}
        page={page} totalPages={totalPages} onPageChange={setPage}
      />

      <AddGameModal isOpen={showAdd || !!editGame} onClose={() => { setShowAdd(false); setEditGame(null); }} onSave={editGame ? handleEdit : handleAdd} onDelete={isAuthenticated ? handleDelete : undefined} editGame={editGame} moods={moods} defaultStatus="backlog" />
      <RandomPicker isOpen={showPicker} onClose={() => setShowPicker(false)} moods={moods} />
    </div>
  );
}
