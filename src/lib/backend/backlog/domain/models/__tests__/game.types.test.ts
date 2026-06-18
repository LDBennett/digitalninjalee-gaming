import { describe, it, expect } from "vitest";
import {
  createPlatform,
  createPriorityScore,
  adjustPriorityScore,
  createGameStatus,
  canTransitionTo,
  isWishlistStatus,
  VALID_TRANSITIONS,
  GAME_STATUSES,
  PLATFORMS,
} from "@/src/lib/backend/backlog/domain/models/game.types";

describe("createPlatform", () => {
  it.each(PLATFORMS)("accepts valid platform '%s'", (p) => {
    const r = createPlatform(p);
    expect(r.success).toBe(true);
    if (r.success) expect(r.value).toBe(p);
  });

  it("rejects an unknown platform", () => {
    const r = createPlatform("stadia");
    expect(r.success).toBe(false);
  });
});

describe("createPriorityScore", () => {
  it.each([1, 50, 100])("accepts valid score %i", (n) => {
    const r = createPriorityScore(n);
    expect(r.success).toBe(true);
    if (r.success) expect(r.value).toBe(n);
  });

  it("rejects 0", () => expect(createPriorityScore(0).success).toBe(false));
  it("rejects 101", () => expect(createPriorityScore(101).success).toBe(false));
  it("rejects non-integer", () => expect(createPriorityScore(1.5).success).toBe(false));
});

describe("adjustPriorityScore", () => {
  it("increases within bounds", () => {
    expect(adjustPriorityScore(50 as never, 10)).toBe(60);
  });

  it("clamps at 100", () => {
    expect(adjustPriorityScore(95 as never, 20)).toBe(100);
  });

  it("clamps at 1", () => {
    expect(adjustPriorityScore(5 as never, -20)).toBe(1);
  });
});

describe("createGameStatus", () => {
  it.each(GAME_STATUSES)("accepts valid status '%s'", (s) => {
    const r = createGameStatus(s);
    expect(r.success).toBe(true);
    if (r.success) expect(r.value).toBe(s);
  });

  it("rejects an unknown status", () => {
    expect(createGameStatus("archived").success).toBe(false);
  });
});

describe("canTransitionTo", () => {
  it("allows backlog → playing", () => expect(canTransitionTo("backlog", "playing")).toBe(true));
  it("allows playing → completed", () => expect(canTransitionTo("playing", "completed")).toBe(true));
  it("blocks completed → backlog", () => expect(canTransitionTo("completed", "backlog")).toBe(false));
  it("blocks completed → playing", () => expect(canTransitionTo("completed", "playing")).toBe(false));
  it("allows dropped → backlog", () => expect(canTransitionTo("dropped", "backlog")).toBe(true));
  it("allows main-complete → playing", () => expect(canTransitionTo("main-complete", "playing")).toBe(true));

  it("all declared transitions are actually allowed", () => {
    for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of targets) {
        expect(canTransitionTo(from as never, to as never)).toBe(true);
      }
    }
  });
});

describe("isWishlistStatus", () => {
  it.each(["interested", "pre-ordered", "keep-an-eye-on"] as const)(
    "returns true for wishlist status '%s'",
    (s) => expect(isWishlistStatus(s)).toBe(true),
  );

  it.each(["backlog", "playing", "completed", "dropped"] as const)(
    "returns false for non-wishlist status '%s'",
    (s) => expect(isWishlistStatus(s)).toBe(false),
  );
});
