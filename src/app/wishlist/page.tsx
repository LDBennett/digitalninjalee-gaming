"use client";

import {
  useWishlist,
  WishlistTab,
  WISHLIST_TAB_LABELS,
} from "@/src/domains/backlog/hooks/useWishlist";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import { Pagination } from "@/src/components/ui/Pagination";

const TABS: WishlistTab[] = [
  "all",
  "interested",
  "pre-ordered",
  "keep-an-eye-on",
];

export default function WishlistPage() {
  const {
    games,
    paginated,
    page,
    setPage,
    totalPages,
    moods,
    tab,
    setTab,
    editGame,
    setEditGame,
    showAdd,
    setShowAdd,
    loading,
    isAuthenticated,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  } = useWishlist();

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
          <h1 className="font-bold text-white text-2xl">Wishlist</h1>
          <p className="mt-0.5 text-gray-500 text-sm">
            Games you haven&apos;t purchased yet
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors sm:shrink-0"
          >
            + Add Game
          </button>
        )}
      </div>

      {/* Mobile: dropdown */}
      <div className="sm:hidden mb-5">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as WishlistTab)}
          className="bg-gray-900 px-3 py-2 border border-gray-700 focus:border-purple-600 rounded-lg focus:outline-none w-full text-white text-sm"
        >
          {TABS.map((t) => (
            <option key={t} value={t}>
              {WISHLIST_TAB_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: tabs */}
      <div className="hidden sm:flex gap-1 bg-gray-900 mb-5 p-1 border border-gray-800 rounded-lg">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {WISHLIST_TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {games.length === 0 ? (
        <div className="bg-gray-900 p-12 border border-gray-800 rounded-xl text-center">
          <p className="mb-2 text-gray-500 text-lg">
            {tab === "all"
              ? "Wishlist is empty!"
              : `No ${WISHLIST_TAB_LABELS[tab]} games`}
          </p>
          <p className="mb-4 text-gray-600 text-sm">
            Track games you want to buy.
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors"
            >
              + Add Game
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              {games.length} game{games.length !== 1 ? "s" : ""}
            </p>
            {paginated.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={isAuthenticated ? setEditGame : undefined}
                onDelete={isAuthenticated ? handleDelete : undefined}
                onStatusChange={
                  isAuthenticated ? handleStatusChange : undefined
                }
                onPriorityChange={
                  isAuthenticated ? handlePriorityChange : undefined
                }
                showPriority
                showStatusBadge
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
        editGame={editGame}
        moods={moods}
        defaultStatus="interested"
      />
    </div>
  );
}
