import {
  MoodState,
  MoodDto,
} from "@/src/lib/backend/backlog/domain/models/mood.types";
import { Platform } from "@/src/lib/backend/shared/platform";
import { PriorityScore } from "./priorityScore.types";
import { GameStatus, ReplayStatus } from "./gameStatus.types";
import { PlayGoal } from "./playGoal.types";

// ── Value Objects ────────────────────────────────────────────────────────────

export interface TimeToBeat {
  schema_version: 1;
  main: number | null;
  extra: number | null;
  completionist: number | null;
  source: "hltb" | "igdb" | "manual";
  hltb_id?: number | null;
  url?: string | null;
  synced_at?: string;
}

export interface CompletionRoadmap {
  schema_version: 1;
  difficulty: string | null;
  time_estimate: string | null;
  playthroughs: number | null;
  missables: number | null;
  difficulty_matters?: boolean;
  guide_url: string;
  source_name: string;
  updated_at?: string;
}

// ── Domain Model ──────────────────────────────────────────────────────────────

export interface GameState {
  readonly id: string;
  readonly title: string;
  readonly platform: Platform;
  readonly status: GameStatus;
  readonly priorityScore: PriorityScore;
  readonly backgroundUrl: string | null;
  readonly coverArtUrl: string | null;
  readonly gameDescription: string | null;
  readonly lastPlayedAt: Date | null;
  readonly createdAt: Date;
  readonly moods: ReadonlyArray<MoodState>;
  readonly replayStatus: ReplayStatus;
  readonly personalNote: string | null;
  readonly rating: number | null;
  readonly playGoals: ReadonlyArray<PlayGoal>;
  readonly timeToBeat: TimeToBeat | null;
  readonly completionRoadmap: CompletionRoadmap | null;
}

// ── DTO (serialized shape returned by API) ────────────────────────────────────

export interface GameDto {
  id: string;
  title: string;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  background_url: string | null;
  cover_art_url: string | null;
  game_description: string | null;
  last_played_at: string | null;
  created_at: string;
  moods: MoodDto[];
  replay_status: ReplayStatus;
  personal_note: string | null;
  rating: number | null;
  play_goals: PlayGoal[];
  time_to_beat?: TimeToBeat | null;
  completion_roadmap?: CompletionRoadmap | null;
}

export function gameStateToDto(game: GameState): GameDto {
  return {
    id: game.id,
    title: game.title,
    platform: game.platform,
    status: game.status,
    priority_score: game.priorityScore,
    background_url: game.backgroundUrl,
    cover_art_url: game.coverArtUrl,
    game_description: game.gameDescription,
    last_played_at: game.lastPlayedAt?.toISOString() ?? null,
    created_at: game.createdAt.toISOString(),
    moods: game.moods.map((m) => ({ id: m.id, name: m.name })),
    replay_status: game.replayStatus,
    personal_note: game.personalNote,
    rating: game.rating,
    play_goals: [...game.playGoals],
    time_to_beat: game.timeToBeat,
    completion_roadmap: game.completionRoadmap,
  };
}

export interface CreateGameDto {
  title: string;
  platform: string;
  status?: string;
  priority_score?: number;
  background_url?: string | null;
  cover_art_url?: string | null;
  game_description?: string | null;
  mood_ids?: string[];
  replay_status?: ReplayStatus;
  personal_note?: string | null;
  rating?: number | null;
  play_goals?: string[];
  time_to_beat?: TimeToBeat | null;
  completion_roadmap?: CompletionRoadmap | null;
  rawg_id?: string | number | null;
  igdb_id?: string | number | null;
}

export interface UpdateGameDto {
  status?: string;
  title?: string;
  platform?: string;
  background_url?: string | null;
  cover_art_url?: string | null;
  game_description?: string | null;
  personal_note?: string | null;
  rating?: number | null;
  priority_score?: number;
  mood_ids?: string[];
  replay_status?: ReplayStatus;
  play_goals?: string[];
  time_to_beat?: TimeToBeat | null;
  completion_roadmap?: CompletionRoadmap | null;
  rawg_id?: string | number | null;
  igdb_id?: string | number | null;
}

