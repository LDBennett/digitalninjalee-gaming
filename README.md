# DigitalNinjaLee — Gaming Backlog & Picker

> A personal gaming companion app to manage my backlog, track play status, and pick a game to play by "mood". Built with Next.js and Supabase. I know the pattern is overkill for the simplicity of the app, but I wanted experience using the Next.js.

## Tech Stack

- Frontend: React 19 + Next.js (App Router)
- Styling: Tailwind CSS
- Backend: Node.js + Next.js API routes
- Database & Auth: Supabase (Postgres)
- Package manager: `pnpm`

## Quick Start

Prerequisites:

- Node.js 18+ (or the Node version compatible with Next.js in this repo)
- `pnpm` installed globally

Install and run in development:

```bash
pnpm install
pnpm run dev
```

Build for production:

```bash
pnpm run build
pnpm run start
```

Lint:

```bash
pnpm run lint
```

Test note: This repo WILL use Vitest/Jest in parts — see `package.json` and `src/`

## Environment

Copy the example env and fill values:

```bash
cp .env.local.example .env.local
```

This project expects the following environment variables (from `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Set these from your Supabase project's Settings → API.

## Project Structure & Architecture

This repository follows a Domain-Driven Design (DDD) style and a layered architecture:

- `app/` — Next.js App Router pages, layouts, and API routes (framework/runtime layer). Example: `app/api/games/random/route.ts` handles HTTP requests.
- `src/Application/` — Application layer: use-cases, DTOs, and orchestration (framework-agnostic). Example: `src/Application/UseCases/ListGames.ts`.
- `src/Domain/` — Domain layer: immutable models, value objects, and pure business rules.
- `src/Infrastructure/` — Implementations: Supabase client and repository mappers.
- `src/Presentation/` — UI components, hooks, and controllers used by `app/`.

Typical request flow:

`app` (API route / UI) → Presentation controller/hook → `src/Application` use-case → `src/Domain` rules → `src/Infrastructure` persistence

## Development Notes

- The codebase keeps domain logic separated from framework code; prefer adding business rules in `src/Domain` as pure functions.

## Useful Files

- `.env.local.example` — example environment variables
- `package.json` — scripts: `dev`, `build`, `start`, `lint`
- `supabase/migrations/` — SQL migrations for the Postgres schema

## License

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
