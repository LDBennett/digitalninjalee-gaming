import { describe, it, expect } from "vitest";
import { mapIgdbToMoods } from "@/src/lib/backend/sync/igdb.adapter";

describe("mapIgdbToMoods", () => {
  it("returns empty array for no genre/theme/mode ids", () => {
    expect(mapIgdbToMoods({ genreIds: [], themeIds: [], gameModeIds: [] })).toHaveLength(0);
  });

  it("maps RPG genre id 12 to rpg", () => {
    const moods = mapIgdbToMoods({ genreIds: [12], themeIds: [], gameModeIds: [] });
    expect(moods).toContain("rpg");
  });

  it("maps shooter genre id 5 to action and shooter", () => {
    const moods = mapIgdbToMoods({ genreIds: [5], themeIds: [], gameModeIds: [] });
    expect(moods).toContain("action");
    expect(moods).toContain("shooter");
  });

  it("maps puzzle genre id 9 to puzzle", () => {
    const moods = mapIgdbToMoods({ genreIds: [9], themeIds: [], gameModeIds: [] });
    expect(moods).toContain("puzzle");
  });

  it("maps strategy genre id 15 to strategy", () => {
    const moods = mapIgdbToMoods({ genreIds: [15], themeIds: [], gameModeIds: [] });
    expect(moods).toContain("strategy");
  });

  it("maps open-world theme id 38 to open-world", () => {
    const moods = mapIgdbToMoods({ genreIds: [], themeIds: [38], gameModeIds: [] });
    expect(moods).toContain("open-world");
  });

  it("maps kids theme id 35 to family-friendly", () => {
    const moods = mapIgdbToMoods({ genreIds: [], themeIds: [35], gameModeIds: [] });
    expect(moods).toContain("family-friendly");
  });

  it("maps co-op game mode id 3 to co-op and multiplayer", () => {
    const moods = mapIgdbToMoods({ genreIds: [], themeIds: [], gameModeIds: [3] });
    expect(moods).toContain("co-op");
    expect(moods).toContain("multiplayer");
  });

  it("maps multiplayer game mode id 2 to multiplayer and online", () => {
    const moods = mapIgdbToMoods({ genreIds: [], themeIds: [], gameModeIds: [2] });
    expect(moods).toContain("multiplayer");
    expect(moods).toContain("online");
  });

  it("ignores unknown genre ids", () => {
    const moods = mapIgdbToMoods({ genreIds: [9999], themeIds: [], gameModeIds: [] });
    expect(moods).toHaveLength(0);
  });

  it("deduplicates moods from overlapping sources", () => {
    // RTS genre (11) → strategy, tactical; TBS genre (16) → strategy, tactical
    const moods = mapIgdbToMoods({ genreIds: [11, 16], themeIds: [], gameModeIds: [] });
    const strategyCount = moods.filter((m) => m === "strategy").length;
    expect(strategyCount).toBe(1);
  });

  it("combines moods from genres, themes, and game modes", () => {
    const moods = mapIgdbToMoods({
      genreIds: [12],    // rpg
      themeIds: [38],    // open-world
      gameModeIds: [3],  // co-op, multiplayer
    });
    expect(moods).toContain("rpg");
    expect(moods).toContain("open-world");
    expect(moods).toContain("co-op");
  });
});
