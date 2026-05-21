'use client';

import { GameDto } from '@/src/Application/DTOs/GameDto';
import { GameStatus } from '@/src/Domain/ValueObjects/GameStatus';
import { MoodBadge } from '@/src/Presentation/Web/Components/MoodBadge';
import { PlatformBadge } from '@/src/Presentation/Web/Components/PlatformBadge';

const STATUS_ACTIONS: Record<GameStatus, { label: string; status: GameStatus; color: string }[]> = {
  backlog:   [{ label: 'Start Playing', status: 'playing',   color: 'text-green-400 hover:text-green-300' }],
  playing:   [
    { label: 'Complete', status: 'completed', color: 'text-blue-400 hover:text-blue-300' },
    { label: 'Drop',     status: 'dropped',   color: 'text-gray-400 hover:text-gray-300' },
  ],
  completed: [],
  dropped:   [{ label: 'Return to Backlog', status: 'backlog', color: 'text-purple-400 hover:text-purple-300' }],
};

interface GameCardProps {
  game: GameDto;
  onEdit?: (game: GameDto) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onPriorityChange?: (id: string, delta: number) => void;
  showPriority?: boolean;
  showActions?: boolean;
}

export function GameCard({
  game,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  showPriority = false,
  showActions = true,
}: GameCardProps) {
  const moods = game.moods ?? [];
  const actions = STATUS_ACTIONS[game.status] ?? [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-800/70 transition-all duration-200">
      <div className="flex gap-4 p-4">
        <div className="shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-gray-800">
          {game.cover_url ? (
            <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
              <span className="text-2xl font-bold text-white/30">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-snug truncate">{game.title}</h3>

            {showPriority && onPriorityChange && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onPriorityChange(game.id, 10)}
                  className="text-gray-600 hover:text-purple-400 transition-colors px-1 text-xs"
                  title="Raise priority"
                >▲</button>
                <span className="text-xs text-gray-500 w-6 text-center font-mono">{game.priority_score}</span>
                <button
                  onClick={() => onPriorityChange(game.id, -10)}
                  className="text-gray-600 hover:text-red-400 transition-colors px-1 text-xs"
                  title="Lower priority"
                >▼</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <PlatformBadge platform={game.platform} />
            {game.last_played_at && (
              <span className="text-xs text-gray-600">
                {new Date(game.last_played_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {moods.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {moods.map((mood) => (
                <MoodBadge key={mood.id} mood={mood.name} />
              ))}
            </div>
          )}

          {showActions && (actions.length > 0 || onEdit || onDelete) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800/60">
              {actions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => onStatusChange?.(game.id, action.status)}
                  className={`text-xs font-medium transition-colors ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(game)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(game.id)}
                    className="text-xs text-gray-700 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
