# AutoApply AI Architecture

```mermaid
flowchart LR
  U[User] --> FE[Next.js App Router UI]
  FE --> API[Next.js Route Handlers]
  API --> DB[(PostgreSQL + Prisma)]
  API --> AI[OpenAI-compatible Provider]
  API --> JI[Job Adapter Layer]
  API --> PA[Playwright Autofill Preparation]
  PA --> AUD[Audit/Application Events]
  JI --> GH[Greenhouse]
  JI --> LV[Lever]
```

## Core modules
1. Auth
2. Profile ingestion + resume parser
3. Job ingestion adapters
4. Fit scoring engine
5. AI generation service
6. Automation preparation engine
7. Applications tracker
8. Audit logs
