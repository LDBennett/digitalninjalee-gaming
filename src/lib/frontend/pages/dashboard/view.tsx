"use client";

import { useState } from "react";
import { useDashboard } from "./useDashboard";
import { GameStatsGrid } from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { PageHeader, useAuthStore } from "@/src/lib/frontend/shared";
import { DashboardHeroCard } from "./ui/Dashboard.HeroCard";
import { DashboardBacklogQueue } from "./ui/Dashboard.BacklogQueue";

type StatFilter = "backlog" | "completed" | "wishlist";

const QUEUE_CONFIG: Record<StatFilter, { heading: string; dataKey: "topPriority" | "lastCompleted" | "topWishlist" }> = {
  backlog: { heading: "Backlog: Top Priority", dataKey: "topPriority" },
  completed: { heading: "Recently Completed", dataKey: "lastCompleted" },
  wishlist: { heading: "Top Wishlist", dataKey: "topWishlist" },
};

export function DashboardView() {
  const [activeFilter, setActiveFilter] = useState<StatFilter>("backlog");

  const {
    stats,
    topPriority,
    playingGames,
    topWishlist,
    lastCompleted,
    handleStatusChange,
    moods,
    showAdd,
    setShowAdd,
    loading,
    isAuthenticated,
    handleAdd,
  } = useDashboard();

  const { openLoginModal } = useAuthStore();

  const queueData = { topPriority: topPriority.slice(0, 5), lastCompleted, topWishlist };
  const { heading, dataKey } = QUEUE_CONFIG[activeFilter];
  const queueGames = queueData[dataKey];

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader subtitle={`${stats.total} games tracked`} />
      <GameStatsGrid
        stats={stats}
        activeFilter={activeFilter}
        onFilter={(key) => setActiveFilter(key as StatFilter)}
      />
      <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
        <div className="h-full lg:col-span-3">
          <DashboardHeroCard
            playingGames={playingGames}
            handleStatusChange={handleStatusChange}
            isAuthenticated={isAuthenticated}
            onSignIn={openLoginModal}
          />
        </div>
        <div className="h-full lg:col-span-2">
          <DashboardBacklogQueue games={queueGames} heading={heading} />
        </div>
      </div>
      <AddGameModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        moods={moods}
      />
    </div>
  );
}
