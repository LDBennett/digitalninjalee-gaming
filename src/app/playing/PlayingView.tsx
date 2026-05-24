"use client";

import { usePlaying } from "./usePlaying";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { MoodFilter } from "@/src/domains/games/components/MoodFilter";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";

export function PlayingView() {
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
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  } = usePlaying();

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-bold text-white text-2xl">Currently Playing</h1>
        <p className="mt-0.5 text-gray-500 text-sm">
          {filtered.length} active game{filtered.length !== 1 ? "s" : ""}
          {moodFilter ? ` · ${moodFilter}` : ""}
        </p>
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
          <p className="mb-2 text-gray-500 text-lg">Nothing in progress</p>
          <p className="text-gray-600 text-sm">
            {moodFilter
              ? "Try another filter."
              : "Head to your Backlog to start a game."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-5">
            {paginated.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onStatusChange={
                  isAuthenticated ? handleStatusChange : undefined
                }
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
