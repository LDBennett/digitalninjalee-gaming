import { Result, ok, err } from "@/src/lib/backend/shared/result";
import { TimeToBeat } from "@/src/lib/backend/backlog/domain/models/game.types";

const HLTB_BASE_URL = "https://howlongtobeat.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// In-memory cache for HLTB searches (1-hour TTL)
const cache = new Map<string, { data: TimeToBeat | null; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

interface HltbRawGame {
  game_id: number;
  game_name: string;
  comp_main: number; // in seconds
  comp_plus: number;
  comp_100: number;
}

function secondsToHours(seconds: number): number | null {
  if (!seconds || seconds <= 0) return null;
  return Math.round((seconds / 3600) * 10) / 10;
}

/**
 * Native, zero-dependency HowLongToBeat scraper and sync adapter.
 * Uses HLTB's live Next.js search security tokens.
 */
export async function fetchHltbPlaytimes(
  title: string,
): Promise<Result<TimeToBeat | null, Error>> {
  if (process.env.ENABLE_HLTB_SYNC === "false") {
    return ok(null);
  }

  const normalizedKey = title.trim().toLowerCase();
  const cached = cache.get(normalizedKey);
  if (cached && cached.expiresAt > Date.now()) {
    return ok(cached.data);
  }

  try {
    // 1. Fetch dynamic security token and honeypot validation keys
    const initRes = await fetch(
      `${HLTB_BASE_URL}/api/search/site/init?t=${Date.now()}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Referer: HLTB_BASE_URL,
        },
        signal: AbortSignal.timeout(6000),
      },
    );

    if (!initRes.ok) {
      return err(new Error(`HLTB security init failed: ${initRes.status}`));
    }

    const { token, hpKey, hpVal } = (await initRes.json()) as {
      token: string;
      hpKey?: string;
      hpVal?: string;
    };

    if (!token) {
      return err(new Error("HLTB security init returned no token"));
    }

    // 2. Build payload with honeypot challenge
    const searchTerms = title.trim().split(/\s+/).filter(Boolean);
    const payload: Record<string, unknown> = {
      searchType: "games",
      searchTerms,
      searchPage: 1,
      size: 5,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: { min: 0, max: 0 },
          gameplay: { perspective: "", flow: "", genre: "", difficulty: "" },
          year: "",
          modifier: "",
        },
        users: { sortCategory: "postcount" },
        lists: { sortCategory: "follows" },
        filter: "",
        sort: 0,
        randomizer: 0,
      },
      useCache: true,
    };

    if (hpKey && hpVal) {
      payload[hpKey] = hpVal;
    }

    // 3. Query search endpoint
    const searchRes = await fetch(`${HLTB_BASE_URL}/api/search/site`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        Referer: HLTB_BASE_URL,
        "x-auth-token": token,
        "x-hp-key": hpKey || "",
        "x-hp-val": hpVal || "",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    if (!searchRes.ok) {
      return err(new Error(`HLTB search failed: ${searchRes.status}`));
    }

    const data = (await searchRes.json()) as { data?: HltbRawGame[] };
    const games = data?.data ?? [];

    if (games.length === 0) {
      cache.set(normalizedKey, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return ok(null);
    }

    // Select primary candidate (first match)
    const matched = games[0];
    const timeToBeat: TimeToBeat = {
      schema_version: 1,
      main: secondsToHours(matched.comp_main),
      extra: secondsToHours(matched.comp_plus),
      completionist: secondsToHours(matched.comp_100),
      source: "hltb",
      hltb_id: matched.game_id,
      url: `${HLTB_BASE_URL}/game/${matched.game_id}`,
      synced_at: new Date().toISOString(),
    };

    cache.set(normalizedKey, {
      data: timeToBeat,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return ok(timeToBeat);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}
