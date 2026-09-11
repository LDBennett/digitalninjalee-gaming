export interface GameRow {
  id: string;
  title: string;
  platform: string;
  status: string;
  priority_score: number;
  background_url: string | null;
  cover_art_url: string | null;
  game_description: string | null;
  last_played_at: string | null;
  created_at: string;
  replay_status: "want-to-replay" | "replaying" | null;
  personal_note: string | null;
  rating: number | null;
  play_goals: string[];
}

export interface MoodRow {
  id: string;
  name: string;
}

export interface ExternalIdRow {
  game_id: string;
  source: string;
  external_id: string;
  last_synced_at: string;
  sync_status: "ok" | "failed" | "pending";
}

export interface GameRowWithMoods extends GameRow {
  game_moods: Array<{ moods: MoodRow }>;
}

export interface GameLogRow {
  id: string;
  game_id: string;
  user_id: string | null;
  type:
    | "note"
    | "status_change"
    | "priority_change"
    | "rating_change"
    | "created";
  content: string | null;
  metadata: Record<string, unknown>;
  is_private: boolean;
  updated_at: string;
  created_at: string;
}
