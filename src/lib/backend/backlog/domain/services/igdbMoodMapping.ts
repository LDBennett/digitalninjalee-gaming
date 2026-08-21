// IGDB Genre IDs → app mood names
// https://api-docs.igdb.com/#genre
const GENRE_MOODS: Record<number, string[]> = {
  2: ["adventure"], // Point-and-click
  4: ["fighting"], // Fighting
  5: ["action", "shooter"], // Shooter
  9: ["puzzle"], // Puzzle
  11: ["strategy", "tactical"], // Real Time Strategy (RTS)
  12: ["rpg"], // Role-playing (RPG)
  13: ["chill"], // Simulator
  14: ["sports"], // Sport
  15: ["strategy"], // Strategy
  16: ["strategy", "tactical"], // Turn-based strategy (TBS)
  24: ["tactical"], // Tactical
  25: ["action", "fighting"], // Hack and slash / Beat 'em up
  31: ["adventure"], // Adventure
  32: ["indie"], // Indie
  36: ["multiplayer", "strategy"], // MOBA
};

// IGDB Theme IDs → app mood names
// https://api-docs.igdb.com/#theme
const THEME_MOODS: Record<number, string[]> = {
  1: ["action"], // Action
  27: ["chill"], // Comedy
  33: ["open-world"], // Sandbox
  35: ["family-friendly"], // Kids
  38: ["open-world"], // Open world
  40: ["multiplayer"], // Party
  41: ["strategy"], // 4X (Explore, Expand, Exploit, Exterminate)
};

// IGDB Game Mode IDs → app mood names
// https://api-docs.igdb.com/#game-mode
const GAME_MODE_MOODS: Record<number, string[]> = {
  2: ["multiplayer", "online"], // Multiplayer
  3: ["co-op", "multiplayer"], // Co-operative
  4: ["multiplayer"], // Split screen
  5: ["online", "multiplayer"], // Massively Multiplayer Online (MMO)
  6: ["online", "multiplayer"], // Battle Royale
};

export function mapIgdbToMoods(data: {
  genreIds: number[];
  themeIds: number[];
  gameModeIds: number[];
}): string[] {
  const moods = new Set<string>();
  for (const id of data.genreIds)
    for (const m of GENRE_MOODS[id] ?? []) moods.add(m);
  for (const id of data.themeIds)
    for (const m of THEME_MOODS[id] ?? []) moods.add(m);
  for (const id of data.gameModeIds)
    for (const m of GAME_MODE_MOODS[id] ?? []) moods.add(m);
  return [...moods];
}
