import { Result, ok, err } from '@/lib/result';

export const PLATFORMS = ['pc', 'xbox', 'playstation', 'switch', 'other'] as const;
export type Platform = typeof PLATFORMS[number];

export function createPlatform(value: string): Result<Platform, string> {
  if (!PLATFORMS.includes(value as Platform)) {
    return err(`Invalid platform: "${value}". Must be one of: ${PLATFORMS.join(', ')}`);
  }
  return ok(value as Platform);
}
