# Contributing

Thanks for helping improve AutoApply AI.

## Fast local setup
1. `cp .env.example .env`
2. `docker compose up -d`
3. `npm install`
4. `npm run demo`
5. `npm run dev`

## Scripts
- `npm run dev` — start local app
- `npm run db:push` — sync Prisma schema to DB
- `npm run seed` — seed demo data
- `npm run demo` — prisma generate + db push + seed
- `npm run lint` — lint checks
- `npm run test` — unit tests
- `npm run test:e2e` — optional Playwright e2e tests (no-op if dependency missing)

## Development guidelines
- Use strict TypeScript.
- Keep modules small and composable.
- Add tests for changed scoring/parsing/env behavior.
- Keep automation human-in-the-loop and never bypass final approval.

## Pull requests
- Keep PRs focused.
- Include screenshots for visual UI changes when possible.
- Update docs when behavior or setup changes.
