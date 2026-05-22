"use client";

import { usePlaying } from "@/src/domains/backlog/hooks/usePlaying";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import {
  MoodBadge,
  getMoodLabel,
} from "@/src/domains/backlog/components/MoodBadge";
import { Pagination } from "@/src/components/ui/Pagination";
import { SearchInput } from "@/src/components/ui/SearchInput";

export default function PlayingPage() {
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

      <SearchInput value={searchQuery} onChange={setSearchQuery} className="mb-5" />

      {/* Mobile: dropdown */}
      <div className="sm:hidden mb-5">
        <select
          value={moodFilter ?? ""}
          onChange={(e) => setMoodFilter(e.target.value || null)}
          className="bg-gray-900 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm"
        >
          <option value="">All moods</option>
          {moods.map((mood) => (
            <option key={mood.id} value={mood.name}>
              {getMoodLabel(mood.name)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: pills */}
      <div className="hidden sm:flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setMoodFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !moodFilter
              ? "bg-gray-700 text-white"
              : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
          }`}
        >
          All
        </button>
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() =>
              setMoodFilter(moodFilter === mood.name ? null : mood.name)
            }
            className={`transition-all duration-150 ${
              moodFilter === mood.name
                ? "scale-110 ring-2 ring-white/20 rounded"
                : "opacity-50 hover:opacity-80"
            }`}
          >
            <MoodBadge mood={mood.name} />
          </button>
        ))}
      </div>

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
          <div className="space-y-3">
            {paginated.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onDelete={isAuthenticated ? handleDelete : undefined}
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
          editGame={editGame}
          moods={moods}
        />
      )}
    </div>
  );
}
