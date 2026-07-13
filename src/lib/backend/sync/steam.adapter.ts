import { Result, ok, err } from "@/src/lib/backend/shared/result";

export interface SteamPresence {
  gameName: string | null;
}

const PLAYER_SUMMARIES_URL =
  "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";

interface PlayerSummariesResponse {
  response?: {
    players?: Array<{ gameextrainfo?: string }>;
  };
}

/**
 * Reads the user's current Steam in-game status via the official Web API.
 * `gameextrainfo` is only present while in-game and requires the profile's
 * "Game details" privacy setting to be Public. Not in-game resolves to
 * { gameName: null }; an empty players list means a bad SteamID or a
 * private profile and is treated as an error.
 */
export async function fetchSteamPresence(
  apiKey: string,
  steamId: string,
  timeoutMs = 5000,
): Promise<Result<SteamPresence, Error>> {
  const url = `${PLAYER_SUMMARIES_URL}?key=${apiKey}&steamids=${steamId}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) {
      return err(new Error(`Steam API responded ${res.status}`));
    }

    const body = (await res.json()) as PlayerSummariesResponse;
    const player = body.response?.players?.[0];
    if (!player) {
      return err(
        new Error("Steam API returned no player — check the SteamID and profile privacy"),
      );
    }

    return ok({ gameName: player.gameextrainfo ?? null });
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
