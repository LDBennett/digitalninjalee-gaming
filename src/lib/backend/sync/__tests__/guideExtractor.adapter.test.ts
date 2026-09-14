import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isOk, isErr } from "@/src/lib/backend/shared/result";
import { extractGuideRoadmap } from "../guideExtractor.adapter";

describe("guideExtractor.adapter", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.ENABLE_GUIDE_EXTRACT;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns error when ENABLE_GUIDE_EXTRACT is 'false'", async () => {
    process.env.ENABLE_GUIDE_EXTRACT = "false";
    const result = await extractGuideRoadmap(
      "https://www.powerpyx.com/elden-ring-trophy-guide-roadmap/",
    );
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Guide extraction is currently disabled");
    }
  });

  it("rejects invalid URLs", async () => {
    const result = await extractGuideRoadmap("not-a-valid-url");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Invalid guide URL provided");
    }
  });

  it("rejects non-HTTPS protocols (SSRF mitigation)", async () => {
    const result = await extractGuideRoadmap(
      "http://www.powerpyx.com/astro-bot-trophy-guide-roadmap/",
    );
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Only HTTPS URLs are permitted");
    }
  });

  it("rejects non-standard ports", async () => {
    const result = await extractGuideRoadmap(
      "https://www.powerpyx.com:8080/astro-bot-trophy-guide-roadmap/",
    );
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Non-standard ports are prohibited");
    }
  });

  it("rejects unauthorized domains (SSRF mitigation)", async () => {
    const result = await extractGuideRoadmap(
      "https://psnprofiles.com/guide/1234-game-trophy-guide",
    );
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Auto-extraction only supports PowerPyx");
    }
  });

  it("rejects direct IP addresses (SSRF mitigation)", async () => {
    const result = await extractGuideRoadmap("https://127.0.0.1/evil");
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toContain("Auto-extraction only supports PowerPyx");
    }
  });

  it("successfully parses PowerPyx roadmap HTML into structured CompletionRoadmap", async () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Astro Bot Trophy Guide & Roadmap</title></head>
        <body>
          <div class="entry-content">
            <p><strong>Roadmap:</strong></p>
            <ul>
              <li><strong>Estimated trophy difficulty</strong>: 3/10</li>
              <li><strong>Approximate amount of time to platinum</strong>: 12-15 Hours</li>
              <li><strong>Number of missable trophies</strong>: 0</li>
              <li><strong>Minimum Playthroughs</strong>: 1</li>
              <li><strong>Does difficulty affect trophies?</strong>: No difficulty settings</li>
            </ul>
          </div>
        </body>
      </html>
    `;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => sampleHtml,
    }) as unknown as typeof fetch;

    const result = await extractGuideRoadmap(
      "https://www.powerpyx.com/astro-bot-trophy-guide-roadmap/",
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.difficulty).toBe("3/10");
      expect(result.value.time_estimate).toBe("12-15 Hours");
      expect(result.value.missables).toBe(0);
      expect(result.value.playthroughs).toBe(1);
      expect(result.value.difficulty_matters).toBe(false);
      expect(result.value.source_name).toBe("PowerPyx");
      expect(result.value.guide_url).toBe(
        "https://www.powerpyx.com/astro-bot-trophy-guide-roadmap/",
      );
    }
  });

  it("decodes HTML entities like &#8211; into clean dashes in roadmap fields", async () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <ul>
            <li><strong>Estimated trophy difficulty</strong>: 4/10</li>
            <li><strong>Approximate amount of time to platinum</strong>: 50 &#8211; 75 hours</li>
            <li><strong>Number of missable trophies</strong>: 2</li>
            <li><strong>Minimum Playthroughs</strong>: 1</li>
            <li><strong>Does difficulty affect trophies?</strong>: Yes &ndash; hard mode required</li>
          </ul>
        </body>
      </html>
    `;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => sampleHtml,
    }) as unknown as typeof fetch;

    const result = await extractGuideRoadmap(
      "https://www.powerpyx.com/elden-ring-trophy-guide-roadmap/",
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.time_estimate).toBe("50 - 75 hours");
      expect(result.value.difficulty).toBe("4/10");
      expect(result.value.missables).toBe(2);
      expect(result.value.difficulty_matters).toBe(true);
    }
  });
});
