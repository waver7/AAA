# AutoApply AI MVP Plan

## Architecture summary
- Next.js App Router serves UI and API routes in one TypeScript codebase.
- Prisma models persist profiles, jobs, fit scores, generated assets, applications, and automation runs.
- Job ingestion uses adapter interfaces (`GreenhouseAdapter`, `LeverAdapter`) for source modularity.
- Fit scoring combines rules + explainable output for transparent recommendations.
- AI generation uses OpenAI-compatible provider with demo fallback mode.
- Browser automation is optional and loaded dynamically only when enabled.

## Folder tree
```text
app/
  api/
  onboarding/
  jobs/
  applications/
  settings/
components/
lib/
  ai/
  automation/
  demo/
  jobs/
  parsing/
  scoring/
  auth/
  db/
prisma/
prompts/
docs/
tests/
```

## Implementation plan
1. Ensure install works in restricted environments (optional Playwright).
2. Strengthen local startup path with env defaults and health endpoint.
3. Add demo-first usability (seed + UI entry points + fallback AI).
4. Upgrade job detail UX with prominent “Why you match” panel.
5. Improve dashboards/empty states and launch docs.
6. Validate critical paths with focused unit tests.
