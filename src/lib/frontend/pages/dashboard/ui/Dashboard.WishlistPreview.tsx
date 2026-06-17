"use client";

import { PlatformBadge } from "@/src/lib/frontend/entities/game";
import { EmptyState } from "@/src/lib/frontend/shared";
import type { useDashboard } from "../useDashboard";

type Props = Pick<ReturnType<typeof useDashboard>, "topWishlist">;

export function DashboardWishlistPreview({ topWishlist }: Props) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-white uppercase">
        Top Wishlist
      </h3>

      {topWishlist.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900 py-8">
          <EmptyState heading="Wishlist is empty" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {topWishlist.map((game) => {
            const thumb = game.cover_art_url || game.background_url;
            return (
              <div key={game.id} className="w-24 shrink-0">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={game.title}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-32 w-full rounded-lg bg-gray-800" />
                )}
                <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-gray-300">
                  {game.title}
                </p>
                <div className="mt-1">
                  <PlatformBadge platform={game.platform} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
