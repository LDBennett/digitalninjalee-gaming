// RAWG API
// Docs: https://api.rawg.io/docs/

export interface RawgGame {
  id: number;
  name: string;
  coverUrl: string | null;
  released: string | null;
}

export interface RawgGameData {
  rawgId: number;
  name: string;
  backgroundUrl: string | null;
  description: string | null; // description_raw — fallback if IGDB summary is missing
  released: string | null;
  genreSlugs: string[]; // e.g. ['action', 'role-playing-games-rpg']
  tagSlugs: string[]; // e.g. ['co-op', 'open-world', 'story-rich']
}

export async function fetchRawgGameData(
  id: number,
  apiKey: string,
): Promise<RawgGameData | null> {
  const url = `https://api.rawg.io/api/games/${id}?key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`RAWG API responded with ${res.status}`);

  const g = (await res.json()) as Record<string, unknown>;
  if (!g.id) return null;

  const genres = (g.genres as Array<{ slug: string }> | undefined) ?? [];
  const tags =
    (g.tags as Array<{ slug: string }> | undefined)?.slice(0, 20) ?? [];

  return {
    rawgId: g.id as number,
    name: g.name as string,
    backgroundUrl: (g.background_image as string) ?? null,
    description: (g.description_raw as string) ?? null,
    released: (g.released as string) ?? null,
    genreSlugs: genres.map((x) => x.slug),
    tagSlugs: tags.map((x) => x.slug),
  };
}

export function createRawgClient(apiKey: string) {
  return {
    searchGames: (query: string) => searchRawgGames(query, apiKey),
    fetchGame: (id: number) => fetchRawgGameData(id, apiKey),
  };
}

export async function searchRawgGames(
  query: string,
  apiKey: string,
): Promise<RawgGame[]> {
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=6&search_precise=true`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`RAWG API responded with ${res.status}`);

  const data = await res.json();
  return (data.results ?? []).map((g: Record<string, unknown>) => ({
    id: g.id as number,
    name: g.name as string,
    coverUrl: (g.background_image as string) ?? null,
    released: (g.released as string) ?? null,
  }));
}
