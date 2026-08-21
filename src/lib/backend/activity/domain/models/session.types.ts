import type { Platform } from "@/src/lib/backend/backlog/domain/models";

export interface PlaySessionState {
  id: string;
  game_name: string;
  game_id: string | null;
  platform: Platform | null;
  started_at: string;
  last_seen_at: string;
}

export interface RecentPlayDto extends PlaySessionState {
  game: {
    title: string;
    cover_art_url: string | null;
    platform: Platform;
  } | null;
}
