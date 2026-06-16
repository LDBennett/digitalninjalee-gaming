"use client";

import { useWishlist, WishlistTab, WISHLIST_TAB_LABELS } from "./useWishlist";
import { useScrollToTop } from "@/src/lib/frontend/shared/hooks/useScrollToTop";
import {
  GameCard,
  GameCardList,
  GameCardSkeleton,
} from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { EmptyState, PageHeader, TabBar, useAuthStore } from "@/src/lib/frontend/shared";

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

  const { openLoginModal } = useAuthStore();
  const topRef = useScrollToTop(page);

  return (
    <div ref={topRef} className="mx-auto max-w-5xl">
      <PageHeader onAddGame={() => setShowAdd(true)} />

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
      ) : (
        <>
          {games.length > 0 && (
            <p className="mb-3 text-sm text-gray-600">
              {games.length} game{games.length !== 1 ? "s" : ""}
            </p>
          )}
          <GameCardList
            games={paginated}
            emptyState={
              <EmptyState
                heading={
                  tab === "all"
                    ? "Wishlist is empty!"
                    : `No ${WISHLIST_TAB_LABELS[tab]} games`
                }
                hint="Track games you want to buy."
                actionLabel={isAuthenticated ? "+ Add Game" : undefined}
                onAction={isAuthenticated ? () => setShowAdd(true) : undefined}
              />
            }
            renderCard={(game, i) => (
              <GameCard
                key={game.id}
                game={game}
                index={i}
                onEdit={setEditGame}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                isAuthenticated={isAuthenticated}
                onSignIn={openLoginModal}
                showPriority
                showStatusBadge
              />
            )}
            spacing="space-y-3"
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
