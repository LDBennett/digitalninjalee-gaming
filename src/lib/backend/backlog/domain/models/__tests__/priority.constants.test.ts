import { describe, it, expect } from "vitest";
import { scoreToTier, nextTierScore, PRIORITY_TIERS } from "@/src/lib/backend/backlog/domain/models/priority.constants";

describe("scoreToTier", () => {
  it("maps 1 to low", () => expect(scoreToTier(1).id).toBe("low"));
  it("maps 25 to low", () => expect(scoreToTier(25).id).toBe("low"));
  it("maps 26 to medium", () => expect(scoreToTier(26).id).toBe("medium"));
  it("maps 50 to medium", () => expect(scoreToTier(50).id).toBe("medium"));
  it("maps 51 to high", () => expect(scoreToTier(51).id).toBe("high"));
  it("maps 75 to high", () => expect(scoreToTier(75).id).toBe("high"));
  it("maps 76 to critical", () => expect(scoreToTier(76).id).toBe("critical"));
  it("maps 100 to critical", () => expect(scoreToTier(100).id).toBe("critical"));

  it("returns the correct label", () => {
    expect(scoreToTier(13).label).toBe("Low");
    expect(scoreToTier(38).label).toBe("Medium");
    expect(scoreToTier(63).label).toBe("High");
    expect(scoreToTier(88).label).toBe("Critical");
  });
});

describe("nextTierScore", () => {
  it("advances from low to medium", () => {
    expect(nextTierScore(13)).toBe(PRIORITY_TIERS[1].score); // medium canonical score
  });

  it("advances from medium to high", () => {
    expect(nextTierScore(38)).toBe(PRIORITY_TIERS[2].score);
  });

  it("advances from high to critical", () => {
    expect(nextTierScore(63)).toBe(PRIORITY_TIERS[3].score);
  });

  it("wraps from critical back to low", () => {
    expect(nextTierScore(88)).toBe(PRIORITY_TIERS[0].score);
  });
});
