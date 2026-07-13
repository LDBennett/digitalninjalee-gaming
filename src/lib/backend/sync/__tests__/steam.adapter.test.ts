import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchSteamPresence } from "@/src/lib/backend/sync/steam.adapter";

function mockFetchResponse(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchSteamPresence", () => {
  it("returns the game name when in-game", async () => {
    mockFetchResponse(200, {
      response: { players: [{ gameextrainfo: "Hades II", gameid: "1145350" }] },
    });

    const result = await fetchSteamPresence("key", "76561198000000000");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.gameName).toBe("Hades II");
  });

  it("returns null when the player is not in-game", async () => {
    mockFetchResponse(200, {
      response: { players: [{ personaname: "lee" }] },
    });

    const result = await fetchSteamPresence("key", "76561198000000000");
    expect(result.success).toBe(true);
    if (result.success) expect(result.value.gameName).toBeNull();
  });

  it("errors when no player is returned (bad id or private profile)", async () => {
    mockFetchResponse(200, { response: { players: [] } });

    const result = await fetchSteamPresence("key", "bad-id");
    expect(result.success).toBe(false);
  });

  it("errors on a non-200 response", async () => {
    mockFetchResponse(403, {});

    const result = await fetchSteamPresence("bad-key", "76561198000000000");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toContain("403");
  });

  it("errors when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await fetchSteamPresence("key", "76561198000000000");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toBe("network down");
  });
});
