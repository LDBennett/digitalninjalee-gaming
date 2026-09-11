"use client";

import { useWishlist, WishlistTab, WISHLIST_TAB_LABELS } from "./useWishlist";
import {
  GameCard,
  GameCardList,
  GameCardSkeleton,
} from "@/src/lib/frontend/entities/game";
import {
  EmptyState,
  PageHeader,
  TabBar,
  useAuthStore,
  useGameModalStore,
  useScrollToTop,
} from "@/src/lib/frontend/shared";

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
    tab,
    setTab,
    gamesLoading,
    isAuthenticated,
    handlePriorityChange,
  } = useWishlist();

  const { openLoginModal } = useAuthStore();
  const { openAdd, openEdit } = useGameModalStore();
  const topRef = useScrollToTop(page);

  return (
    <div ref={topRef} className="mx-auto max-w-5xl">
      <PageHeader />

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
                onAction={isAuthenticated ? () => openAdd("interested") : undefined}
              />
            }
            renderCard={(game, i) => (
              <GameCard
                key={game.id}
                game={game}
                index={i}
                onEdit={() => openEdit(game.id)}
                onPriorityChange={handlePriorityChange}
                isAuthenticated={isAuthenticated}
                onSignIn={openLoginModal}
                showPriority
                showStatusBadge
              />
            )}
            spacing="space-y-3"
            pagination={{ page, totalPages, onPageChange: setPage }}
          />
        </>
      )}
    </div>
  );
}
