# Setup & First-Run Guide

This guide is for first-time contributors and users running AutoApply AI locally.

## First-run checklist
- [ ] Clone the repo
- [ ] Confirm Node and npm are installed
- [ ] Create `.env` from `.env.example`
- [ ] Start Docker Desktop and containers
- [ ] Push Prisma schema
- [ ] Seed demo data
- [ ] Start dev server
- [ ] Verify app on `http://localhost:3000`

> Important: **Do not upgrade dependencies before your first successful local run.**

---

## Demo-first local startup path
The app is intended to be run in demo mode first.

```bash
git clone https://github.com/waver7/AAA.git
cd AAA
npm install
cp .env.example .env
docker compose up -d
npm run db:push
npm run seed
npm run dev
```

PowerShell env copy equivalent:
```powershell
Copy-Item .env.example .env
```

---

## Windows-specific setup
Verified environment example:
- Node `v24.14.0`
- npm `11.9.0`

### 1) Verify Node/npm
```powershell
node -v
npm -v
```

### 2) Fix PowerShell npm script execution block (if needed)
Symptom:
`npm.ps1 cannot be loaded because running scripts is disabled on this system`

Fix:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
Get-ExecutionPolicy -List
```

### 3) Docker Desktop + WSL
If `docker` is not recognized or Docker Desktop does not start, update WSL and restart Docker Desktop:

```powershell
wsl --update
```

### 4) Full verified Windows command flow
```powershell
git clone https://github.com/waver7/AAA.git
cd AAA
npm install
Copy-Item .env.example .env
docker compose up -d
npm run db:push
npm run seed
npm run dev
```

App URL:
`http://localhost:3000`

---

## Notes
- Docker is required for the default local PostgreSQL/Redis setup.
- Browser automation (Playwright) is optional.
- Generic careers adapter is still planned (Greenhouse + Lever are current MVP adapters).
- If you see a Docker Compose warning like `version is obsolete`, it is non-blocking for local startup.
- Prisma update notices are informational; defer upgrades until after first successful run.
