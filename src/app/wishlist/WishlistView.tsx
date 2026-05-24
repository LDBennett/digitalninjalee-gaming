"use client";

import { useWishlist, WishlistTab, WISHLIST_TAB_LABELS } from "./useWishlist";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { GameCardSkeleton } from "@/src/domains/games/components/GameCardSkeleton";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { Pagination } from "@/src/components/ui/Pagination";
import { TabBar } from "@/src/components/ui/TabBar";
import { Plus } from "lucide-react";

const TABS: WishlistTab[] = [
  "all",
  "interested",
  "pre-ordered",
  "keep-an-eye-on",
];

export function WishlistView() {
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
    gamesLoading,
    isAuthenticated,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  } = useWishlist();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-white text-2xl">Wishlist</h1>
          <p className="mt-0.5 text-gray-500 text-sm">
            Games I want to buy or keep an eye on. Track upcoming releases and
            pre-orders.
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all shrink-0"
          >
            <Plus size={15} /> Add Game
          </button>
        )}
      </div>

      <TabBar
        tabs={TABS}
        value={tab}
        onChange={setTab}
        labels={WISHLIST_TAB_LABELS}
        className="mb-5"
      />

      {gamesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : games.length === 0 ? (
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
              className="bg-brand-700 hover:bg-brand-600 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors"
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
        onDelete={isAuthenticated ? handleDelete : undefined}
        editGame={editGame}
        moods={moods}
        defaultStatus="interested"
      />
    </div>
  );
}
