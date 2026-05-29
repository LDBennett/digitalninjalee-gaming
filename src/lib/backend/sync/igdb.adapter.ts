// IGDB API (via Twitch developer credentials)
// Docs: https://api-docs.igdb.com/

export interface IgdbGameData {
  igdbId: number;
  name: string;
  summary: string | null;
  coverArtUrl: string | null;
  genreIds: number[];
  themeIds: number[];
  gameModeIds: number[];
}

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

export function mapIgdbToMoods(
  data: Pick<IgdbGameData, "genreIds" | "themeIds" | "gameModeIds">,
): string[] {
  const moods = new Set<string>();
  for (const id of data.genreIds)
    for (const m of GENRE_MOODS[id] ?? []) moods.add(m);
  for (const id of data.themeIds)
    for (const m of THEME_MOODS[id] ?? []) moods.add(m);
  for (const id of data.gameModeIds)
    for (const m of GAME_MODE_MOODS[id] ?? []) moods.add(m);
  return [...moods];
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" },
  );
  if (!res.ok)
    throw new Error(`Twitch auth failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchIgdbGameData(
  title: string,
  clientId: string,
  accessToken: string,
): Promise<IgdbGameData | null> {
  const sanitized = title.replace(/"/g, "");
  const body = [
    "fields name,summary,cover.image_id,genres,themes,game_modes;",
    `search "${sanitized}";`,
    "limit 1;",
  ].join(" ");

  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!res.ok)
    throw new Error(`IGDB API responded with ${res.status} ${res.statusText}`);

  const results = (await res.json()) as Array<Record<string, unknown>>;
  if (!results.length) return null;

  const game = results[0];
  const cover = game.cover as { image_id: string } | null | undefined;

  return {
    igdbId: game.id as number,
    name: game.name as string,
    summary: (game.summary as string) ?? null,
    coverArtUrl: cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`
      : null,
    genreIds: (game.genres as number[]) ?? [],
    themeIds: (game.themes as number[]) ?? [],
    gameModeIds: (game.game_modes as number[]) ?? [],
  };
}

// Returns a bound client so the OAuth token is fetched once per session.
export async function createIgdbClient(clientId: string, clientSecret: string) {
  const accessToken = await getAccessToken(clientId, clientSecret);
  return {
    fetchGame: (title: string) =>
      fetchIgdbGameData(title, clientId, accessToken),
  };
}
