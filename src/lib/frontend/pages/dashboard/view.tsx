"use client";

import { useState } from "react";
import { useDashboard } from "./useDashboard";
import {
  GameCard,
  GameCardList,
  GameStatsGrid,
} from "@/src/lib/frontend/entities/game";
import { AddGameModal } from "@/src/lib/frontend/features/add-game";
import { RandomPicker } from "@/src/lib/frontend/features/roll-random";
import { EmptyState, PageHeader, TabBar } from "@/src/lib/frontend/shared";

type DashboardTab = "playing" | "backlog";
const TAB_LABELS: Record<DashboardTab, string> = {
  playing: "Currently Playing",
  backlog: "Backlog",
};

export function DashboardView() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("playing");
  const {
    stats,
    topPriority,
    playingGames,
    moods,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    loading,
    isAuthenticated,
    handleAdd,
    handleStatusChange,
  } = useDashboard();

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        subtitle={`${stats.total} games tracked`}
        onRandom={() => setShowPicker(true)}
      />
      <GameStatsGrid stats={stats} />
      <TabBar
        tabs={["playing", "backlog"] as DashboardTab[]}
        value={activeTab}
        onChange={setActiveTab}
        labels={TAB_LABELS}
        className="mb-6"
      />
      {activeTab === "playing" && (
        <GameCardList
          games={playingGames}
          emptyState={<EmptyState heading="No recent activity" />}
          renderCard={(game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              showActions={false}
              showStatusBadge
            />
          )}
          spacing="space-y-3"
        />
      )}
      {activeTab === "backlog" && (
        <GameCardList
          games={topPriority}
          emptyState={
            <EmptyState
              heading="Your backlog is empty"
              actionLabel={
                isAuthenticated ? "Add your first game →" : undefined
              }
              onAction={isAuthenticated ? () => setShowAdd(true) : undefined}
            />
          }
          renderCard={(game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              showPriority
              onStatusChange={isAuthenticated ? handleStatusChange : undefined}
            />
          )}
          spacing="space-y-3"
        />
      )}
      <AddGameModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        moods={moods}
      />
      <RandomPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        moods={moods}
      />
    </div>
  );
}
