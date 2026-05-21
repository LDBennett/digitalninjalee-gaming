'use client';

import { useBacklog } from '@/src/Presentation/Web/Hooks/useBacklog';
import { GameCard } from '@/src/Presentation/Web/Components/GameCard';
import { AddGameModal } from '@/src/Presentation/Web/Components/AddGameModal';
import { RandomPicker } from '@/src/Presentation/Web/Components/RandomPicker';
import { MoodBadge } from '@/src/Presentation/Web/Components/MoodBadge';

export function BacklogPage() {
  const {
    filtered,
    moods,
    moodFilter,
    setMoodFilter,
    showAdd,
    setShowAdd,
    showPicker,
    setShowPicker,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handlePriorityChange,
  } = useBacklog();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-600 text-sm">Loading…</div></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Backlog</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length} game{filtered.length !== 1 ? 's' : ''}
            {moodFilter ? ` · ${moodFilter}` : ''}
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="bg-linear-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              🎲 Random
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

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setMoodFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !moodFilter ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          All
        </button>
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => setMoodFilter(moodFilter === mood.name ? null : mood.name)}
            className={`transition-all duration-150 ${
              moodFilter === mood.name ? 'scale-110 ring-2 ring-white/20 rounded' : 'opacity-50 hover:opacity-80'
            }`}
          >
            <MoodBadge mood={mood.name} />
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">
            {moodFilter ? `No "${moodFilter}" games in backlog` : 'Backlog is empty!'}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            {moodFilter ? 'Try another filter or add a new game.' : 'Add games you want to play.'}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Add Game
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((game, i) => (
            <div key={game.id} className="flex items-stretch gap-3">
              <div className="shrink-0 w-7 flex items-center justify-center text-gray-700 text-xs font-mono">
                #{i + 1}
              </div>
              <div className="flex-1">
                <GameCard
                  game={game}
                  onEdit={isAuthenticated ? setEditGame : undefined}
                  onDelete={isAuthenticated ? handleDelete : undefined}
                  onStatusChange={isAuthenticated ? handleStatusChange : undefined}
                  onPriorityChange={isAuthenticated ? handlePriorityChange : undefined}
                  showPriority
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <AddGameModal
        isOpen={showAdd || !!editGame}
        onClose={() => { setShowAdd(false); setEditGame(null); }}
        onSave={editGame ? handleEdit : handleAdd}
        editGame={editGame}
        moods={moods}
      />
      <RandomPicker isOpen={showPicker} onClose={() => setShowPicker(false)} moods={moods} />
    </div>
  );
}
