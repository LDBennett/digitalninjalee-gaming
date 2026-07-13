import { describe, it, expect } from "vitest";
import {
  shouldExtendSession,
  normalizeGameTitle,
  matchGameByTitle,
  collectDistinctGameNames,
  findExtendableSession,
  dedupeSessionsByGame,
} from "../session.logic";
import type { PlaySessionState } from "../../models/session.types";

const NOW = new Date("2026-07-11T12:00:00Z");

function minutesAgo(minutes: number): string {
  return new Date(NOW.getTime() - minutes * 60 * 1000).toISOString();
}

function makeSession(overrides?: Partial<PlaySessionState>): PlaySessionState {
  return {
    id: "s1",
    game_name: "Hades",
    game_id: null,
    started_at: minutesAgo(60),
    last_seen_at: minutesAgo(10),
    ...overrides,
  };
}

describe("shouldExtendSession", () => {
  it("extends when last seen within the gap", () => {
    expect(shouldExtendSession(minutesAgo(10), NOW)).toBe(true);
  });

  it("extends exactly at the gap boundary", () => {
    expect(shouldExtendSession(minutesAgo(20), NOW)).toBe(true);
  });

  it("starts a new session past the gap", () => {
    expect(shouldExtendSession(minutesAgo(21), NOW)).toBe(false);
  });

  it("respects a custom gap", () => {
    expect(shouldExtendSession(minutesAgo(25), NOW, 30)).toBe(true);
  });

  it("returns false for an unparseable timestamp", () => {
    expect(shouldExtendSession("not-a-date", NOW)).toBe(false);
  });
});

describe("normalizeGameTitle", () => {
  it("lowercases and strips trademark symbols", () => {
    expect(normalizeGameTitle("ELDEN RING™")).toBe("elden ring");
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(normalizeGameTitle("The Legend of Zelda: Breath of the Wild")).toBe(
      "the legend of zelda breath of the wild",
    );
  });
});

describe("matchGameByTitle", () => {
  const games = [
    { id: "g1", title: "Elden Ring" },
    { id: "g2", title: "Hades" },
    { id: "g3", title: "The Witcher 3: Wild Hunt" },
  ];

  it("matches exactly after normalization", () => {
    expect(matchGameByTitle(games, "ELDEN RING™")).toBe("g1");
  });

  it("matches when the activity name carries an edition suffix", () => {
    expect(
      matchGameByTitle(games, "The Witcher 3: Wild Hunt — Complete Edition"),
    ).toBe("g3");
  });

  it("returns null when nothing matches", () => {
    expect(matchGameByTitle(games, "Stardew Valley")).toBeNull();
  });

  it("returns null for an empty activity name", () => {
    expect(matchGameByTitle(games, "  ")).toBeNull();
  });
});

describe("collectDistinctGameNames", () => {
  it("drops sources that report no game", () => {
    const result = collectDistinctGameNames([
      { source: "discord", gameName: null },
      { source: "steam", gameName: "Hades II" },
    ]);
    expect(result).toEqual([{ source: "steam", gameName: "Hades II" }]);
  });

  it("collapses normalized duplicates, keeping the earlier source's spelling", () => {
    const result = collectDistinctGameNames([
      { source: "discord", gameName: "ELDEN RING™" },
      { source: "steam", gameName: "ELDEN RING" },
    ]);
    expect(result).toEqual([{ source: "discord", gameName: "ELDEN RING™" }]);
  });

  it("keeps genuinely different games from different sources", () => {
    const result = collectDistinctGameNames([
      { source: "discord", gameName: "Storyteller" },
      { source: "steam", gameName: "Hades II" },
    ]);
    expect(result).toHaveLength(2);
  });

  it("returns empty when nothing is playing", () => {
    expect(
      collectDistinctGameNames([
        { source: "discord", gameName: null },
        { source: "steam", gameName: null },
      ]),
    ).toEqual([]);
  });
});

describe("findExtendableSession", () => {
  it("finds an open session under a variant spelling", () => {
    const sessions = [
      makeSession({ id: "a", game_name: "ELDEN RING™", last_seen_at: minutesAgo(5) }),
    ];
    expect(findExtendableSession(sessions, "ELDEN RING", NOW)?.id).toBe("a");
  });

  it("ignores sessions outside the merge gap", () => {
    const sessions = [
      makeSession({ id: "a", game_name: "ELDEN RING™", last_seen_at: minutesAgo(45) }),
    ];
    expect(findExtendableSession(sessions, "ELDEN RING", NOW)).toBeNull();
  });

  it("ignores open sessions for other games", () => {
    const sessions = [
      makeSession({ id: "a", game_name: "Hades", last_seen_at: minutesAgo(5) }),
    ];
    expect(findExtendableSession(sessions, "ELDEN RING", NOW)).toBeNull();
  });

  it("returns null for an empty game name", () => {
    const sessions = [makeSession({ last_seen_at: minutesAgo(5) })];
    expect(findExtendableSession(sessions, "  ", NOW)).toBeNull();
  });
});

describe("dedupeSessionsByGame", () => {
  it("keeps only the latest session per game", () => {
    const sessions = [
      makeSession({ id: "a", game_name: "Hades", last_seen_at: minutesAgo(5) }),
      makeSession({ id: "b", game_name: "Elden Ring", last_seen_at: minutesAgo(30) }),
      makeSession({ id: "c", game_name: "Hades", last_seen_at: minutesAgo(90) }),
    ];
    const result = dedupeSessionsByGame(sessions);
    expect(result.map((s) => s.id)).toEqual(["a", "b"]);
  });

  it("treats differently-punctuated names as the same game", () => {
    const sessions = [
      makeSession({ id: "a", game_name: "NieR: Automata™" }),
      makeSession({ id: "b", game_name: "nier automata" }),
    ];
    expect(dedupeSessionsByGame(sessions)).toHaveLength(1);
  });

  it("caps the result at the limit", () => {
    const sessions = Array.from({ length: 8 }, (_, i) =>
      makeSession({ id: `s${i}`, game_name: `Game ${i}` }),
    );
    expect(dedupeSessionsByGame(sessions, 5)).toHaveLength(5);
  });
});
