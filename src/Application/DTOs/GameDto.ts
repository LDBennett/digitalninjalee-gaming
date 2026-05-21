import { GameState } from '@/src/Domain/Models/Game';
import { Platform } from '@/src/Domain/ValueObjects/Platform';
import { GameStatus } from '@/src/Domain/ValueObjects/GameStatus';
import { MoodDto, moodStateToDto } from '@/src/Application/DTOs/MoodDto';

export interface GameDto {
  id: string;
  title: string;
  external_id: string | null;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  cover_url: string | null;
  last_played_at: string | null;
  created_at: string;
  moods: MoodDto[];
}

export function gameStateToDto(game: GameState): GameDto {
  return {
    id: game.id,
    title: game.title,
    external_id: game.externalId,
    platform: game.platform,
    status: game.status,
    priority_score: game.priorityScore,
    cover_url: game.coverUrl,
    last_played_at: game.lastPlayedAt?.toISOString() ?? null,
    created_at: game.createdAt.toISOString(),
    moods: game.moods.map(moodStateToDto),
  };
}
