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
- Resume upload + parsing endpoint
- Job ingestion from Greenhouse + Lever URLs
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
```bash
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:3000`.

> Core app starts in demo-friendly mode by default.

---

## 🧪 Demo mode (recommended first run)
Demo mode lets you run without API keys and still generate sample outputs.

```bash
docker compose up -d
cp .env.example .env
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

### `npm install` fails on Playwright packages
Playwright is optional in this repo. Installation should continue because it is listed under `optionalDependencies`.
If your environment hard-fails optional installs, use:
```bash
npm install --no-optional
```

### AI generation fails with missing API key
Set `DEMO_MODE="true"` (default) for mock AI outputs, or set `OPENAI_API_KEY` for live model output.

### Database errors on seed/demo
Ensure PostgreSQL is running (`docker compose up -d`) and `DATABASE_URL` points to it.

---

## 📄 License
MIT (see [`LICENSE`](LICENSE)).
