"use client";
import { useUIStore } from "@/src/domains/shared/store/ui.store";
import { useBacklog } from "./useBacklog";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { RandomPicker } from "@/src/domains/games/components/RandomPicker";
import { MoodFilter } from "@/src/domains/games/components/MoodFilter";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Dices, DicesIcon, Plus } from "lucide-react";

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

  const { truncatedButtonText } = useUIStore();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-white text-2xl">Backlog</h1>
          <p className="mt-0.5 text-gray-500 text-sm">
            {filtered.length} game{filtered.length !== 1 ? "s" : ""}
            {moodFilter ? ` · ${moodFilter}` : ""}
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className={`"flex flex-1 sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg font-semibold text-white text-sm text-center transition-all" ${truncatedButtonText ? "rounded-full p-2" : "rounded-lg px-4 py-2"}`}
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
            <button
              onClick={() => setShowAdd(true)}
              className="bg-linear-to-r from-brand-800 hover:from-brand-700 to-brand-600 hover:to-brand-500 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all"
            >
              <div className="flex items-center gap-1">
                <Plus size={16} />
                {truncatedButtonText ? "Game" : "Add Game"}
              </div>
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
              <GameCard
                key={game.id}
                game={game}
                rank={(page - 1) * 20 + i + 1}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onStatusChange={
                  isAuthenticated ? handleStatusChange : undefined
                }
                onPriorityChange={
                  isAuthenticated ? handlePriorityChange : undefined
                }
                showPriority
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
