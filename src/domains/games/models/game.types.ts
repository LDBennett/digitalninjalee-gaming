import { Result, ok, err } from '@/src/domains/shared/result';
import { MoodState, MoodDto } from '@/src/domains/games/models/mood.types';

// ── Platform ─────────────────────────────────────────────────────────────────

export const PLATFORMS = ['pc', 'xbox', 'playstation', 'switch', 'other'] as const;
export type Platform = typeof PLATFORMS[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  pc:          'PC',
  xbox:        'Xbox',
  playstation: 'PlayStation',
  switch:      'Switch',
  other:       'Other',
};

export function createPlatform(value: string): Result<Platform, string> {
  if (!PLATFORMS.includes(value as Platform)) {
    return err(`Invalid platform: "${value}". Must be one of: ${PLATFORMS.join(', ')}`);
  }
  return ok(value as Platform);
}

// ── PriorityScore ─────────────────────────────────────────────────────────────

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

// ── GameStatus ────────────────────────────────────────────────────────────────

export const GAME_STATUSES = [
  'backlog',
  'playing',
  'completed',
  'dropped',
  'main-complete',
  'ongoing',
  'interested',
  'pre-ordered',
  'keep-an-eye-on',
] as const;

export type GameStatus = typeof GAME_STATUSES[number];

export const WISHLIST_STATUSES: ReadonlyArray<GameStatus> = [
  'interested',
  'pre-ordered',
  'keep-an-eye-on',
];

export const LIBRARY_STATUSES: ReadonlyArray<GameStatus> = [
  'backlog',
  'playing',
  'completed',
  'main-complete',
  'ongoing',
  'dropped',
];

export const STATUS_LABELS: Record<GameStatus, string> = {
  'backlog':        'Backlog',
  'playing':        'Playing',
  'completed':      '100% Completed',
  'dropped':        'Dropped',
  'main-complete':  'Complete',
  'ongoing':        'Ongoing',
  'interested':     'Interested',
  'pre-ordered':    'Pre-Ordered',
  'keep-an-eye-on': 'Keep an Eye On',
};

export const VALID_TRANSITIONS: Readonly<Record<GameStatus, ReadonlyArray<GameStatus>>> = {
  'backlog':        ['playing', 'dropped'],
  'playing':        ['completed', 'main-complete', 'ongoing', 'backlog', 'dropped'],
  'completed':      [],
  'dropped':        ['backlog'],
  'main-complete':  ['playing', 'ongoing', 'completed'],
  'ongoing':        ['completed', 'dropped'],
  'interested':     ['backlog', 'pre-ordered', 'keep-an-eye-on'],
  'pre-ordered':    ['backlog', 'interested', 'keep-an-eye-on'],
  'keep-an-eye-on': ['interested', 'pre-ordered'],
};

export type ReplayStatus = 'want-to-replay' | 'replaying' | null;

export function createGameStatus(value: string): Result<GameStatus, string> {
  if (!GAME_STATUSES.includes(value as GameStatus)) {
    return err(`Invalid status: "${value}". Must be one of: ${GAME_STATUSES.join(', ')}`);
  }
  return ok(value as GameStatus);
}

export function canTransitionTo(from: GameStatus, to: GameStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function isWishlistStatus(status: GameStatus): boolean {
  return (WISHLIST_STATUSES as ReadonlyArray<string>).includes(status);
}

// ── Domain Model ──────────────────────────────────────────────────────────────

export interface GameState {
  readonly id: string;
  readonly title: string;
  readonly externalId: string | null;
  readonly platform: Platform;
  readonly status: GameStatus;
  readonly priorityScore: PriorityScore;
  readonly coverUrl: string | null;
  readonly coverArtUrl: string | null;
  readonly gameDescription: string | null;
  readonly lastPlayedAt: Date | null;
  readonly createdAt: Date;
  readonly moods: ReadonlyArray<MoodState>;
  readonly replayStatus: ReplayStatus;
  readonly personalNote: string | null;
  readonly rating: number | null;
}

// ── DTO (serialized shape returned by API) ────────────────────────────────────

export interface GameDto {
  id: string;
  title: string;
  external_id: string | null;
  platform: Platform;
  status: GameStatus;
  priority_score: number;
  cover_url: string | null;
  cover_art_url: string | null;
  game_description: string | null;
  last_played_at: string | null;
  created_at: string;
  moods: MoodDto[];
  replay_status: ReplayStatus;
  personal_note: string | null;
  rating: number | null;
}

export function gameStateToDto(game: GameState): GameDto {
  return {
    id: game.id,
    title: game.title,
    external_id: game.externalId,
    platform: game.platform,
    status: game.status,
    priority_score: game.priorityScore,
    cover_url: game.coverUrl,
    cover_art_url: game.coverArtUrl,
    game_description: game.gameDescription,
    last_played_at: game.lastPlayedAt?.toISOString() ?? null,
    created_at: game.createdAt.toISOString(),
    moods: game.moods.map((m) => ({ id: m.id, name: m.name })),
    replay_status: game.replayStatus,
    personal_note: game.personalNote,
    rating: game.rating,
  };
}
