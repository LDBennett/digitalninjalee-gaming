export interface GameRow {
  id: string;
  title: string;
  external_id: string | null;
  platform: string;
  status: string;
  priority_score: number;
  cover_url: string | null;
  cover_art_url: string | null;
  game_description: string | null;
  last_played_at: string | null;
  created_at: string;
}

export interface MoodRow {
  id: string;
  name: string;
}

export interface GameRowWithMoods extends GameRow {
  game_moods: Array<{ moods: MoodRow }>;
}
