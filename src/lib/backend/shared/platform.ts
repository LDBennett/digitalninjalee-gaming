import { Result, ok, err } from "@/src/lib/backend/shared/result";

export const PLATFORMS = [
  "pc",
  "xbox",
  "playstation",
  "switch",
  "other",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  pc: "PC",
  xbox: "Xbox",
  playstation: "PlayStation",
  switch: "Switch",
  other: "Other",
};

export function createPlatform(value: string): Result<Platform, string> {
  if (!PLATFORMS.includes(value as Platform)) {
    return err(
      `Invalid platform: "${value}". Must be one of: ${PLATFORMS.join(", ")}`,
    );
  }
  return ok(value as Platform);
}
