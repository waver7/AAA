# 🌟 AutoApply AI

**Open-source AI job application assistant that helps engineers focus on high-fit roles and apply faster — with full human control.**

AutoApply AI ingests jobs, explains fit scores, drafts tailored outreach/resume summaries, and prepares browser autofill while always pausing before final submission.

---

## 🎬 Animated demo (placeholder)
```md
![AutoApply AI Demo](docs/demo.gif)
```

---

## Why people star this project
- **Explainable fit scoring** instead of black-box ranking
- **Screenshot-worthy “Why you match” panel** on job detail
- **Demo mode out of the box** (works without OpenAI key)
- **Optional Playwright automation** (core app runs without it)
- **Human-in-the-loop by design** for submission safety

---

## ✨ Key features (MVP)
- Resume upload + structured PDF parsing with editable onboarding flow
- Real job ingestion from Greenhouse + Lever board URLs
- AI fit scoring with matching skills, missing skills, concerns, and mismatch notes
- Recruiter outreach message generation
- Tailored resume summary generation
- Applications dashboard with status pipeline
- Playwright autofill preparation flow (pauses before final submit)

---

## 🧱 Architecture overview
- **Frontend:** Next.js App Router + Tailwind
- **Backend:** Next.js Route Handlers (TypeScript)
- **Data:** PostgreSQL + Prisma
- **AI:** OpenAI-compatible provider with demo fallback mode
- **Automation:** Playwright (optional dependency)
- **Validation:** Zod

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## ⚡ Quickstart (under 5 minutes)
> Docker is required for the default local PostgreSQL + Redis setup.

### macOS/Linux
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

### Windows (PowerShell)
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

Open `http://localhost:3000`.

Then follow the main flow:
1. Upload your resume on `/onboarding`
2. Review and save parsed profile fields
3. Ingest a real Greenhouse or Lever board on `/jobs`
4. Prepare applications and track them on `/applications`

> First run should be done in **demo mode** (default) before changing dependencies or infra settings.

---

## 🪟 Windows setup (verified flow)
The following flow has been validated on Windows using:
- Node `v24.14.0`
- npm `11.9.0`

### 1) Verify Node/npm
```powershell
node -v
npm -v
```

### 2) If npm fails in PowerShell with execution policy error
You may see:
`npm.ps1 cannot be loaded because running scripts is disabled on this system`

Fix:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
Get-ExecutionPolicy -List
```

### 3) Docker Desktop + WSL note
If Docker is unavailable (`docker is not recognized`) or Docker Desktop fails to start, update WSL:
```powershell
wsl --update
```
Then restart Docker Desktop and try again.

### 4) Full successful Windows setup path
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

App URL: `http://localhost:3000`

For deeper setup details: [`docs/SETUP.md`](docs/SETUP.md).

---

## 🧪 Demo mode (recommended first run)
Demo mode lets you run without API keys and still generate sample outputs.

```bash
docker compose up -d
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
npm install
npm run demo
npm run dev
```

This will:
- generate Prisma client
- push schema
- seed realistic demo user/profile/jobs/fit scores/applications/messages

---

## 🤖 Browser automation is optional
If `playwright` is unavailable in your environment, core functionality still works.

- Install optional automation deps later:
  ```bash
  npm i playwright @playwright/test
  ```
- Enable automation in env:
  ```env
  ENABLE_AUTOMATION="true"
  ```
- Automation route returns a clear message when optional deps are missing.

---

## 🖼️ Screenshots (placeholders)
- `docs/screenshots/dashboard.png`
- `docs/screenshots/why-you-match.png`
- `docs/screenshots/pipeline.png`

---

## 🔌 Supported job sources
- ✅ Greenhouse
- ✅ Lever
- ⏳ Generic careers pages (planned adapter)

---

## 🗺️ Roadmap
See [`ROADMAP.md`](ROADMAP.md).

---

## 🤝 Contributing
See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## ⚠️ Safety and responsible use
- Respect target websites’ Terms of Service and robots rules.
- Keep unsupported adapters disabled.
- **Never auto-submit without explicit user action.**
- This MVP intentionally blocks autonomous final submission.

---

## 🛠️ Troubleshooting

### 1) PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled`
Even with Node/npm installed correctly, npm can fail in PowerShell due to execution policy.

Fix:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
Get-ExecutionPolicy -List
```

### 2) `npm install` ENOENT / `package.json` not found
You are likely not in the repo root. Make sure you run:
```bash
cd AAA
```
then run npm commands.

### 3) `docker` not recognized
Docker Desktop may not be installed, not running, or not available on PATH.
Install/open Docker Desktop, then retry.

### 4) Docker Desktop cannot start
Try:
- opening Docker Desktop manually
- restarting your PC
- updating WSL:
  ```powershell
  wsl --update
  ```

### 5) Compose warning: `version is obsolete`
This warning is harmless for local startup and does not block containers from running.

### 6) Prisma update notice appears during install
This is informational. Do **not** upgrade dependencies before your first successful local run.
Get the app running first, then evaluate upgrades in a separate PR.

### Playwright install fails in restricted environments
Playwright is optional in this repo. If your environment hard-fails optional installs, use:
```bash
npm install --no-optional
```

### AI generation fails with missing API key
Set `DEMO_MODE="true"` (default) for mock AI outputs, or set `OPENAI_API_KEY` for live model output.

### Database errors on seed/demo
Ensure PostgreSQL is running (`docker compose up -d`) and `DATABASE_URL` points to it.

### Prisma `Unknown argument phone/location/...` runtime error
This usually means your generated Prisma Client is older than the current `prisma/schema.prisma`.
Refresh Prisma locally with:
```bash
npm run prisma:generate
npm run db:push
```
Then restart the dev server. The repo now auto-runs `prisma generate` during `npm install`, `npm run dev`, `npm run build`, `npm run seed`, and `npm run db:push`, but this note is useful if your local environment was already running with an older generated client.

---

## 📄 License
MIT (see [`LICENSE`](LICENSE)).
