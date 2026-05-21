'use client';

import { usePlaying } from '@/src/Presentation/Web/Hooks/usePlaying';
import { GameCard } from '@/src/Presentation/Web/Components/GameCard';
import { AddGameModal } from '@/src/Presentation/Web/Components/AddGameModal';

export function PlayingPage() {
  const {
    games,
    moods,
    editGame,
    setEditGame,
    loading,
    isAuthenticated,
    handleStatusChange,
    handleEdit,
    handleDelete,
  } = usePlaying();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-600 text-sm">Loading…</div></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Currently Playing</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {games.length} active game{games.length !== 1 ? 's' : ''}
        </p>
      </div>

      {games.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">Nothing in progress</p>
          <p className="text-gray-600 text-sm">Head to your Backlog to start a game.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
