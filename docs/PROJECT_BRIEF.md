PROJECT: PoolManager

ROLE
You are the project engineer. PLAN FIRST, THEN BUILD. Use strict TDD with very small commits. I will commit locally often and only push to prod when I say so (no PRs).

CONSTRAINTS / DEV WORKFLOW

- Node: 22.x (Volta pinned). ESM modules.
- Local DB: Postgres (dev + prod). DATABASE_URL is already set in my .env.
- Local dev: no Docker; run with nodemon via `npm run dev`.
- Tests: Vitest + @testing-library/react + happy-dom + jest-dom matchers. TDD Guard is running; always write a failing test first, then minimal code to pass, then refactor.
- UI stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.
- Backend: Next.js API routes; small cron jobs via node-cron (no heavy workers).
- LLMs: Use LLM ONLY for (a) upload normalization (OCR → strict JSON) and (b) optional Advisor (multi-model advice/tiebreak/blend). Deterministic numeric model is source of truth by default.
- Deploy: GitHub Actions builds and pushes a Docker image (Node 22 base). I’ll run it on Unraid via docker compose later. Do not run Docker locally.
- No auth. No leaderboards. No admin panel. Basic logs only.

SCOPE (LOCKED)
Audience/usage: personal only; I may run multiple concurrent NFL pools (NFL-only).
Uploads: CSV and image; image runs OCR + LLM normalizer to map to strict schema.
Feeds:

- Live scores only.
- Few years of historical data (for Elo seeding; we can stub/import later).
- Prefer free sources; allow low-cost paid later.
- Include weather + injury signals in model features.
  Lines:
- I upload my own lines; app snapshots them at pick lock.
- Compare to current Vegas lines and flag big discrepancies (configurable threshold).
  Rules per pool type (configurable where noted):
- ATS & SU: pick selected games; pushes/OT handling configurable per pool.
- Points Plus: pick at least 4 games weekly; count of favorites MUST equal count of underdogs; spread==0 games DISALLOWED; ties/cancels = 0 points.
- Survivor: one pick per week; cannot reuse a team; if pick correct, continue and track Margin of Victory as a stat; wrong → eliminated. (No admin overrides in v1.)
  Algorithm v1 (deterministic):
- Market-implied win prob from spread/total (or moneyline if present).
- Elo-lite team ratings (seeded from history; weekly update K from weights).
- Home/away + rest adjustments.
- Weather penalties (wind/precip thresholds).
- Injury flags: QB OUT big penalty; OL/DB cluster small penalties.
- Output confidence 0–100.
  Optional LLM Advisor:
- Providers: OpenAI, Anthropic, and a free/local model (Ollama).
- Modes: advice_only (default), tiebreak (small band), blend (weight).
  Persistence:
- Store line snapshots at lock; store raw + normalized values.
- No audit trails needed v1.
  UX (MVP):
- Bulk upload.
- Weekly pick screen per pool (validators for Points Plus and Survivor reuse guard).
- Projections view with factor breakdown and LLM Advisor chips.
  Jobs:
- preweek: snapshot lines (Thu 06:00 ET).
- sync:odds (Sunday every 15m), sync:weather (6h).
- postgame: grade (hourly Sun–Mon overnight).
  Stack details:
- Next.js + Tailwind + shadcn/ui.
- Prisma + Postgres.
- nodemon for dev; GitHub Actions + Docker (Node 22) for prod.
  Tone: playful disclaimer OK (local, for fun).

DATA MODEL (Prisma entities)
Team(id, nflAbbr, name)
Game(id, season, week, kickoff, homeTeamId, awayTeamId, venue?, lat?, lon?, apiRefs JSONB?)
Line(id, gameId, poolId?, source, spread?, total?, moneylineHome?, moneylineAway?, capturedAt, isUserProvided)
Pool(id, name, type enum[ATS,SU,POINTS_PLUS,SURVIVOR], rules JSONB)
Entry(id, poolId, season)
Pick(id, entryId, gameId, teamId, lockedAt?, confidence, sourceUploadId?)
Result(id, gameId, homeScore?, awayScore?, status enum[SCHEDULED,FINAL])
Grade(id, pickId, outcome enum[WIN,LOSS,PUSH,VOID], points numeric, details JSONB?)
Upload(id, kind enum[CSV,IMAGE], path, parsed JSONB?, mappingProfileId?)
MappingProfile(id, name, columnMap JSONB)
ModelWeights(id, name, weights JSONB, createdAt)

PROMPTS (USE VERBATIM)

LLM NORMALIZER — SYSTEM
You are a meticulous data normalizer for NFL matchup tables.
Your ONLY output is a JSON object matching the provided JSON Schema exactly.
No explanations. If uncertain, set null and add a note in "issues".
Rules:

- Teams -> NFL abbreviations: ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE, DAL, DEN, DET, GB, HOU, IND, JAX, KC, LVR, LAC, LAR, MIA, MIN, NE, NO, NYG, NYJ, PHI, PIT, SEA, SF, TB, TEN, WAS.
- '@' means AWAY @ HOME; fill home_team/away_team as abbreviations.
- kickoff_et: ISO-8601 with ET offset, e.g. 2025-09-07T13:00:00-04:00.
- Spread: if "NE -6.5 at NYJ", fav_team_abbr="NE". spread_for_home is +6.5 if HOME is favored; otherwise negative.
- Total/moneylines numeric or null.
- is_pickem=true if |spread| < 0.5 (still fill fields).

