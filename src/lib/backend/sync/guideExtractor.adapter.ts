import { Result, ok, err } from "@/src/lib/backend/shared/result";
import { CompletionRoadmap } from "@/src/lib/backend/backlog/domain/models/game.types";

const ALLOWED_HOSTS = new Set(["powerpyx.com", "www.powerpyx.com"]);

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => {
      const num = Number(code);
      if (isNaN(num)) return _;
      if (num === 8211 || num === 8212) return "-";
      return String.fromCodePoint(num);
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
      const num = parseInt(code, 16);
      if (isNaN(num)) return _;
      if (num === 0x2013 || num === 0x2014) return "-";
      return String.fromCodePoint(num);
    })
    .replace(/&(ndash|mdash);/gi, "-")
    .replace(/&(lsquo|rsquo);/gi, "'")
    .replace(/&(ldquo|rdquo);/gi, '"')
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&(apos|#039);/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function sanitizeText(input: string | null | undefined, maxLen = 60): string | null {
  if (!input) return null;
  const decoded = decodeHtmlEntities(input);
  const cleaned = decoded
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen).trim() : cleaned;
}

/**
 * SSRF-hardened guide extractor for PowerPyx trophy & achievement roadmaps.
 */
export async function extractGuideRoadmap(
  rawUrl: string,
): Promise<Result<CompletionRoadmap, Error>> {
  if (process.env.ENABLE_GUIDE_EXTRACT === "false") {
    return err(new Error("Guide extraction is currently disabled"));
  }

  // 1. Strict URL validation (SSRF Protection)
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch {
    return err(new Error("Invalid guide URL provided"));
  }

  if (parsedUrl.protocol !== "https:") {
    return err(new Error("Only HTTPS URLs are permitted"));
  }

  if (parsedUrl.port && parsedUrl.port !== "443") {
    return err(new Error("Non-standard ports are prohibited"));
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(hostname)) {
    return err(
      new Error(
        `Auto-extraction only supports PowerPyx. For ${hostname}, paste the link and enter stats manually.`,
      ),
    );
  }

  // Prevent IP addresses in hostname
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.includes(":")) {
    return err(new Error("Direct IP addressing is prohibited"));
  }

  try {
    // 2. Fetch page HTML with strict timeout
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return err(new Error(`Failed to fetch guide page: ${response.status}`));
    }

    const html = await response.text();
    // Cap parsing scope to first 1MB to prevent regex DoS on bloated pages
    const truncatedHtml = html.slice(0, 1024 * 1024);

    // 3. Extract standardized roadmap summary fields
    const diffMatch = truncatedHtml.match(
      /Estimated (?:trophy|achievement) difficulty[^0-9]*?(\d+(?:\.\d+)?\/10)/i,
    );
    const timeMatch = truncatedHtml.match(
      /Approximate amount of time to (?:platinum|100%)[^:]*:(?:<[^>]*>|\s)*([^<\n\r]+)/i,
    );
    const missableMatch = truncatedHtml.match(
      /Number of missable trophies[^:]*:(?:<[^>]*>|\s)*([^<\n\r]+)/i,
    );
    const runsMatch = truncatedHtml.match(
      /Minimum Playthroughs[^0-9]*?(\d+)/i,
    );
    const diffAffectsMatch = truncatedHtml.match(
      /Does difficulty affect trophies\??[^:]*:(?:<[^>]*>|\s)*([^<\n\r]+)/i,
    );

    const difficulty = diffMatch ? sanitizeText(diffMatch[1], 10) : null;
    const timeEstimate = timeMatch ? sanitizeText(timeMatch[1], 40) : null;
    const missablesText = missableMatch ? sanitizeText(missableMatch[1], 10) : null;
    const missables = missablesText && /^\d+$/.test(missablesText) ? parseInt(missablesText, 10) : null;
    const playthroughs = runsMatch ? parseInt(runsMatch[1], 10) : null;

    const diffAffectsText = diffAffectsMatch ? sanitizeText(diffAffectsMatch[1]) : "";
    const difficultyMatters = diffAffectsText
      ? /^yes/i.test(diffAffectsText)
      : undefined;

    const roadmap: CompletionRoadmap = {
      schema_version: 1,
      difficulty,
      time_estimate: timeEstimate,
      playthroughs: isNaN(playthroughs as number) ? null : playthroughs,
      missables: missables === null || isNaN(missables) ? 0 : missables,
      difficulty_matters: difficultyMatters,
      guide_url: parsedUrl.toString(),
      source_name: "PowerPyx",
      updated_at: new Date().toISOString(),
    };

    return ok(roadmap);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}
