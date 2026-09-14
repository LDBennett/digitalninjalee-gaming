import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isOk, isErr } from "@/src/lib/backend/shared/result";
import { fetchHltbPlaytimes } from "../hltb.adapter";

describe("hltb.adapter", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.ENABLE_HLTB_SYNC;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns ok(null) when ENABLE_HLTB_SYNC is 'false'", async () => {
    process.env.ENABLE_HLTB_SYNC = "false";
    const result = await fetchHltbPlaytimes("Elden Ring");
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBeNull();
    }
  });

  it("successfully fetches and transforms playtime data from HLTB Next.js endpoints", async () => {
    const mockInitResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        token: "mock-token-xyz",
        hpKey: "custom_hp_key",
        hpVal: "custom_hp_val",
      }),
    };

    const mockSearchResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            game_id: 68151,
            game_name: "Elden Ring",
            comp_main: 216000, // 60 hours
            comp_plus: 360000, // 100 hours
            comp_100: 486000, // 135 hours
          },
        ],
      }),
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(mockInitResponse)
      .mockResolvedValueOnce(mockSearchResponse);

    global.fetch = mockFetch as unknown as typeof fetch;

    const uniqueGame = `Unique Game ${Date.now()}`;
    const result = await fetchHltbPlaytimes(uniqueGame);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).not.toBeNull();
      expect(result.value?.main).toBe(60);
      expect(result.value?.extra).toBe(100);
      expect(result.value?.completionist).toBe(135);
      expect(result.value?.hltb_id).toBe(68151);
      expect(result.value?.source).toBe("hltb");
      expect(result.value?.url).toBe("https://howlongtobeat.com/game/68151");
    }

    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Check headers on search request
    const searchCallArgs = mockFetch.mock.calls[1];
    expect(searchCallArgs[0]).toBe("https://howlongtobeat.com/api/search/site");
    const options = searchCallArgs[1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers["x-auth-token"]).toBe("mock-token-xyz");
    expect(headers["x-hp-key"]).toBe("custom_hp_key");
    expect(headers["x-hp-val"]).toBe("custom_hp_val");
  });

  it("returns ok(null) when no games are returned by HLTB", async () => {
    const mockInitResponse = {
      ok: true,
      status: 200,
      json: async () => ({ token: "token-123" }),
    };

    const mockSearchResponse = {
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockInitResponse)
      .mockResolvedValueOnce(mockSearchResponse) as unknown as typeof fetch;

    const result = await fetchHltbPlaytimes(`Unknown Nonexistent Game ${Date.now()}`);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBeNull();
    }
  });

  it("returns err when init endpoint fails", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
    }) as unknown as typeof fetch;

    const result = await fetchHltbPlaytimes(`Error Game ${Date.now()}`);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("HLTB security init failed: 503");
    }
  });

  it("returns err when search endpoint fails", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: "valid-token" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      }) as unknown as typeof fetch;

    const result = await fetchHltbPlaytimes(`Error Game 2 ${Date.now()}`);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("HLTB search failed: 500");
    }
  });
});
