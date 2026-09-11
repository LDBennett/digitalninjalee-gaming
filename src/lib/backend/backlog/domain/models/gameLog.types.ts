import { GameStatus } from "./gameStatus.types";
import { Platform } from "@/src/lib/backend/shared/platform";

export type GameLogType =
  | "note"
  | "status_change"
  | "priority_change"
  | "rating_change"
  | "created";

export interface StatusChangeMetadata {
  old_status: GameStatus;
  new_status: GameStatus;
}

export interface PriorityChangeMetadata {
  old_priority: number;
  new_priority: number;
}

export interface RatingChangeMetadata {
  old_rating: number | null;
  new_rating: number | null;
}

export interface CreatedMetadata {
  initial_status: GameStatus;
  initial_priority: number;
  platform: Platform;
}

export type NoteMetadata = Record<string, never>;

export type GameLogEntry =
  | {
      id: string;
      gameId: string;
      userId: string | null;
      type: "note";
      content: string;
      metadata: NoteMetadata;
      isPrivate: boolean;
      createdAt: string;
      updatedAt: string;
    }
  | {
      id: string;
      gameId: string;
      userId: string | null;
      type: "status_change";
      content: null;
      metadata: StatusChangeMetadata;
      isPrivate: boolean;
      createdAt: string;
      updatedAt: string;
    }
  | {
      id: string;
      gameId: string;
      userId: string | null;
      type: "priority_change";
      content: null;
      metadata: PriorityChangeMetadata;
      isPrivate: boolean;
      createdAt: string;
      updatedAt: string;
    }
  | {
      id: string;
      gameId: string;
      userId: string | null;
      type: "rating_change";
      content: null;
      metadata: RatingChangeMetadata;
      isPrivate: boolean;
      createdAt: string;
      updatedAt: string;
    }
  | {
      id: string;
      gameId: string;
      userId: string | null;
      type: "created";
      content: null;
      metadata: CreatedMetadata;
      isPrivate: boolean;
      createdAt: string;
      updatedAt: string;
    };

export interface GameLogPage {
  entries: GameLogEntry[];
  nextCursor: { createdAt: string; id: string } | null;
}
