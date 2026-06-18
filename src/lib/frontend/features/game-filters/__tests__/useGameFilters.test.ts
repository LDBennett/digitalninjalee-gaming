import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameFilters } from "@/src/lib/frontend/features/game-filters/hooks/useGameFilters";
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
    ...overrides,
  };
}

describe("useGameFilters", () => {
  it("returns all games with no filters applied", () => {
    const games = [makeGame(), makeGame(), makeGame()];
    const { result } = renderHook(() => useGameFilters(games));
    expect(result.current.filtered).toHaveLength(3);
  });

  it("filters by search query (substring, case-insensitive)", () => {
    const games = [
      makeGame({ title: "Elden Ring" }),
      makeGame({ title: "Dark Souls" }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setSearchQuery("elden"));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].title).toBe("Elden Ring");
  });

  it("filters by mood", () => {
    const games = [
      makeGame({ moods: [{ id: "1", name: "action" }] }),
      makeGame({ moods: [{ id: "2", name: "rpg" }] }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setMoodFilter("action"));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].moods[0].name).toBe("action");
  });

  it("clears mood filter when set to null", () => {
    const games = [
      makeGame({ moods: [{ id: "1", name: "action" }] }),
      makeGame({ moods: [] }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setMoodFilter("action"));
    expect(result.current.filtered).toHaveLength(1);
    act(() => result.current.setMoodFilter(null));
    expect(result.current.filtered).toHaveLength(2);
  });

  it("filters by platform", () => {
    const games = [
      makeGame({ platform: "pc" }),
      makeGame({ platform: "xbox" }),
      makeGame({ platform: "switch" }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setPlatformFilter("xbox"));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].platform).toBe("xbox");
  });

  it("sorts by priority-desc by default", () => {
    const games = [
      makeGame({ priority_score: 30 }),
      makeGame({ priority_score: 90 }),
      makeGame({ priority_score: 60 }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    expect(result.current.filtered[0].priority_score).toBe(90);
    expect(result.current.filtered[2].priority_score).toBe(30);
  });

  it("sorts by priority-asc", () => {
    const games = [
      makeGame({ priority_score: 30 }),
      makeGame({ priority_score: 90 }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setSortBy("priority-asc"));
    expect(result.current.filtered[0].priority_score).toBe(30);
    expect(result.current.filtered[1].priority_score).toBe(90);
  });

  it("sorts by name-asc", () => {
    const games = [
      makeGame({ title: "Zelda" }),
      makeGame({ title: "Assassin" }),
      makeGame({ title: "Mario" }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setSortBy("name-asc"));
    expect(result.current.filtered.map((g) => g.title)).toEqual([
      "Assassin",
      "Mario",
      "Zelda",
    ]);
  });

  it("sorts by name-desc", () => {
    const games = [
      makeGame({ title: "Zelda" }),
      makeGame({ title: "Assassin" }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => result.current.setSortBy("name-desc"));
    expect(result.current.filtered[0].title).toBe("Zelda");
    expect(result.current.filtered[1].title).toBe("Assassin");
  });

  it("applies mood and search filters together", () => {
    const games = [
      makeGame({ title: "Elden Ring", moods: [{ id: "1", name: "action" }] }),
      makeGame({ title: "Elden Lite", moods: [{ id: "2", name: "chill" }] }),
      makeGame({ title: "Dark Souls", moods: [{ id: "1", name: "action" }] }),
    ];
    const { result } = renderHook(() => useGameFilters(games));
    act(() => {
      result.current.setMoodFilter("action");
      result.current.setSearchQuery("Elden");
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].title).toBe("Elden Ring");
  });
});
