import { describe, it, expect } from "vitest";
import { gameLogRowToDomain } from "../gameLog.mapper";
import { GameLogRow } from "../db.types";

describe("gameLog.mapper", () => {
  const baseRow: GameLogRow = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    game_id: "223e4567-e89b-12d3-a456-426614174000",
    user_id: "323e4567-e89b-12d3-a456-426614174000",
    type: "note",
    content: "Just completed the prologue.",
    metadata: {},
    is_private: false,
    updated_at: "2026-09-10T12:00:00Z",
    created_at: "2026-09-10T12:00:00Z",
  };

  it("successfully maps a valid 'note' row", () => {
    const res = gameLogRowToDomain(baseRow);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.value.type).toBe("note");
    expect(res.value.content).toBe("Just completed the prologue.");
    expect(res.value.metadata).toEqual({});
    expect(res.value.isPrivate).toBe(false);
  });

  it("fails to map a 'note' with null or empty content", () => {
    const res = gameLogRowToDomain({ ...baseRow, content: null });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.message).toContain("requires non-empty content");
    }
  });

  it("successfully maps a valid 'status_change' row", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "status_change",
      content: null,
      metadata: { old_status: "backlog", new_status: "playing" },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.value.type).toBe("status_change");
    expect(res.value.content).toBeNull();
    expect(res.value.metadata).toEqual({
      old_status: "backlog",
      new_status: "playing",
    });
  });

  it("fails to map a 'status_change' with an invalid status enum", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "status_change",
      content: null,
      metadata: { old_status: "invalid_status", new_status: "playing" },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(false);
  });

  it("successfully maps a valid 'priority_change' row", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "priority_change",
      content: null,
      metadata: { old_priority: 50, new_priority: 85 },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.value.type).toBe("priority_change");
    expect(res.value.metadata).toEqual({
      old_priority: 50,
      new_priority: 85,
    });
  });

  it("fails to map a 'priority_change' with non-numeric values", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "priority_change",
      content: null,
      metadata: { old_priority: "not-a-number", new_priority: 85 },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(false);
  });

  it("successfully maps a valid 'rating_change' row with nulls and numbers", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "rating_change",
      content: null,
      metadata: { old_rating: null, new_rating: 4.5 },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.value.type).toBe("rating_change");
    expect(res.value.metadata).toEqual({
      old_rating: null,
      new_rating: 4.5,
    });
  });

  it("successfully maps a valid 'created' row", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "created",
      content: null,
      metadata: {
        initial_status: "backlog",
        initial_priority: 75,
        platform: "pc",
      },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.value.type).toBe("created");
    expect(res.value.metadata).toEqual({
      initial_status: "backlog",
      initial_priority: 75,
      platform: "pc",
    });
  });

  it("fails to map a 'created' row with invalid platform", () => {
    const row: GameLogRow = {
      ...baseRow,
      type: "created",
      content: null,
      metadata: {
        initial_status: "backlog",
        initial_priority: 75,
        platform: "atari_2600",
      },
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(false);
  });

  it("fails to map an unknown type", () => {
    const row = {
      ...baseRow,
      type: "unknown_event" as unknown as GameLogRow["type"],
    };
    const res = gameLogRowToDomain(row);
    expect(res.success).toBe(false);
  });
});
