"use client";
import { useScrollToTop } from "@/src/domains/shared/hooks/useScrollToTop";
import { useUIStore } from "@/src/domains/shared/store/ui.store";
import { useBacklog } from "./useBacklog";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { GameCardList } from "@/src/domains/games/components/GameCardList";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { RandomPicker } from "@/src/domains/games/components/RandomPicker";
import { MoodFilter } from "@/src/domains/games/components/MoodFilter";
import { EmptyState } from "@/src/components/ui/EmptyState";
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
  const topRef = useScrollToTop(page);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  return (
    <div ref={topRef} className="mx-auto max-w-3xl">
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

      <GameCardList
        games={paginated}
        emptyState={
          <EmptyState
            heading={
              moodFilter
                ? `No "${moodFilter}" games in backlog`
                : "Backlog is empty!"
            }
            hint={
              moodFilter
                ? "Try another filter or add a new game."
                : "Add games you want to play."
            }
            actionLabel={
              isAuthenticated && !moodFilter ? "+ Add Game" : undefined
            }
            onAction={
              isAuthenticated && !moodFilter
                ? () => setShowAdd(true)
                : undefined
            }
          />
        }
        renderCard={(game, i) => (
          <GameCard
            key={game.id}
            game={game}
            rank={(page - 1) * 20 + i + 1}
            onEdit={isAuthenticated ? setEditGame : undefined}
            onStatusChange={isAuthenticated ? handleStatusChange : undefined}
            onPriorityChange={
              isAuthenticated ? handlePriorityChange : undefined
            }
            showPriority
          />
        )}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
