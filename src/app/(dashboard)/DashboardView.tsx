"use client";

import { useState } from "react";
import { useDashboard } from "./useDashboard";
import { GameCard } from "@/src/domains/games/components/GameCard";
import { GameCardList } from "@/src/domains/games/components/GameCardList";
import { AddGameModal } from "@/src/domains/games/components/AddGameModal";
import { RandomPicker } from "@/src/domains/games/components/RandomPicker";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { GameStatsGrid } from "@/src/domains/games/components/GameStatsGrid";
import { TabBar } from "@/src/components/ui/TabBar";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-bold text-white text-2xl">Dashboard</h1>
          <p className="mt-0.5 text-gray-500 text-sm">
            {stats.total} games tracked
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-linear-to-r from-brand-950 hover:from-brand-800 to-brand-800 hover:to-brand-600 shadow-lg px-4 py-2 rounded-lg font-semibold text-white text-sm text-center transition-all"
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
          renderCard={(game) => (
            <GameCard key={game.id} game={game} showActions={false} showStatusBadge />
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
              actionLabel={isAuthenticated ? "Add your first game →" : undefined}
              onAction={isAuthenticated ? () => setShowAdd(true) : undefined}
            />
          }
          renderCard={(game) => (
            <GameCard
              key={game.id}
              game={game}
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
