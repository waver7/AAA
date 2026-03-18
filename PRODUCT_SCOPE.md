# PRODUCT_SCOPE.md

## What the MVP does
- Parses uploaded resumes (PDF-first parser with extension points for DOCX).
- Ingests jobs from Greenhouse and Lever URLs.
- Scores each job with transparent reasoning (matching/missing skills, concerns, mismatch notes).
- Generates recruiter outreach and tailored summaries via an OpenAI-compatible abstraction.
- Supports demo/mock generation when `DEMO_MODE=true` and API keys are unavailable.
- Tracks applications in a pipeline dashboard.
- Runs Playwright autofill in **preparation mode** and pauses before final submission.

## What the MVP explicitly does not do
- No autonomous final job submission.
- No browser extension.
- No multi-user admin console.
- No broad scraping of unsupported sites beyond adapter boundaries.

## Safety rules
- Human approval is mandatory before submit actions.
- Automation is feature-flagged (`ENABLE_AUTOMATION`) and optional.
- Automation actions should be auditable and logged.
- Respect website Terms of Service and robots policies.

## Future expansion ideas
- Robust DOCX parser + OCR fallback.
- Additional job source adapters and official ATS APIs.
- Embeddings + pgvector semantic ranking.
- Follow-up reminders and recruiter response analytics.
