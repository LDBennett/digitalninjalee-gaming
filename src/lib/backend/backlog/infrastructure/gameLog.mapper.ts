import { Result, ok, err } from "@/src/lib/backend/shared/result";
import { createPlatform } from "@/src/lib/backend/shared/platform";
import { createGameStatus } from "@/src/lib/backend/backlog/domain/models/gameStatus.types";
import {
  GameLogEntry,
  StatusChangeMetadata,
  PriorityChangeMetadata,
  RatingChangeMetadata,
  CreatedMetadata,
} from "@/src/lib/backend/backlog/domain/models/gameLog.types";
import { GameLogRow } from "./db.types";

export function gameLogRowToDomain(row: GameLogRow): Result<GameLogEntry, Error> {
  const base = {
    id: row.id,
    gameId: row.game_id,
    userId: row.user_id,
    isPrivate: Boolean(row.is_private),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  switch (row.type) {
    case "note": {
      if (!row.content || typeof row.content !== "string") {
        return err(new Error("Note log requires non-empty content"));
      }
      return ok({
        ...base,
        type: "note",
        content: row.content,
        metadata: {},
      });
    }

    case "status_change": {
      const meta = row.metadata ?? {};
      const oldStatusRes = createGameStatus(meta.old_status as string);
      const newStatusRes = createGameStatus(meta.new_status as string);

      if (!oldStatusRes.success || !newStatusRes.success) {
        return err(
          new Error(
            `Invalid status_change metadata: old=${meta.old_status}, new=${meta.new_status}`,
          ),
        );
      }

      const metadata: StatusChangeMetadata = {
        old_status: oldStatusRes.value,
        new_status: newStatusRes.value,
      };

      return ok({
        ...base,
        type: "status_change",
        content: null,
        metadata,
      });
    }

    case "priority_change": {
      const meta = row.metadata ?? {};
      const oldPriority = Number(meta.old_priority);
      const newPriority = Number(meta.new_priority);

      if (isNaN(oldPriority) || isNaN(newPriority)) {
        return err(
          new Error(
            `Invalid priority_change metadata: old=${meta.old_priority}, new=${meta.new_priority}`,
          ),
        );
      }

      const metadata: PriorityChangeMetadata = {
        old_priority: oldPriority,
        new_priority: newPriority,
      };

      return ok({
        ...base,
        type: "priority_change",
        content: null,
        metadata,
      });
    }

    case "rating_change": {
      const meta = row.metadata ?? {};
      const oldRating =
        meta.old_rating === null || meta.old_rating === undefined
          ? null
          : Number(meta.old_rating);
      const newRating =
        meta.new_rating === null || meta.new_rating === undefined
          ? null
          : Number(meta.new_rating);

      if (
        (oldRating !== null && isNaN(oldRating)) ||
        (newRating !== null && isNaN(newRating))
      ) {
        return err(
          new Error(
            `Invalid rating_change metadata: old=${meta.old_rating}, new=${meta.new_rating}`,
          ),
        );
      }

      const metadata: RatingChangeMetadata = {
        old_rating: oldRating,
        new_rating: newRating,
      };

      return ok({
        ...base,
        type: "rating_change",
        content: null,
        metadata,
      });
    }

    case "created": {
      const meta = row.metadata ?? {};
      const statusRes = createGameStatus(meta.initial_status as string);
      const platformRes = createPlatform(meta.platform as string);
      const initialPriority = Number(meta.initial_priority);

      if (!statusRes.success || !platformRes.success || isNaN(initialPriority)) {
        return err(
          new Error(
            `Invalid created metadata: status=${meta.initial_status}, platform=${meta.platform}, priority=${meta.initial_priority}`,
          ),
        );
      }

      const metadata: CreatedMetadata = {
        initial_status: statusRes.value,
        initial_priority: initialPriority,
        platform: platformRes.value,
      };

      return ok({
        ...base,
        type: "created",
        content: null,
        metadata,
      });
    }

    default:
      return err(new Error(`Unknown game log type: ${(row as { type: string }).type}`));
  }
}
