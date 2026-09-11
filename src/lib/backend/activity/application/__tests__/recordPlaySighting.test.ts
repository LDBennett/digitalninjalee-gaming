import { describe, it, expect, vi } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { ok, err } from "@/src/lib/backend/shared/result";
import { recordPlaySighting } from "../recordPlaySighting";
import type { PlaySessionRepository } from "../../repository/playSession.repo";
import type { PlaySessionState, RecentPlayDto } from "../../domain/models/session.types";

function createMockRepo(overrides: Partial<PlaySessionRepository> = {}): PlaySessionRepository {
  return {
    findLatestByGameName: vi.fn().mockResolvedValue(ok(null)),
    findRecent: vi.fn().mockResolvedValue(ok([])),
    insert: vi.fn().mockResolvedValue(ok(undefined)),
    touch: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides,
  };
}

function createMockClient({
  libraryGames = [] as Array<{ id: string; title: string }>,
  selectError = null as { message: string } | null,
} = {}) {
  const eqFn = vi.fn().mockResolvedValue({ error: null });
  const updateFn = vi.fn().mockReturnValue({ eq: eqFn });

  const fromFn = vi.fn((table: string) => {
    if (table === "games") {
      return {
        select: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: selectError ? null : libraryGames,
            error: selectError,
          }),
        }),
        update: updateFn,
      };
    }
    return {};
  });

  return {
    client: { from: fromFn } as unknown as SupabaseClient,
    updateFn,
    eqFn,
  };
}

describe("recordPlaySighting", () => {
  const now = new Date("2026-09-11T12:00:00.000Z");

  it("extends an active session when exact name matches within merge gap", async () => {
    const existingSession: PlaySessionState = {
      id: "sess-1",
      game_name: "Celeste",
      game_id: "game-123",
      platform: "pc",
      started_at: "2026-09-11T11:45:00.000Z",
      last_seen_at: "2026-09-11T11:50:00.000Z", // 10m ago (< 20m merge gap)
    };

    const repo = createMockRepo({
      findLatestByGameName: vi.fn().mockResolvedValue(ok(existingSession)),
    });
    const { client, updateFn } = createMockClient();

    const result = await recordPlaySighting(client, repo, {
      gameName: "Celeste",
      now,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value).toEqual({
      action: "extended",
      gameId: "game-123",
    });
    expect(repo.touch).toHaveBeenCalledWith("sess-1", now.toISOString());
    expect(repo.insert).not.toHaveBeenCalled();
    expect(updateFn).not.toHaveBeenCalled();
  });

  it("extends an active session via variant spelling continuity scan", async () => {
    // Exact lookup returns null (or expired)
    const recentVariantSession: RecentPlayDto = {
      id: "sess-2",
      game_name: "ELDEN RING™",
      game_id: "game-elden",
      platform: "pc",
      started_at: "2026-09-11T11:30:00.000Z",
      last_seen_at: "2026-09-11T11:55:00.000Z", // 5m ago
      game: null,
    };

    const repo = createMockRepo({
      findLatestByGameName: vi.fn().mockResolvedValue(ok(null)),
      findRecent: vi.fn().mockResolvedValue(ok([recentVariantSession])),
    });
    const { client, updateFn } = createMockClient();

    // Sighted under plain "Elden Ring"
    const result = await recordPlaySighting(client, repo, {
      gameName: "Elden Ring",
      now,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value).toEqual({
      action: "extended",
      gameId: "game-elden",
    });
    expect(repo.touch).toHaveBeenCalledWith("sess-2", now.toISOString());
    expect(repo.insert).not.toHaveBeenCalled();
    expect(updateFn).not.toHaveBeenCalled();
  });

  it("starts a new session and updates last_played_at when matched to library", async () => {
    const repo = createMockRepo();
    const { client, updateFn, eqFn } = createMockClient({
      libraryGames: [
        { id: "game-hades", title: "Hades II" },
        { id: "game-hollow", title: "Hollow Knight: Silksong" },
      ],
    });

    const result = await recordPlaySighting(client, repo, {
      gameName: "Hades II",
      platform: "pc",
      now,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value).toEqual({
      action: "started",
      gameId: "game-hades",
    });

    expect(repo.insert).toHaveBeenCalledWith({
      game_name: "Hades II",
      game_id: "game-hades",
      platform: "pc",
      started_at: now.toISOString(),
      last_seen_at: now.toISOString(),
    });

    expect(updateFn).toHaveBeenCalledWith({
      last_played_at: now.toISOString(),
    });
    expect(eqFn).toHaveBeenCalledWith("id", "game-hades");
  });

  it("skips library title scan when knownGameId is provided", async () => {
    const repo = createMockRepo();
    const { client, updateFn, eqFn } = createMockClient();

    const result = await recordPlaySighting(client, repo, {
      gameName: "Metroid Prime Remastered",
      knownGameId: "game-metroid",
      platform: "switch",
      now,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value).toEqual({
      action: "started",
      gameId: "game-metroid",
    });

    expect(repo.insert).toHaveBeenCalledWith({
      game_name: "Metroid Prime Remastered",
      game_id: "game-metroid",
      platform: "switch",
      started_at: now.toISOString(),
      last_seen_at: now.toISOString(),
    });

    // Client select for library titles should not be called
    expect(client.from).toHaveBeenCalledTimes(1); // only the update query
    expect(updateFn).toHaveBeenCalledWith({
      last_played_at: now.toISOString(),
    });
    expect(eqFn).toHaveBeenCalledWith("id", "game-metroid");
  });

  it("starts a new session with null gameId for an uncataloged game", async () => {
    const repo = createMockRepo();
    const { client, updateFn } = createMockClient({
      libraryGames: [{ id: "game-zelda", title: "The Legend of Zelda" }],
    });

    const result = await recordPlaySighting(client, repo, {
      gameName: "Unregistered Indie Game",
      now,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.value).toEqual({
      action: "started",
      gameId: null,
    });

    expect(repo.insert).toHaveBeenCalledWith({
      game_name: "Unregistered Indie Game",
      game_id: null,
      platform: null,
      started_at: now.toISOString(),
      last_seen_at: now.toISOString(),
    });

    expect(updateFn).not.toHaveBeenCalled();
  });

  it("returns error when repo.findLatestByGameName fails", async () => {
    const repo = createMockRepo({
      findLatestByGameName: vi.fn().mockResolvedValue(err(new Error("Database connection lost"))),
    });
    const { client } = createMockClient();

    const result = await recordPlaySighting(client, repo, {
      gameName: "Celeste",
      now,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe("Database connection lost");
  });

  it("returns error when fetchAllGameTitles fails", async () => {
    const repo = createMockRepo();
    const { client } = createMockClient({
      selectError: { message: "Permission denied on games table" },
    });

    const result = await recordPlaySighting(client, repo, {
      gameName: "Celeste",
      now,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toContain("Permission denied");
  });
});
