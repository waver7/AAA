# Contributing

Thanks for helping improve AutoApply AI.

## Fast local setup
1. `git clone https://github.com/waver7/AAA.git`
2. `cd AAA`
3. `npm install`
4. Create env file:
   - macOS/Linux: `cp .env.example .env`
   - PowerShell: `Copy-Item .env.example .env`
5. `docker compose up -d`
6. `npm run demo`
7. `npm run dev`

For full first-run guidance (including Windows issues and fixes), read [`docs/SETUP.md`](docs/SETUP.md).

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
- Do not upgrade dependencies before first successful local run on your machine.

## Pull requests
- Keep PRs focused.
- Include screenshots for visual UI changes when possible.
- Update docs when behavior or setup changes.
