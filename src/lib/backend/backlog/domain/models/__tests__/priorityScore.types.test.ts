import { describe, it, expect } from "vitest";
import {
  createPriorityScore,
  adjustPriorityScore,
} from "../priorityScore.types";

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
