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
  description: string | null;    // description_raw — fallback if IGDB summary is missing
  released: string | null;
  genreSlugs: string[];          // e.g. ['action', 'role-playing-games-rpg']
  tagSlugs: string[];            // e.g. ['co-op', 'open-world', 'story-rich']
}

// RAWG Genre slugs → app mood names
const GENRE_MOODS: Record<string, string[]> = {
  'action':                  ['action'],
  'shooter':                 ['action', 'shooter'],
  'fighting':                ['fighting'],
  'role-playing-games-rpg':  ['rpg'],
  'strategy':                ['strategy'],
  'puzzle':                  ['puzzle'],
  'adventure':               ['adventure'],
  'indie':                   ['indie'],
  'sports':                  ['sports'],
  'racing':                  ['sports'],
  'simulation':              ['chill'],
  'casual':                  ['chill'],
  'family':                  ['family-friendly'],
  'massively-multiplayer':   ['online', 'multiplayer'],
  'arcade':                  ['action', 'quick-session'],
  'platformer':              ['action'],
  'card':                    ['chill'],
  'board-games':             ['chill'],
};

// Selected RAWG tag slugs → app mood names
const TAG_MOODS: Record<string, string[]> = {
  'co-op':               ['co-op'],
  'local-co-op':         ['co-op', 'multiplayer'],
  'multiplayer':         ['multiplayer'],
  'online-multiplayer':  ['online', 'multiplayer'],
  'local-multiplayer':   ['multiplayer'],
  'open-world':          ['open-world'],
  'roguelike':           ['roguelike'],
  'rogue-lite':          ['roguelike'],
  'tactical':            ['tactical'],
  'turn-based':          ['tactical'],
  'turn-based-strategy': ['strategy', 'tactical'],
  'story-rich':          ['story'],
  'vr':                  ['vr'],
  'split-screen':        ['multiplayer'],
  'battle-royale':       ['online', 'multiplayer'],
  'exploration':         ['open-world', 'adventure'],
  'rhythm':              ['rhythm'],
};

export function mapRawgToMoods(
  data: Pick<RawgGameData, 'genreSlugs' | 'tagSlugs'>,
): string[] {
  const moods = new Set<string>();
  for (const slug of data.genreSlugs) for (const m of GENRE_MOODS[slug] ?? []) moods.add(m);
  for (const slug of data.tagSlugs)   for (const m of TAG_MOODS[slug]   ?? []) moods.add(m);
  return [...moods];
}

export async function fetchRawgGameData(
  id: number,
  apiKey: string,
): Promise<RawgGameData | null> {
  const url = `https://api.rawg.io/api/games/${id}?key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`RAWG API responded with ${res.status}`);

  const g = await res.json() as Record<string, unknown>;
  if (!g.id) return null;

  const genres = (g.genres as Array<{ slug: string }> | undefined) ?? [];
  // Cap tags at first page to avoid excessively large payloads
  const tags = (g.tags as Array<{ slug: string }> | undefined)?.slice(0, 20) ?? [];

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
    fetchGame:   (id: number)    => fetchRawgGameData(id, apiKey),
  };
}

export async function searchRawgGames(query: string, apiKey: string): Promise<RawgGame[]> {
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=6&search_precise=true`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`RAWG API responded with ${res.status}`);

  const data = await res.json();
  return (data.results ?? []).map((g: Record<string, unknown>) => ({
    id: g.id as number,
    name: g.name as string,
    coverUrl: (g.background_image as string) ?? null,
    released: (g.released as string) ?? null,
  }));
}
