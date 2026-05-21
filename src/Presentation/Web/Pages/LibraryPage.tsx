'use client';

import { useLibrary } from '@/src/Presentation/Web/Hooks/useLibrary';
import { GameCard } from '@/src/Presentation/Web/Components/GameCard';
import { AddGameModal } from '@/src/Presentation/Web/Components/AddGameModal';

type FilterStatus = 'completed' | 'dropped';

export function LibraryPage() {
  const {
    games,
    moods,
    filter,
    setFilter,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  } = useLibrary();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-600 text-sm">Loading…</div></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Library</h1>
        <div className="flex gap-1 mt-3 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
          {(['completed', 'dropped'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {games.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">No {filter} games yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">{games.length} game{games.length !== 1 ? 's' : ''}</p>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={isAuthenticated ? setEditGame : undefined}
              onDelete={isAuthenticated ? handleDelete : undefined}
              onStatusChange={isAuthenticated ? handleStatusChange : undefined}
            />
          ))}
        </div>
      )}

      {editGame && (
        <AddGameModal isOpen onClose={() => setEditGame(null)} onSave={handleEdit} editGame={editGame} moods={moods} />
      )}
    </div>
  );
}
