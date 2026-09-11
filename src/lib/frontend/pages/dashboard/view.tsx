"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useDashboard } from "./useDashboard";
import { GameStatsGrid } from "@/src/lib/frontend/entities/game";
import { LogPlayModal } from "@/src/lib/frontend/features/recent-activity";
import {
  Button,
  PageHeader,
  formatRelativeTime,
  useGameModalStore,
  useQuickGuideStore,
  useAuthStore,
} from "@/src/lib/frontend/shared";
import { DashboardHeroCard } from "./ui/HeroCard/HeroCard";
import { DashboardListQueue } from "./ui/Dashboard.ListQueue";

type StatFilter = "playing" | "backlog" | "completed" | "wishlist";

const QUEUE_CONFIG: Record<
  Exclude<StatFilter, "playing">,
  {
    heading: string;
    dataKey: "topPriority" | "lastCompleted" | "topWishlist";
  }
> = {
  backlog: { heading: "Backlog: Top Priority", dataKey: "topPriority" },
  completed: { heading: "Recently Completed", dataKey: "lastCompleted" },
  wishlist: { heading: "Top Wishlist", dataKey: "topWishlist" },
};

export function DashboardView() {
  const [activeFilter, setActiveFilter] = useState<StatFilter>("playing");
  const [showLogModal, setShowLogModal] = useState(false);
  const { session } = useAuthStore();
  const openEdit = useGameModalStore((s) => s.openEdit);
  const openGuide = useQuickGuideStore((s) => s.openGuide);

  const {
    stats,
    allGames,
    topPriority,
    recentPlays,
    playingGames,
    topWishlist,
    lastCompleted,
    loading,
  } = useDashboard();

  const queueData = {
    topPriority: topPriority.slice(0, 5),
    lastCompleted,
    topWishlist,
  };
  const queue = activeFilter === "playing" ? null : QUEUE_CONFIG[activeFilter];

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
          <DashboardHeroCard
            playingGames={playingGames}
            onManageGame={(id) => openEdit(id, "details")}
            onViewLogs={(id) => openEdit(id, "logs")}
            isAuthenticated={Boolean(session)}
            onEmptyRoll={openGuide}
          />
        </div>
        <div className="order-1 h-full lg:order-2 lg:col-span-2">
          {queue === null ? (
            <DashboardListQueue
              heading="Recently Played"
              items={recentPlays.map((play) => {
                const isInteractive = Boolean(play.game_id);
                return {
                  id: play.id,
                  gameId: play.game_id,
                  title: play.game?.title ?? play.game_name,
                  coverUrl: play.game?.cover_art_url,
                  platform: play.platform ?? play.game?.platform,
                  trailing: (
                    <span className="flex shrink-0 items-center font-mono text-xs text-gray-400">
                      {formatRelativeTime(play.last_seen_at)}
                    </span>
                  ),
                  onClick: isInteractive
                    ? () => openEdit(play.game_id!, "details")
                    : undefined,
                };
              })}
              action={
                session && (
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={<Plus size={13} />}
                    onClick={() => setShowLogModal(true)}
                    className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/20"
                  >
                    Log
                  </Button>
                )
              }
              emptyHeading="No play activity yet"
              filterTheme={activeFilter}
            />
          ) : (
            <DashboardListQueue
              games={queueData[queue.dataKey]}
              heading={queue.heading}
              onSelectGame={(id) => openEdit(id, "details")}
              filterTheme={activeFilter}
            />
          )}
        </div>
      </div>
      <LogPlayModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        games={allGames}
      />
    </div>
  );
}
