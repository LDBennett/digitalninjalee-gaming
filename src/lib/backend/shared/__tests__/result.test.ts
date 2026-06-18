import { describe, it, expect } from "vitest";
import { ok, err, isOk, isErr } from "@/src/lib/backend/shared/result";

describe("ok", () => {
  it("creates a success result with the given value", () => {
    const r = ok(42);
    expect(r.success).toBe(true);
    if (r.success) expect(r.value).toBe(42);
  });

  it("works with non-primitive values", () => {
    const r = ok({ id: "abc" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.value).toEqual({ id: "abc" });
  });
});

describe("err", () => {
  it("creates a failure result with the given error", () => {
    const r = err("something went wrong");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toBe("something went wrong");
  });

  it("works with Error objects", () => {
    const e = new Error("boom");
    const r = err(e);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toBe(e);
  });
});

describe("isOk", () => {
  it("returns true for an ok result", () => expect(isOk(ok(1))).toBe(true));
  it("returns false for an err result", () => expect(isOk(err("e"))).toBe(false));
});

describe("isErr", () => {
  it("returns true for an err result", () => expect(isErr(err("e"))).toBe(true));
  it("returns false for an ok result", () => expect(isErr(ok(1))).toBe(false));
});
