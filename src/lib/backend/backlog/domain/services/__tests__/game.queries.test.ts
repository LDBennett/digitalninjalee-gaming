import { describe, it, expect } from "vitest";
import {
  filterByMood,
  filterByPlayGoal,
  filterByTitle,
  filterByDuration,
  getTopPriority,
  getPlayingGames,
  getRecentlyPlayed,
} from "@/src/lib/backend/backlog/domain/services/game.queries";
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

describe("filterByMood", () => {
  it("returns all games when moodFilter is null", () => {
    const games = [makeGame(), makeGame()];
    expect(filterByMood(games, null)).toHaveLength(2);
  });

  it("returns only games matching the mood", () => {
    const games = [
      makeGame({ moods: [{ id: "1", name: "action" }] }),
      makeGame({ moods: [{ id: "2", name: "rpg" }] }),
    ];
    const result = filterByMood(games, "action");
    expect(result).toHaveLength(1);
    expect(result[0].moods[0].name).toBe("action");
  });

  it("returns empty array when no games match", () => {
    const games = [makeGame({ moods: [{ id: "1", name: "action" }] })];
    expect(filterByMood(games, "puzzle")).toHaveLength(0);
  });

  it("matches against any mood in the list", () => {
    const game = makeGame({
      moods: [
        { id: "1", name: "action" },
        { id: "2", name: "rpg" },
      ],
    });
    expect(filterByMood([game], "rpg")).toHaveLength(1);
  });
});

describe("filterByPlayGoal", () => {
  it("returns all games when playGoalFilter is null", () => {
    const games = [makeGame(), makeGame()];
    expect(filterByPlayGoal(games, null)).toHaveLength(2);
  });

  it("returns only games matching the play goal", () => {
    const games = [
      makeGame({ play_goals: ["completionist"] }),
      makeGame({ play_goals: ["casual"] }),
    ];
    const result = filterByPlayGoal(games, "completionist");
    expect(result).toHaveLength(1);
    expect(result[0].play_goals).toContain("completionist");
  });

  it("returns empty array when no games match", () => {
    const games = [makeGame({ play_goals: ["completionist"] })];
    expect(filterByPlayGoal(games, "casual")).toHaveLength(0);
  });

  it("matches against any play goal in the list", () => {
    const game = makeGame({
      play_goals: ["story-completion", "casual"],
    });
    expect(filterByPlayGoal([game], "casual")).toHaveLength(1);
  });
});

describe("filterByTitle", () => {
  it("returns all games for empty query", () => {
    const games = [makeGame(), makeGame()];
    expect(filterByTitle(games, "")).toHaveLength(2);
  });

  it("returns all games for whitespace-only query", () => {
    const games = [makeGame(), makeGame()];
    expect(filterByTitle(games, "   ")).toHaveLength(2);
  });

  it("matches substring case-insensitively", () => {
    const games = [
      makeGame({ title: "Elden Ring" }),
      makeGame({ title: "Dark Souls" }),
    ];
    expect(filterByTitle(games, "elden")).toHaveLength(1);
    expect(filterByTitle(games, "DARK")).toHaveLength(1);
  });

  it("returns empty array when no title matches", () => {
    const games = [makeGame({ title: "Hollow Knight" })];
    expect(filterByTitle(games, "mario")).toHaveLength(0);
  });
});

describe("getTopPriority", () => {
  it("returns only backlog and want-to-replay games", () => {
    const games = [
      makeGame({ status: "backlog", priority_score: 80 }),
      makeGame({ status: "playing", priority_score: 90 }),
      makeGame({
        status: "completed",
        replay_status: "want-to-replay",
        priority_score: 70,
      }),
    ];
    const result = getTopPriority(games);
    expect(result).toHaveLength(2);
  });

  it("sorts by priority descending", () => {
    const games = [
      makeGame({ status: "backlog", priority_score: 30 }),
      makeGame({ status: "backlog", priority_score: 90 }),
      makeGame({ status: "backlog", priority_score: 60 }),
    ];
    const result = getTopPriority(games);
    expect(result[0].priority_score).toBe(90);
    expect(result[1].priority_score).toBe(60);
    expect(result[2].priority_score).toBe(30);
  });

  it("respects the limit parameter", () => {
    const games = Array.from({ length: 10 }, () =>
      makeGame({ status: "backlog" }),
    );
    expect(getTopPriority(games, 3)).toHaveLength(3);
  });
});

