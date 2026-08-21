import { Result } from "@/src/lib/backend/shared/result";
import type { Platform } from "@/src/lib/backend/backlog/domain/models";
import type {
  PlaySessionState,
  RecentPlayDto,
} from "../domain/models/session.types";

export interface NewPlaySession {
  game_name: string;
  game_id: string | null;
  platform: Platform | null;
  started_at: string;
  last_seen_at: string;
}

export interface PlaySessionRepository {
  findLatestByGameName(
    gameName: string,
  ): Promise<Result<PlaySessionState | null, Error>>;
  findRecent(limit: number): Promise<Result<RecentPlayDto[], Error>>;
  insert(session: NewPlaySession): Promise<Result<void, Error>>;
  touch(id: string, lastSeenAt: string): Promise<Result<void, Error>>;
}
