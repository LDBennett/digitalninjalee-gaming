import { describe, it, expect, vi } from "vitest";
import {
  newGame,
  transitionGame,
  updateGameDetails,
  adjustPriority,
  replaceMoods,
  selectRandomGame,
  buildStatusPayload,
} from "@/src/lib/backend/backlog/domain/services/game.service";
import type { GameState } from "@/src/lib/backend/backlog/domain/models/game.types";

function makeGame(overrides: Partial<GameState> = {}): GameState {
  const base = newGame({
    title: "Test Game",
    platform: "pc",
    status: "backlog",
    priorityScore: 50 as never,
    backgroundUrl: null,
    moods: [],
  });
  if (!base.success) throw new Error("makeGame failed");
  return { ...base.value, ...overrides };
}

describe("newGame", () => {
  it("creates a valid game", () => {
    const r = newGame({
      title: "Elden Ring",
      platform: "pc",
      status: "backlog",
      priorityScore: 75 as never,
      backgroundUrl: null,
      moods: [],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.value.title).toBe("Elden Ring");
      expect(r.value.platform).toBe("pc");
      expect(r.value.status).toBe("backlog");
    }
  });

  it("trims whitespace from title", () => {
    const r = newGame({
      title: "  Hollow Knight  ",
      platform: "switch",
      status: "backlog",
      priorityScore: 50 as never,
      backgroundUrl: null,
      moods: [],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.title).toBe("Hollow Knight");
  });

  it("rejects empty title", () => {
    const r = newGame({
      title: "   ",
      platform: "pc",
      status: "backlog",
      priorityScore: 50 as never,
      backgroundUrl: null,
      moods: [],
    });
    expect(r.success).toBe(false);
  });

  it("uses provided id when given", () => {
    const r = newGame({
      title: "Game",
      platform: "pc",
      status: "backlog",
      priorityScore: 50 as never,
      backgroundUrl: null,
      moods: [],
      id: "custom-id",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.id).toBe("custom-id");
  });

  it("sets lastPlayedAt to null", () => {
    const r = newGame({
      title: "Game",
      platform: "pc",
      status: "backlog",
      priorityScore: 50 as never,
      backgroundUrl: null,
      moods: [],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.lastPlayedAt).toBeNull();
  });
});

describe("transitionGame", () => {
  it("transitions backlog → playing successfully", () => {
    const game = makeGame({ status: "backlog" });
    const r = transitionGame(game, "playing");
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.status).toBe("playing");
  });

  it("sets lastPlayedAt when transitioning to playing", () => {
    const game = makeGame({ status: "backlog" });
    const r = transitionGame(game, "playing");
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.lastPlayedAt).toBeInstanceOf(Date);
  });

  it("does not set lastPlayedAt for non-playing transitions", () => {
    const game = makeGame({ status: "backlog" });
    const r = transitionGame(game, "dropped");
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.lastPlayedAt).toBeNull();
  });

  it("rejects invalid transition completed → backlog", () => {
    const game = makeGame({ status: "completed" });
    const r = transitionGame(game, "backlog");
    expect(r.success).toBe(false);
  });
});

describe("updateGameDetails", () => {
  it("updates title and platform", () => {
    const game = makeGame();
    const r = updateGameDetails(game, "New Title", "xbox", null);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.value.title).toBe("New Title");
      expect(r.value.platform).toBe("xbox");
    }
  });

  it("trims whitespace from updated title", () => {
    const game = makeGame();
    const r = updateGameDetails(game, "  Trimmed  ", "pc", null);
    expect(r.success).toBe(true);
    if (r.success) expect(r.value.title).toBe("Trimmed");
  });

  it("rejects empty title", () => {
    const game = makeGame();
    const r = updateGameDetails(game, "  ", "pc", null);
    expect(r.success).toBe(false);
  });
});

describe("adjustPriority", () => {
  it("increases priority score", () => {
    const game = makeGame({ priorityScore: 50 as never });
    const updated = adjustPriority(game, 10);
    expect(updated.priorityScore).toBe(60);
  });

  it("clamps at 100", () => {
    const game = makeGame({ priorityScore: 95 as never });
    const updated = adjustPriority(game, 50);
    expect(updated.priorityScore).toBe(100);
  });

  it("clamps at 1", () => {
    const game = makeGame({ priorityScore: 5 as never });
    const updated = adjustPriority(game, -50);
    expect(updated.priorityScore).toBe(1);
  });
});

describe("replaceMoods", () => {
  it("replaces moods with new set", () => {
    const game = makeGame({ moods: [{ id: "1", name: "action" }] });
    const newMoods = [{ id: "2", name: "rpg" }];
    const updated = replaceMoods(game, newMoods);
    expect(updated.moods).toEqual(newMoods);
  });

  it("accepts empty moods array", () => {
    const game = makeGame({ moods: [{ id: "1", name: "action" }] });
    const updated = replaceMoods(game, []);
    expect(updated.moods).toHaveLength(0);
  });
});

describe("selectRandomGame", () => {
  it("returns null for empty array", () => {
    expect(selectRandomGame([])).toBeNull();
  });

  it("returns the only element when array has one item", () => {
    const game = makeGame();
    expect(selectRandomGame([game])).toBe(game);
  });

  it("returns an item from the array", () => {
    const games = [makeGame(), makeGame(), makeGame()];
    const result = selectRandomGame(games);
    expect(games).toContain(result);
  });

  it("uses Math.random to pick", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const games = [makeGame(), makeGame(), makeGame()];
    const result = selectRandomGame(games);
    expect(result).toBe(games[0]);
    vi.restoreAllMocks();
  });
});

describe("buildStatusPayload", () => {
  it("includes last_played_at for completed", () => {
    const payload = buildStatusPayload("completed");
    expect(payload.status).toBe("completed");
    expect(typeof payload.last_played_at).toBe("string");
  });

  it("includes last_played_at for main-complete", () => {
    const payload = buildStatusPayload("main-complete");
    expect(payload.last_played_at).toBeDefined();
  });

  it("does not include last_played_at for other statuses", () => {
    const payload = buildStatusPayload("playing");
    expect(payload.last_played_at).toBeUndefined();
  });
});
