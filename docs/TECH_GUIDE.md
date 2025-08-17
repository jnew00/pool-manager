# TECH_GUIDE.md — PoolManager

## Stack
- **Node**: 22.x (Volta pinned)
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: Next.js API routes + node-cron (light jobs)
- **DB/ORM**: PostgreSQL + Prisma
- **Testing**: Vitest + @testing-library/react + **happy-dom** + jest-dom
- **TDD**: TDD Guard + Vitest reporter
- **Dev**: nodemon (no Docker locally)
- **Prod**: Docker image (Node 22) via GitHub Actions; run on Unraid

## Scripts (expected)
```json
{
  "dev": "nodemon -e ts,tsx,js,json --exec \"next dev\"",
  "build": "next build",
  "start": "next start -p ${PORT:-3000}",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint .",
  "typecheck": "tsc -p tsconfig.json --noEmit",
  "guard": "tdd-guard"
}
```

## Paths
/src/app                # routes (Next.js App Router)
/src/components         # shared UI
/src/features           # domain modules (uploads, pools, picks, projections)
/src/lib                # utils, connectors (odds/weather), model logic
/src/server             # server-only utils, adapters, providers
/src/test               # test setup & helpers
/docs                   # RFCs, milestones, briefs
/tasks                  # small, TDD-friendly task files
/prisma                 # schema & migrations
/prompts                # LLM prompt files
/config                 # model weights, config JSON

## Environment
- Dev Postgres: set DATABASE_URL=postgresql://poolmanager:poolmanager@127.0.0.1:5432/poolmanager in .env
- Feature toggles:
- USE_LLM_NORMALIZER=true
- LLM_ADVISOR_ENABLED=true
- LLM_ADVISOR_MODE=advice_only|tiebreak|blend
- LLM_ADVISOR_* (timeouts, caps)
- Provider keys: OPENAI_API_KEY, ANTHROPIC_API_KEY, OLLAMA_BASE_URL

## Testing
- vitest.config.ts: environment happy-dom, setup ./src/test/setup.ts, TDD Guard reporter.
- Keep unit tests near code; add integration tests for API/DB logic; Playwright later for E2E.

## Jobs (cron) 
- preweek lines snapshot (Thu 06:00 ET)
- sync odds (Sun every 15m)
- sync weather (6h)
- grading (hourly Sun–Mon overnight)

