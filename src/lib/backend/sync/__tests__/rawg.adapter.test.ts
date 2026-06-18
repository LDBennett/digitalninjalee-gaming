import { describe, it, expect } from "vitest";
import { mapRawgToMoods } from "@/src/lib/backend/sync/rawg.adapter";

describe("mapRawgToMoods", () => {
  it("returns empty array for no genres or tags", () => {
    expect(mapRawgToMoods({ genreSlugs: [], tagSlugs: [] })).toHaveLength(0);
  });

  it("maps known genre slug to moods", () => {
    const moods = mapRawgToMoods({ genreSlugs: ["action"], tagSlugs: [] });
    expect(moods).toContain("action");
  });

  it("maps shooter genre to action and shooter moods", () => {
    const moods = mapRawgToMoods({ genreSlugs: ["shooter"], tagSlugs: [] });
    expect(moods).toContain("action");
    expect(moods).toContain("shooter");
  });

  it("maps role-playing-games-rpg to rpg", () => {
    const moods = mapRawgToMoods({ genreSlugs: ["role-playing-games-rpg"], tagSlugs: [] });
    expect(moods).toContain("rpg");
  });

  it("maps massively-multiplayer genre to online and multiplayer", () => {
    const moods = mapRawgToMoods({ genreSlugs: ["massively-multiplayer"], tagSlugs: [] });
    expect(moods).toContain("online");
    expect(moods).toContain("multiplayer");
  });

  it("maps known tag slug to moods", () => {
    const moods = mapRawgToMoods({ genreSlugs: [], tagSlugs: ["co-op"] });
    expect(moods).toContain("co-op");
  });

  it("maps open-world tag to open-world only", () => {
    const moods = mapRawgToMoods({ genreSlugs: [], tagSlugs: ["open-world"] });
    expect(moods).toContain("open-world");
  });

  it("maps exploration tag to open-world and adventure", () => {
    const moods = mapRawgToMoods({ genreSlugs: [], tagSlugs: ["exploration"] });
    expect(moods).toContain("open-world");
    expect(moods).toContain("adventure");
  });

  it("ignores unknown genre slugs", () => {
    const moods = mapRawgToMoods({ genreSlugs: ["unknown-genre"], tagSlugs: [] });
    expect(moods).toHaveLength(0);
  });

  it("ignores unknown tag slugs", () => {
    const moods = mapRawgToMoods({ genreSlugs: [], tagSlugs: ["mystery-tag"] });
    expect(moods).toHaveLength(0);
  });

  it("deduplicates moods from overlapping genre and tag mappings", () => {
    // arcade (genre) → action; action (separate) also appears in other mappings
    const moods = mapRawgToMoods({
      genreSlugs: ["action", "arcade"],
      tagSlugs: [],
    });
    const actionCount = moods.filter((m) => m === "action").length;
    expect(actionCount).toBe(1);
  });

  it("combines moods from both genres and tags", () => {
    const moods = mapRawgToMoods({
      genreSlugs: ["strategy"],
      tagSlugs: ["story-rich"],
    });
    expect(moods).toContain("strategy");
    expect(moods).toContain("story");
  });
});
