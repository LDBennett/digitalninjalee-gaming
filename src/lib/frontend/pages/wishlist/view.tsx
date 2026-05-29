"use client";

import { useWishlist, WishlistTab, WISHLIST_TAB_LABELS } from "./useWishlist";
import { useScrollToTop } from "@/src/lib/frontend/shared/hooks/useScrollToTop";
import { GameCard, GameCardList, GameCardSkeleton } from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { EmptyState, TabBar } from "@/src/lib/frontend/shared";
import { Plus } from "lucide-react";

const TABS: WishlistTab[] = ["all", "interested", "pre-ordered", "keep-an-eye-on"];

export function WishlistView() {
  const {
    games, paginated, page, setPage, totalPages, moods, tab, setTab,
    editGame, setEditGame, showAdd, setShowAdd, gamesLoading, isAuthenticated,
    handleAdd, handleEdit, handleDelete, handleStatusChange, handlePriorityChange,
  } = useWishlist();

  const topRef = useScrollToTop(page);

  return (
    <div ref={topRef} className="mx-auto max-w-3xl">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bold text-white text-2xl">Wishlist</h1>
          <p className="mt-0.5 text-gray-500 text-sm">Games I want to buy or keep an eye on. Track upcoming releases and pre-orders.</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowAdd(true)} className="flex sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all shrink-0">
            <Plus size={15} /> Add Game
          </button>
        )}
      </div>

      <TabBar tabs={TABS} value={tab} onChange={setTab} labels={WISHLIST_TAB_LABELS} className="mb-5" />

      {gamesLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <GameCardSkeleton key={i} />)}</div>
      ) : (
        <>
          {games.length > 0 && <p className="mb-3 text-gray-600 text-sm">{games.length} game{games.length !== 1 ? "s" : ""}</p>}
          <GameCardList
            games={paginated}
            emptyState={
              <EmptyState
                heading={tab === "all" ? "Wishlist is empty!" : `No ${WISHLIST_TAB_LABELS[tab]} games`}
                hint="Track games you want to buy."
                actionLabel={isAuthenticated ? "+ Add Game" : undefined}
                onAction={isAuthenticated ? () => setShowAdd(true) : undefined}
              />
            }
            renderCard={(game, i) => (
              <GameCard key={game.id} game={game} index={i} onEdit={isAuthenticated ? setEditGame : undefined} onStatusChange={isAuthenticated ? handleStatusChange : undefined} onPriorityChange={isAuthenticated ? handlePriorityChange : undefined} showPriority showStatusBadge />
            )}
            spacing="space-y-3" page={page} totalPages={totalPages} onPageChange={setPage}
          />
        </>
      )}

      <AddGameModal isOpen={showAdd || !!editGame} onClose={() => { setShowAdd(false); setEditGame(null); }} onSave={editGame ? handleEdit : handleAdd} onDelete={isAuthenticated ? handleDelete : undefined} editGame={editGame} moods={moods} defaultStatus="interested" />
    </div>
  );
}
