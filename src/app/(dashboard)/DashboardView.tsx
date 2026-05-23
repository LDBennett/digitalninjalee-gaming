"use client";

import { useDashboard } from "./useDashboard";
import { GameCard } from "@/src/domains/backlog/components/GameCard";
import { AddGameModal } from "@/src/domains/backlog/components/AddGameModal";
import { RandomPicker } from "@/src/domains/backlog/components/RandomPicker";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { Dices, Plus } from "lucide-react";

const STAT_CARDS = [
  { key: "playing" as const, label: "Playing", color: "text-emerald-400" },
  { key: "backlog" as const, label: "Backlog", color: "text-violet-400" },
  { key: "completed" as const, label: "Completed", color: "text-green-400" },
  { key: "ongoing" as const, label: "Ongoing", color: "text-cyan-400" },
  { key: "wishlist" as const, label: "Wishlist", color: "text-yellow-400" },
] as const;

export function DashboardView() {
  const {
    stats,
    topPriority,
    recentlyPlayed,
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
              <Dices /> Pick a Game
            </button>
          </div>
        )}
      </div>
      <div className="gap-3 md:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="bg-gray-900 p-4 border border-gray-800 rounded-xl"
          >
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wide">
              {s.label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>
              {stats[s.key]}
            </p>
          </div>
        ))}
      </div>
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Top Priority
          </h2>
          {topPriority.length === 0 ? (
            <div className="bg-gray-900 p-8 border border-gray-800 rounded-xl text-center">
              <p className="mb-3 text-gray-600 text-sm">
                Your backlog is empty
              </p>
              {isAuthenticated && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="text-brand-400 hover:text-brand-300 text-sm transition-colors"
                >
                  Add your first game →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {topPriority.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showPriority
                  onStatusChange={
                    isAuthenticated ? handleStatusChange : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Recently Played
          </h2>
          {recentlyPlayed.length === 0 ? (
            <div className="bg-gray-900 p-8 border border-gray-800 rounded-xl text-center">
              <p className="text-gray-600 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentlyPlayed.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showActions={false}
                  showStatusBadge
                />
              ))}
            </div>
          )}
        </section>
      </div>
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
