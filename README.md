# DigitalNinjaLee — Gaming Backlog Companion

> A personal gaming companion app to manage my backlog, track play status, and pick a game to play by "mood". Built with Next.js and Supabase. The architecture and Next.js may be overkill for the app's scope but I wanted the experience with the patterns working with them.

## Tech Stack

- **Frontend:** React 19 + Next.js 15 (App Router), TanStack Query 5, Zustand, Framer Motion, Lucide React
- **Styling:** Tailwind CSS 4
- **Backend:** Next.js API routes (Node.js runtime)
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **External APIs:** RAWG, IGDB (via Twitch OAuth)
- **Package manager:** `pnpm`

## Quick Start

Prerequisites: Node.js 18+, `pnpm` installed globally.

```bash
pnpm install
pnpm run dev
```

Build for production:

```bash
pnpm run build
pnpm run start
```

Other scripts:

```bash
pnpm run lint   # ESLint
pnpm test       # Vitest / Jest
```

## Environment Variables

Copy the example env and fill in values from your Supabase project (Settings → API):

```bash
cp .env.local.example .env.local
```

| Variable                               | Description                    |
| -------------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key              |
| `SUPABASE_SERVICE_ROLE_KEY`            | Service role key (server-only) |
| `RAWG_API_KEY`                         | RAWG API key                   |
| `IGDB_CLIENT_ID`                       | Twitch / IGDB client ID        |
| `IGDB_CLIENT_SECRET`                   | Twitch / IGDB client secret    |

## Pages & Routes

| Route       | Description                                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| `/`         | Dashboard — stats, top-priority backlog, recently played, add game & random picker |
| `/backlog`  | Backlog — filter by mood/platform/status, sort by priority, paginated              |
| `/playing`  | Currently playing & ongoing games                                                  |
| `/library`  | Completed games — tabs: All / Completed / Main-Complete / Ongoing / Dropped        |
| `/wishlist` | Wishlist — tabs: All / Interested / Pre-Ordered / Keep-an-Eye-On                   |

### API Routes

| Endpoint            | Methods          | Description                                       |
| ------------------- | ---------------- | ------------------------------------------------- |
| `/api/games`        | GET, POST        | List games (filtered by status) or add a new game |
| `/api/games/[id]`   | GET, PUT, DELETE | Single game operations                            |
| `/api/games/random` | GET              | Random game, optionally filtered by mood          |
| `/api/games/stats`  | GET              | Counts by status                                  |
| `/api/moods`        | GET              | All available moods                               |
| `/api/rawg`         | GET              | Search RAWG for game metadata                     |
| `/api/igdb`         | GET              | Search / fetch game detail from IGDB              |

## Features

**Game management** — Add, edit, delete games. Games include title, platform, status, priority (1–100), moods, cover art, personal notes, star rating (0–5), and last-played date (not really using this, but it's there for later if I can integrate with online options to update this on a CRON job or something).

**Status transitions** — Backlog → Playing → Completed, plus wishlist statuses (Interested, Pre-Ordered, Keep-an-Eye-On) with replay flags (want-to-replay, replaying).

**Mood tagging** — Tag games with moods (Action, RPG, Chill, Co-op...). Obviously, these are tailored to me specifically and are definitely not generalized. Automatically suggested from RAWG genres/tags and IGDB genres/themes/game-modes when enriching with commands.

**Game enrichment** — Search RAWG for metadata (background image, description, genres, tags), cross-reference IGDB for cover art, summary, and additional genre/theme/game-mode data. External IDs stored per game.

**Random picker** — Carousel animation rolls through candidates before landing on a result. Filter the pool by Backlog or Currently Playing, and optionally narrow by one or more moods.

**Filtering & search** — Title search, mood filter, platform filter, status filter, sort by priority or date added. Client-side pagination throughout.

**Authentication** — Supabase email/password auth. Protected API routes via `requireAuth()`. Public/anonymous browsing supported via `optionalAuth()` and Supabase RLS.

## Architecture

This project uses **Domain-Driven Design (DDD)** on the backend and **Feature-Sliced Design (FSD)** on the frontend.

```
src/
├── lib/
│   ├── infrastructure/         # Supabase client factory (browser, server, service role)
│   ├── backend/                # DDD backend
│   │   ├── backlog/
│   │   │   ├── domain/         # Pure business rules — no framework deps
│   │   │   │   ├── models/     # Entity types, status enums, mood types
│   │   │   │   └── services/   # Pure functions (newGame, transitionGame, selectRandomGame, …)
│   │   │   ├── repository/     # TypeScript function-signature contracts
│   │   │   └── infrastructure/ # Supabase implementations of the repository contracts
│   │   ├── sync/               # External API adapters (RAWG, IGDB) + mood-mapping engines
│   │   └── shared/             # Result<T, E> discriminated union for error handling
│   └── frontend/               # FSD frontend
│       ├── shared/             # Reusable primitives: UI kit, auth store, hooks, fetch helpers
│       ├── entities/           # Business model display: GameCard, MoodBadge, PlatformBadge, …
│       ├── features/           # User actions: add-game, game-actions, game-filters, roll-random
│       ├── widgets/            # Composite blocks: Navigation, page-specific view widgets
│       └── pages/              # Full-page compositions (1:1 with routes), each with a hook + view
└── app/                        # Next.js App Router — pages, layouts, API routes
```

- NOTE: Both of these design systems just make sense in my head for me

### Key design rules

- **Domain layer purity** — files inside `backend/*/domain/` have zero dependencies on Supabase or Express primitives. Same inputs always produce the same output.
- **FSD layer hierarchy** — each layer can only import from layers below it, never sideways or upward:
  ```
        pages          ← can import from everything below
       widgets         ← can import from features and below
      features         ← can import from entities and below
      entities         ← can import from shared only
       shared          ← imports nothing (receives all data as props)
  ```
- **Encapsulation via `index.ts`** — every slice exposes a public API; internal files are never imported by path.
- **Repository pattern** — database access is a typed function signature defined in the domain layer and implemented in the infrastructure layer.

### Request flow

```
app/ route → page hook (TanStack Query) → API route → domain service → repository → Supabase
```

## Database

Supabase-managed PostgreSQL. Schema migrations live in `supabase/migrations/`.

Core tables: `games`, `moods`, `game_moods` (junction), `game_external_ids`.

## License

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
