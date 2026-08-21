import { describe, it, expect } from "vitest";
import { createPlatform, PLATFORMS } from "@/src/lib/backend/shared/platform";

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
