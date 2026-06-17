"use client";

import { useState } from "react";
import { useDashboard } from "./useDashboard";
import { GameStatsGrid } from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { PageHeader } from "@/src/lib/frontend/shared";
import { DashboardHeroCard } from "./ui/Dashboard.HeroCard";
import { DashboardListQueue } from "./ui/Dashboard.ListQueue";

type StatFilter = "playing" | "backlog" | "completed" | "wishlist";

const QUEUE_CONFIG: Record<
  StatFilter,
  {
    heading: string;
    dataKey: "topPlaying" | "topPriority" | "lastCompleted" | "topWishlist";
  }
> = {
  playing: { heading: "Playing: Top Priority", dataKey: "topPlaying" },
  backlog: { heading: "Backlog: Top Priority", dataKey: "topPriority" },
  completed: { heading: "Recently Completed", dataKey: "lastCompleted" },
  wishlist: { heading: "Top Wishlist", dataKey: "topWishlist" },
};

export function DashboardView() {
  const [activeFilter, setActiveFilter] = useState<StatFilter>("backlog");

  const {
    stats,
    topPriority,
    topPlaying,
    playingGames,
    topWishlist,
    lastCompleted,
    moods,
    showAdd,
    setShowAdd,
    loading,
    handleAdd,
  } = useDashboard();

  const queueData = {
    topPlaying,
    topPriority: topPriority.slice(0, 5),
    lastCompleted,
    topWishlist,
  };
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
        <div className="order-2 h-full lg:order-1 lg:col-span-3">
          <DashboardHeroCard playingGames={playingGames} />
        </div>
        <div className="order-1 h-full lg:order-2 lg:col-span-2">
          <DashboardListQueue games={queueGames} heading={heading} />
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
