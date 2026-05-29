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
import { EmptyState, TabBar } from "@/src/lib/frontend/shared";
import { Dices } from "lucide-react";

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
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {stats.total} games tracked
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r px-4 py-2 text-center text-sm font-semibold text-white shadow-lg transition-all sm:flex-none"
            >
              <Dices /> Random Game
            </button>
          </div>
        )}
      </div>
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
