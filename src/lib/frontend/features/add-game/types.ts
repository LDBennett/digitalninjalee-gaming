import {
  Platform,
  GameStatus,
  ReplayStatus,
} from "@/src/lib/backend/backlog/domain/models";

export interface AddGamePayload {
  title: string;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  background_url: string | null;
  cover_art_url: string | null;
  game_description: string | null;
  personal_note: string | null;
  rating: number | null;
  rawg_id: number | null;
  igdb_id: number | null;
  mood_ids: string[];
  replay_status: ReplayStatus;
}

export interface RawgResult {
  id: number;
  name: string;
  coverUrl: string | null;
  released: string | null;
}
