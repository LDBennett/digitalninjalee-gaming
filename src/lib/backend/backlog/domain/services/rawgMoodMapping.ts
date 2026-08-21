// RAWG Genre slugs → app mood names
const RAWG_GENRE_MOODS: Record<string, string[]> = {
  action: ["action"],
  shooter: ["action", "shooter"],
  fighting: ["fighting"],
  "role-playing-games-rpg": ["rpg"],
  strategy: ["strategy"],
  puzzle: ["puzzle"],
  adventure: ["adventure"],
  indie: ["indie"],
  sports: ["sports"],
  racing: ["sports"],
  simulation: ["chill"],
  casual: ["chill"],
  family: ["family-friendly"],
  "massively-multiplayer": ["online", "multiplayer"],
  arcade: ["action", "quick-session"],
  platformer: ["action"],
  card: ["chill"],
  "board-games": ["chill"],
};

// Selected RAWG tag slugs → app mood names
const RAWG_TAG_MOODS: Record<string, string[]> = {
  "co-op": ["co-op"],
  "local-co-op": ["co-op", "multiplayer"],
  multiplayer: ["multiplayer"],
  "online-multiplayer": ["online", "multiplayer"],
  "local-multiplayer": ["multiplayer"],
  "open-world": ["open-world"],
  roguelike: ["roguelike"],
  "rogue-lite": ["roguelike"],
  tactical: ["tactical"],
  "turn-based": ["tactical"],
  "turn-based-strategy": ["strategy", "tactical"],
  "story-rich": ["story"],
  vr: ["vr"],
  "split-screen": ["multiplayer"],
  "battle-royale": ["online", "multiplayer"],
  exploration: ["open-world", "adventure"],
  rhythm: ["rhythm"],
};

export function mapRawgToMoods(data: {
  genreSlugs: string[];
  tagSlugs: string[];
}): string[] {
  const moods = new Set<string>();
  for (const slug of data.genreSlugs)
    for (const m of RAWG_GENRE_MOODS[slug] ?? []) moods.add(m);
  for (const slug of data.tagSlugs)
    for (const m of RAWG_TAG_MOODS[slug] ?? []) moods.add(m);
  return [...moods];
}