LLM NORMALIZER — USER TEMPLATE
Normalize this table of NFL games into the schema below.
RAW_TEXT_FROM_OCR_OR_CSV:
<<<
{RAW_TEXT}

> > > JSON_SCHEMA:
> > > {
> > > "type":"object",
> > > "properties":{

    "rows":{
      "type":"array",
      "items":{
        "type":"object",
        "properties":{
          "season":{"type":"integer"},
          "week":{"type":"integer"},
          "kickoff_et":{"type":"string"},
          "home_team":{"type":"string"},
          "away_team":{"type":"string"},
          "fav_team_abbr":{"type":"string","nullable":true},
          "spread_for_home":{"type":"number","nullable":true},
          "total":{"type":"number","nullable":true},
          "moneyline_home":{"type":"integer","nullable":true},
          "moneyline_away":{"type":"integer","nullable":true},
          "is_pickem":{"type":"boolean"},
          "source_label":{"type":"string","nullable":true},
          "issues":{"type":"array","items":{"type":"string"}}
        },
        "required":[
          "season","week","kickoff_et","home_team","away_team",
          "fav_team_abbr","spread_for_home","total",
          "moneyline_home","moneyline_away","is_pickem","source_label","issues"
        ]
      }
    }

},
"required":["rows"]
}
ADDITIONAL CONTEXT:

- Season: {SEASON}
- Week: {WEEK}
  Return ONLY the JSON object.

LLM ADVISOR — SYSTEM
You are an NFL pick advisor.
Given structured features for one matchup, output JSON with:

- model_pick: "HOME" | "AWAY"
- lean_strength: 0-100
- reasoning: <=120 words
- risk_flags: string[]
  Base advice ONLY on provided features. Return ONLY JSON.

LLM ADVISOR — USER TEMPLATE
FEATURES:
{FEATURES_JSON}
Return JSON with fields: model_pick, lean_strength, reasoning, risk_flags.

MODEL WEIGHTS (defaults; editable in app)
market_prob_weight=0.50
elo_weight=0.30
home_adv_weight=0.07
rest_weight=0.03
weather_penalty_weight=0.07
injury_penalty_weight=0.03
k_elo=24
wind_threshold_mph=15
precip_prob_threshold=0.30
qb_out_penalty=12
ol_cluster_penalty=3
db_cluster_penalty=3

DO THIS IN ORDER (STOP AFTER STEP 1 FOR REVIEW)

1. PLAN FIRST (no app code yet). Create:
   - docs/RFC-0001.md (scope above, architecture, data model, jobs, prompt summary).
   - docs/MILESTONES.md (about 9 small milestones with AC).
   - docs/TEST_STRATEGY.md (Vitest + happy-dom + RTL + TDD Guard; coverage targets; fixtures).
   - tasks/ with 5 tiny starter tasks (each with AC + test list):
     001-repo-scaffold
     002-prisma-schema
     003-upload-csv
     004-ocr-normalizer
     005-numeric-model
     Then STOP and show me the files. Wait for “approved”.

AFTER APPROVAL (TDD, SMALL COMMITS) 2) Milestone 1 – Repo & Scaffolding:

- Next.js + TS + Tailwind + shadcn/ui; nodemon dev script; ESLint/Prettier.
- Vitest + RTL + happy-dom + jest-dom; TDD Guard reporter wired.
- Create ONE failing component test → minimal code to pass → refactor. Commit after each step.

3. Milestone 2 – Prisma + Postgres:
   - Use my DATABASE_URL from .env (Postgres dev).
   - Prisma schema for entities above; migrations; minimal CRUD tests (failing → pass → refactor).

4. Milestone 3 – Uploads:
   - CSV upload with column mapper; validation; import preview; tests.
   - Image upload pipeline: OCR (tesseract.js server-side) → call LLM NORMALIZER → strict schema validation; tests with fixtures.

5. Milestone 4 – Odds/Weather connectors:
   - Pluggable interfaces with a free default + mock adapters; schedule snapshot job; tests.

6. Milestone 5 – Numeric model + screens:
   - Compute confidence; validators (Points Plus counts, Survivor reuse guard); projections UI with factor breakdown; tests.

7. Milestone 6 – Grading:
   - Pull finals; grade picks per rules; MoV; tests.

8. Milestone 7 – LLM Advisor panel:
   - Provider adapters for OpenAI, Anthropic, Ollama; fan-out broker; advice_only UI first; cost/time caps; tests.

9. Milestone 8 – CI & Docker:
   - Dockerfile (Node 22) + GitHub Actions to build & push image to GHCR on pushes to main.
   - Provide example docker-compose.yml (commented) for Unraid (don’t deploy automatically).

HOUSE RULES

- Always start each task by listing tests you will write. Write a failing test; stop. Then make it pass; stop. Then refactor.
- Keep commits small and descriptive. Do not push unless I say.
- Use environment toggles: USE_LLM_NORMALIZER, LLM_ADVISOR_ENABLED, LLM_ADVISOR_MODE, LLM_ADVISOR_BLEND_WEIGHT, LLM_ADVISOR_SKIP_IF_NUMERIC_CONF_GE, LLM_ADVISOR_TIMEOUT_MS, LLM_ADVISOR_MAX_TOKENS, LLM_ADVISOR_COST_CAP_USD, plus OpenAI/Anthropic/Ollama keys.
- Deliver full file paths and contents when creating code.
- Respect the plan-first STOP after step 1.
