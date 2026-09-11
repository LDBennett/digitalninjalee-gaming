import { describe, it, expect } from "vitest";
import {
  createGameStatus,
  canTransitionTo,
  isWishlistStatus,
  VALID_TRANSITIONS,
  GAME_STATUSES,
} from "../gameStatus.types";

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
  it("allows backlog → playing", () =>
    expect(canTransitionTo("backlog", "playing")).toBe(true));
  it("allows playing → completed", () =>
    expect(canTransitionTo("playing", "completed")).toBe(true));
  it("blocks completed → backlog", () =>
    expect(canTransitionTo("completed", "backlog")).toBe(false));
  it("blocks completed → playing", () =>
    expect(canTransitionTo("completed", "playing")).toBe(false));
  it("allows dropped → backlog", () =>
    expect(canTransitionTo("dropped", "backlog")).toBe(true));
  it("allows main-complete → playing", () =>
    expect(canTransitionTo("main-complete", "playing")).toBe(true));

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
