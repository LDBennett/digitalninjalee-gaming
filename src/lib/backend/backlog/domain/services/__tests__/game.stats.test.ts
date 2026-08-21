import { describe, it, expect } from "vitest";
import { deriveStats } from "@/src/lib/backend/backlog/domain/services/game.stats";
import type { GameDto } from "@/src/lib/backend/backlog/domain/models/game.types";

let _idCounter = 0;
function makeGame(overrides: Partial<GameDto> = {}): GameDto {
  return {
    id: String(++_idCounter),
    title: "Game",
    platform: "pc",
    status: "backlog",
    priority_score: 50,
    background_url: null,
    cover_art_url: null,
    game_description: null,
    last_played_at: null,
    created_at: new Date().toISOString(),
    moods: [],
    replay_status: null,
    personal_note: null,
    rating: null,
    play_goals: [],
    ...overrides,
  };
}

describe("deriveStats", () => {
  it("counts each status correctly", () => {
    const games = [
      makeGame({ status: "backlog" }),
      makeGame({ status: "playing" }),
      makeGame({ status: "playing" }),
      makeGame({ status: "completed" }),
      makeGame({ status: "main-complete" }),
      makeGame({ status: "ongoing" }),
      makeGame({ status: "interested" }),
      makeGame({ status: "pre-ordered" }),
    ];
    const stats = deriveStats(games);
    expect(stats.backlog).toBe(1);
    expect(stats.playing).toBe(2);
    expect(stats.completed).toBe(2); // completed + main-complete
    expect(stats.completedFull).toBe(1);
    expect(stats.ongoing).toBe(1);
    expect(stats.wishlist).toBe(2);
    expect(stats.total).toBe(8);
  });

  it("adds want-to-replay games to backlog count", () => {
    const games = [
      makeGame({ status: "completed", replay_status: "want-to-replay" }),
    ];
    const stats = deriveStats(games);
    expect(stats.backlog).toBe(1);
  });

  it("does not double-count backlog games with want-to-replay", () => {
    const games = [
      makeGame({ status: "backlog", replay_status: "want-to-replay" }),
    ];
    const stats = deriveStats(games);
    expect(stats.backlog).toBe(1);
  });

  it("adds replaying games to playing count", () => {
    const games = [
      makeGame({ status: "completed", replay_status: "replaying" }),
    ];
    const stats = deriveStats(games);
    expect(stats.playing).toBe(1);
  });

  it("returns zeros for empty input", () => {
    const stats = deriveStats([]);
    expect(stats.total).toBe(0);
    expect(stats.backlog).toBe(0);
    expect(stats.playing).toBe(0);
  });
});
