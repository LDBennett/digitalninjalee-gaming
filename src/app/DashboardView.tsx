'use client';

import { useDashboard } from '@/src/domains/backlog/hooks/useDashboard';
import { GameCard } from '@/src/domains/backlog/components/GameCard';
import { AddGameModal } from '@/src/domains/backlog/components/AddGameModal';
import { RandomPicker } from '@/src/domains/backlog/components/RandomPicker';
import { SearchInput } from '@/src/components/ui/SearchInput';

const STAT_CARDS = [
  { key: 'backlog'   as const, label: 'Backlog',   color: 'text-purple-400' },
  { key: 'playing'   as const, label: 'Playing',   color: 'text-green-400' },
  { key: 'completed' as const, label: 'Completed', color: 'text-blue-400' },
  { key: 'ongoing'   as const, label: 'Ongoing',   color: 'text-cyan-400' },
  { key: 'wishlist'  as const, label: 'Wishlist',  color: 'text-yellow-400' },
] as const;

export function DashboardView() {
  const {
    stats,
    topPriority,
    recentlyPlayed,
    searchQuery,
    setSearchQuery,
    searchResults,
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stats.total} games tracked</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="flex-1 sm:flex-none bg-linear-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg text-center"
            >
              🎲 Pick a Game
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex-1 sm:flex-none bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
            >
              + Add Game
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{stats[s.key]}</p>
          </div>
        ))}
      </div>

      <SearchInput value={searchQuery} onChange={setSearchQuery} className="mb-8" />

      {searchQuery ? (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-600 text-sm">No games found for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showStatusBadge
                  onStatusChange={isAuthenticated ? handleStatusChange : undefined}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <GameCard key={game.id} game={game} showActions={false} showStatusBadge />
              ))}
            </div>
          )}
        </section>
      </div>
      )}

      <AddGameModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} moods={moods} />
      <RandomPicker isOpen={showPicker} onClose={() => setShowPicker(false)} moods={moods} />
    </div>
  );
}
