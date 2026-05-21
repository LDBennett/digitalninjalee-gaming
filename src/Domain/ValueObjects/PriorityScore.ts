import { Result, ok, err } from '@/lib/result';

export type PriorityScore = number & { readonly _brand: 'PriorityScore' };

export const DEFAULT_PRIORITY_SCORE = 50 as PriorityScore;

export function createPriorityScore(value: number): Result<PriorityScore, string> {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    return err(`PriorityScore must be an integer between 1 and 100, got: ${value}`);
  }
  return ok(value as PriorityScore);
}

export function adjustPriorityScore(score: PriorityScore, delta: number): PriorityScore {
  return Math.min(100, Math.max(1, score + delta)) as PriorityScore;
}