describe("getPlayingGames", () => {
  it("includes playing, ongoing, and replaying games", () => {
    const games = [
      makeGame({ status: "playing" }),
      makeGame({ status: "ongoing" }),
      makeGame({ status: "backlog", replay_status: "replaying" }),
      makeGame({ status: "completed" }),
    ];
    const result = getPlayingGames(games);
    expect(result).toHaveLength(3);
  });
});

describe("getRecentlyPlayed", () => {
  it("excludes games without last_played_at", () => {
    const games = [
      makeGame({ last_played_at: null }),
      makeGame({ last_played_at: "2024-01-01T00:00:00Z" }),
    ];
    expect(getRecentlyPlayed(games)).toHaveLength(1);
  });

  it("sorts by last_played_at descending", () => {
    const games = [
      makeGame({ title: "Older", last_played_at: "2023-06-01T00:00:00Z" }),
      makeGame({ title: "Newest", last_played_at: "2024-06-01T00:00:00Z" }),
      makeGame({ title: "Middle", last_played_at: "2024-01-01T00:00:00Z" }),
    ];
    const result = getRecentlyPlayed(games);
    expect(result[0].title).toBe("Newest");
    expect(result[1].title).toBe("Middle");
    expect(result[2].title).toBe("Older");
  });

  it("respects the limit parameter", () => {
    const games = Array.from({ length: 10 }, (_, i) =>
      makeGame({ last_played_at: `2024-0${(i % 9) + 1}-01T00:00:00Z` }),
    );
    expect(getRecentlyPlayed(games, 3)).toHaveLength(3);
  });
});

describe("filterByDuration", () => {
  const shortGame = makeGame({
    title: "Short",
    time_to_beat: {
      schema_version: 1,
      main: 8,
      extra: 12,
      completionist: 15,
      hltb_id: 1,
      last_synced_at: new Date().toISOString(),
    },
  });
  const mediumGame = makeGame({
    title: "Medium",
    time_to_beat: {
      schema_version: 1,
      main: 15,
      extra: 20,
      completionist: 30,
      hltb_id: 2,
      last_synced_at: new Date().toISOString(),
    },
  });
  const longGame = makeGame({
    title: "Long",
    time_to_beat: {
      schema_version: 1,
      main: 40,
      extra: 60,
      completionist: 80,
      hltb_id: 3,
      last_synced_at: new Date().toISOString(),
    },
  });
  const epicGame = makeGame({
    title: "Epic",
    time_to_beat: {
      schema_version: 1,
      main: 90,
      extra: 120,
      completionist: 180,
      hltb_id: 4,
      last_synced_at: new Date().toISOString(),
    },
  });
  const noTimeGame = makeGame({ title: "NoTime", time_to_beat: null });

  const all = [shortGame, mediumGame, longGame, epicGame, noTimeGame];

  it("returns all games when durationFilter is null", () => {
    expect(filterByDuration(all, null)).toHaveLength(5);
  });

  it("filters short games (< 10h)", () => {
    const res = filterByDuration(all, "short");
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe("Short");
  });

  it("filters medium games (10-25h)", () => {
    const res = filterByDuration(all, "medium");
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe("Medium");
  });

  it("filters long games (25-50h)", () => {
    const res = filterByDuration(all, "long");
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe("Long");
  });

  it("filters epic games (> 50h)", () => {
    const res = filterByDuration(all, "epic");
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe("Epic");
  });

  it("excludes games with null time_to_beat when filter is active", () => {
    expect(filterByDuration([noTimeGame], "short")).toHaveLength(0);
    expect(filterByDuration([noTimeGame], "epic")).toHaveLength(0);
  });
});
