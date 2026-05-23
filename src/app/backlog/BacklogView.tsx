"use client";

import { useBacklog } from "./useBacklog";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import { RandomPicker } from "@/src/domains/backlog/components/RandomPicker";
import { MoodFilter } from "@/src/domains/backlog/components/MoodFilter";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";

export function BacklogView() {
  const {
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  } = useBacklog();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-white text-2xl">Backlog</h1>
          <p className="mt-0.5 text-gray-500 text-sm">
            {filtered.length} game{filtered.length !== 1 ? "s" : ""}
            {moodFilter ? ` · ${moodFilter}` : ""}
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="bg-linear-to-r from-brand-700 hover:from-brand-600 to-brand-700 hover:to-brand-600 px-3 py-2 rounded-lg font-semibold text-white text-sm transition-all"
            >
              🎲 Random
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-brand-700 hover:bg-brand-600 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors"
            >
              + Add Game
            </button>
          </div>
        )}
      </div>

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

      {filtered.length === 0 ? (
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
          <p className="mb-2 text-gray-500 text-lg">
            {moodFilter
              ? `No "${moodFilter}" games in backlog`
              : "Backlog is empty!"}
          </p>
          <p className="mb-4 text-gray-600 text-sm">
            {moodFilter
              ? "Try another filter or add a new game."
              : "Add games you want to play."}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-brand-700 hover:bg-brand-600 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors"
            >
              + Add Game
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-5">
            {paginated.map((game, i) => (
              <div key={game.id} className="flex items-stretch gap-3">
                <div className="flex justify-center items-center w-7 font-mono text-gray-700 text-xs shrink-0">
                  #{(page - 1) * 20 + i + 1}
                </div>
                <div className="flex-1">
                  <GameCard
                    game={game}
                    onEdit={isAuthenticated ? setEditGame : undefined}
                    onStatusChange={
                      isAuthenticated ? handleStatusChange : undefined
                    }
                    onPriorityChange={
                      isAuthenticated ? handlePriorityChange : undefined
                    }
                    showPriority
                  />
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <AddGameModal
        isOpen={showAdd || !!editGame}
        onClose={() => {
          setShowAdd(false);
          setEditGame(null);
        }}
        onSave={editGame ? handleEdit : handleAdd}
        onDelete={isAuthenticated ? handleDelete : undefined}
        editGame={editGame}
        moods={moods}
        defaultStatus="backlog"
      />
      <RandomPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        moods={moods}
      />
    </div>
  );
}
