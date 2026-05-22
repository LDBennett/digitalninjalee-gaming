export interface RawgGame {
  id: number;
  name: string;
  coverUrl: string | null;
  released: string | null;
}

export async function searchRawgGames(query: string): Promise<RawgGame[]> {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error('RAWG_API_KEY is not configured');

  const url = `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(query)}&page_size=6&search_precise=true`;
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
