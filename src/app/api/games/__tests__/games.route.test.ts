import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import { PUT } from "../[id]/route";
import { ok } from "@/src/lib/backend/shared/result";
import type { GameState } from "@/src/lib/backend/backlog/domain/models";

const { mockSave, mockUpdate, mockFindById, mockFindByIds, mockUpsert } =
  vi.hoisted(() => ({
    mockSave: vi.fn(),
    mockUpdate: vi.fn(),
    mockFindById: vi.fn(),
    mockFindByIds: vi.fn(),
    mockUpsert: vi.fn().mockResolvedValue({ error: null }),
  }));

vi.mock("@/src/lib/backend/backlog/infrastructure", () => ({
  requireAuth: vi.fn().mockResolvedValue({
    ok: true,
    client: {
      from: vi.fn().mockReturnValue({
        upsert: mockUpsert,
      }),
    },
  }),
  optionalAuth: vi.fn().mockResolvedValue({
    ok: true,
    client: {},
  }),
  createSupabaseGameRepository: vi.fn(() => ({
    save: mockSave,
    update: mockUpdate,
    findById: mockFindById,
    findAll: vi.fn(),
  })),
  createSupabaseMoodRepository: vi.fn(() => ({
    findByIds: mockFindByIds,
  })),
}));

describe("Games Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(ok(undefined));
    mockUpdate.mockResolvedValue(ok(undefined));
    mockFindByIds.mockResolvedValue(ok([]));
  });

  const sampleTimeToBeat = {
    schema_version: 1 as const,
    main: 15.5,
    extra: 25,
    completionist: 60,
    source: "hltb" as const,
    hltb_id: 12345,
    url: "https://howlongtobeat.com/game/12345",
  };

  const sampleRoadmap = {
    schema_version: 1 as const,
    difficulty: "4/10",
    time_estimate: "40-50h",
    playthroughs: 2,
    missables: 3,
    difficulty_matters: true,
    guide_url: "https://psnprofiles.com/guide/123-guide",
    source_name: "PSNProfiles",
  };

  describe("POST /api/games", () => {
    it("persists time_to_beat and completion_roadmap", async () => {
      const payload = {
        title: "Metroid Prime",
        platform: "switch",
        status: "backlog",
        time_to_beat: sampleTimeToBeat,
        completion_roadmap: sampleRoadmap,
      };

      const req = new NextRequest("http://localhost:3000/api/games", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.title).toBe("Metroid Prime");
      expect(json.time_to_beat).toEqual(sampleTimeToBeat);
      expect(json.completion_roadmap).toEqual(sampleRoadmap);

      expect(mockSave).toHaveBeenCalledTimes(1);
      const savedGame: GameState = mockSave.mock.calls[0][0];
      expect(savedGame.timeToBeat).toEqual(sampleTimeToBeat);
      expect(savedGame.completionRoadmap).toEqual(sampleRoadmap);
    });
  });

  describe("PUT /api/games/[id]", () => {
    it("updates time_to_beat and completion_roadmap", async () => {
      const existingGame: GameState = {
        id: "game-1",
        title: "Metroid Prime",
        platform: "switch",
        status: "backlog",
        priorityScore: 50 as never,
        backgroundUrl: null,
        coverArtUrl: null,
        gameDescription: null,
        lastPlayedAt: null,
        createdAt: new Date(),
        moods: [],
        replayStatus: null,
        personalNote: null,
        rating: null,
        playGoals: [],
        timeToBeat: null,
        completionRoadmap: null,
      };

      mockFindById.mockResolvedValue(ok(existingGame));

      const payload = {
        time_to_beat: sampleTimeToBeat,
        completion_roadmap: sampleRoadmap,
      };

      const req = new NextRequest("http://localhost:3000/api/games/game-1", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const res = await PUT(req, {
        params: Promise.resolve({ id: "game-1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.time_to_beat).toEqual(sampleTimeToBeat);
      expect(json.completion_roadmap).toEqual(sampleRoadmap);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const updatedGame: GameState = mockUpdate.mock.calls[0][0];
      expect(updatedGame.timeToBeat).toEqual(sampleTimeToBeat);
      expect(updatedGame.completionRoadmap).toEqual(sampleRoadmap);
    });
  });
});
