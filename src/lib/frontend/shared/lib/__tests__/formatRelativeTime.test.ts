import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "../formatRelativeTime";

const NOW = new Date("2026-07-11T12:00:00Z");

function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

describe("formatRelativeTime", () => {
  it("returns 'just now' under a minute", () => {
    expect(formatRelativeTime(ago(30 * 1000), NOW)).toBe("just now");
  });

  it("returns minutes under an hour", () => {
    expect(formatRelativeTime(ago(34 * MINUTE), NOW)).toBe("34m ago");
  });

  it("returns hours under a day", () => {
    expect(formatRelativeTime(ago(2 * HOUR), NOW)).toBe("2h ago");
  });

  it("returns days under a week", () => {
    expect(formatRelativeTime(ago(3 * DAY), NOW)).toBe("3d ago");
  });

  it("returns weeks under ~8 weeks", () => {
    expect(formatRelativeTime(ago(2 * WEEK), NOW)).toBe("2w ago");
  });

  it("falls back to a short date beyond 8 weeks", () => {
    const result = formatRelativeTime(ago(10 * WEEK), NOW);
    expect(result).not.toMatch(/ago$/);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns empty string for invalid input", () => {
    expect(formatRelativeTime("garbage", NOW)).toBe("");
  });
});
