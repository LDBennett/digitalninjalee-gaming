'use client';

import { useDashboard } from '@/src/Presentation/Web/Hooks/useDashboard';
import { GameCard } from '@/src/Presentation/Web/Components/GameCard';
import { AddGameModal } from '@/src/Presentation/Web/Components/AddGameModal';
import { RandomPicker } from '@/src/Presentation/Web/Components/RandomPicker';

const STAT_CARD_COLORS = {
  Backlog:   'text-purple-400',
  Playing:   'text-green-400',
  Completed: 'text-blue-400',
  Dropped:   'text-gray-500',
} as const;

export function DashboardPage() {
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 text-sm">Loading…</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Backlog',   value: stats.backlog },
    { label: 'Playing',   value: stats.playing },
    { label: 'Completed', value: stats.completed },
    { label: 'Dropped',   value: stats.dropped },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stats.total} games tracked</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="bg-linear-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg"
            >
              🎲 Pick a Game
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Add Game
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${STAT_CARD_COLORS[s.label]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Priority</h2>
          {topPriority.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-600 text-sm mb-3">Your backlog is empty</p>
              {isAuthenticated && (
                <button onClick={() => setShowAdd(true)} className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
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
                  onStatusChange={isAuthenticated ? handleStatusChange : undefined}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recently Played</h2>
          {recentlyPlayed.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-600 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentlyPlayed.map((game) => (
                <GameCard key={game.id} game={game} showActions={false} />
              ))}
            </div>
          )}
        </section>
      </div>

      <AddGameModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} moods={moods} />
      <RandomPicker isOpen={showPicker} onClose={() => setShowPicker(false)} moods={moods} />
    </div>
  );
}
