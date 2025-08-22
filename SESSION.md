# SESSION.md (Auto-Compacted)

- src/lib/models/**tests**/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tsconfig.json

**Created:**

- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/**tests**/survivor-algorithms.test.ts
- src/lib/models/**tests**/survivor-integration.test.ts
- src/lib/models/**tests**/survivor-models.test.ts
- src/lib/models/**tests**/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/**tests**/survivor-data-integration.test.ts
- src/server/services/**tests**/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics

```
 CLAUDE.md                                          |   17 +-
 SESSION.md                                         | 6163 +++++---------------
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   21 +-
 package-lock.json                                  | 2311 +++++---
 package.json                                       |   14 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |    9 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  191 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  107 +-
 src/app/api/recommendations/route.ts               |   67 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  118 +
 src/app/layout.tsx                                 |    2 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tsconfig.json                                      |    6 +-
 49 files changed, 6224 insertions(+), 6729 deletions(-)

```

### Recent Commits

```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

_[Auto-generated from git history - No LLM used]_

---

## Session - 2025-08-22 08:57

### Files Changed

**Modified:**

- CLAUDE.md
- SESSION.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/**tests**/news-analysis.test.ts
- src/lib/models/**tests**/nfl-divisions.test.ts
- src/lib/models/**tests**/playoff-implications.test.ts
- src/lib/models/**tests**/recent-form.test.ts
- src/lib/models/**tests**/revenge-game.test.ts
- src/lib/models/**tests**/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tsconfig.json

**Created:**

- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/**tests**/survivor-algorithms.test.ts
- src/lib/models/**tests**/survivor-integration.test.ts
- src/lib/models/**tests**/survivor-models.test.ts
- src/lib/models/**tests**/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/**tests**/survivor-data-integration.test.ts
- src/server/services/**tests**/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics

```
 CLAUDE.md                                          |   17 +-
 SESSION.md                                         | 5656 +++-----------------
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   21 +-
 package-lock.json                                  | 2311 +++++---
 package.json                                       |   14 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |    9 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  191 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  107 +-
 src/app/api/recommendations/route.ts               |   67 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  118 +
 src/app/layout.tsx                                 |    2 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 ++-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tsconfig.json                                      |    6 +-
 49 files changed, 5523 insertions(+), 6923 deletions(-)

```

### Recent Commits

```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

_[Auto-generated from git history - No LLM used]_

---


## Session - 2025-08-22 09:09

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 5859 +++-------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 4943 ++++----------
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 13397 insertions(+), 10226 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 09:15

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 6014 ++++------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 4943 ++++----------
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 13587 insertions(+), 10191 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 09:25

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 6161 ++++-------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 2371 ++++---
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 13980 insertions(+), 7373 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 09:31

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 6302 +++++------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 2371 ++++---
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 14163 insertions(+), 7331 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 09:37

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 5794 +++-------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 2371 ++++---
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 13490 insertions(+), 7496 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 09:49

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 5941 ++++------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 2371 ++++---
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 13676 insertions(+), 7457 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 10:02

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 6080 ++++-------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 2371 ++++---
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 13858 insertions(+), 7414 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-22 10:36

### Files Changed
**Modified:**
- .claude/settings.json
- .claude/tdd-guard/data/modifications.json
- .eslintrc.json
- .prettierrc
- CLAUDE.md
- SESSION.md
- docs/INITIAL_PROMPT.md
- docs/MILESTONES.md
- docs/NEWS_ANALYSIS_USAGE.md
- docs/PROJECT_BRIEF.md
- docs/RFC-0001.md
- docs/TECH_GUIDE.md
- docs/TEST_STRATEGY.md
- next-env.d.ts
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- public/tesseract/worker.min.js
- scripts/add-sample-lines.ts
- scripts/add-test-games.ts
- scripts/verify-data.ts
- src/app/api/admin/cleanup-games/route.ts
- src/app/api/admin/cleanup-lines/route.ts
- src/app/api/admin/debug-lines/route.ts
- src/app/api/admin/external-data/route.ts
- src/app/api/admin/fix-teams/route.ts
- src/app/api/admin/reset-week/route.ts
- src/app/api/data-sources/route.ts
- src/app/api/debug/news-analysis/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/nfl-divisions.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/__tests__/travel-scheduling.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/elo-system.ts
- src/lib/models/news-analysis.ts
- src/lib/models/nfl-divisions.ts
- src/lib/models/pick-validators.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts
- src/lib/models/travel-scheduling.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts
- src/server/services/grading.service.ts
- tasks/001-repo-scaffold.md
- tasks/002-prisma-schema.md
- tasks/003-upload-csv.md
- tasks/004-ocr-normalizer.md
- tasks/005-numeric-model.md
- test-spread-extraction.js
- tsconfig.json
- vitest.config.ts

**Created:**
- .nvmrc
- .serena/
- backups/
- check-games.js
- check-pools.js
- components.json
- docs/DATABASE_MAINTENANCE.md
- docs/SURVIVOR_MILESTONES.md
- docs/SURVIVOR_POOL_INITIAL_PROMPT.md
- docs/TEAM_MATCHING_GUIDE.md
- prisma/migrations/20250820_add_survivor_models/
- scripts/add-points-plus-lines.ts
- scripts/add-realistic-lines.ts
- scripts/backup-db.ts
- scripts/check-games.ts
- scripts/check-survivor.ts
- scripts/create-survivor-pool.ts
- scripts/debug-spread-matching.ts
- scripts/load-espn-schedule.ts
- scripts/load-full-season.ts
- scripts/restore-db.ts
- scripts/seed-survivor-pool.ts
- scripts/setup-survivor-odds.ts
- scripts/test-fuzzy-matching.ts
- src/app/api/pools/[id]/route-old.ts
- src/app/api/pools/points-plus-strategy/
- src/app/api/survivor/
- src/app/survivor/
- src/app/test/
- src/components/ui/
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/survivor/
- src/lib/cache/
- src/lib/models/__tests__/survivor-algorithms.test.ts
- src/lib/models/__tests__/survivor-integration.test.ts
- src/lib/models/__tests__/survivor-models.test.ts
- src/lib/models/__tests__/survivor-recommendations.test.ts
- src/lib/models/points-plus-strategy.ts
- src/lib/models/survivor-ev-engine.ts
- src/lib/models/survivor-future-value.ts
- src/lib/models/survivor-playoffs.ts
- src/lib/models/survivor-recommendations.ts
- src/lib/models/survivor-strategy.ts
- src/lib/models/survivor-tiebreakers.ts
- src/lib/utils/
- src/server/db/
- src/server/services/__tests__/survivor-data-integration.test.ts
- src/server/services/__tests__/survivor-grading.test.ts
- src/server/services/public-pick-service.ts
- src/server/services/survivor-grading.service.ts
- src/server/services/survivor-odds-service.ts
- src/server/services/survivor-weather-service.ts
- tests/

### Git Statistics
```
 .claude/settings.json                              |    2 +-
 .claude/tdd-guard/data/modifications.json          |    2 +-
 .eslintrc.json                                     |    7 +-
 .prettierrc                                        |    2 +-
 CLAUDE.md                                          |   22 +-
 SESSION.md                                         | 6227 +++++------------
 docs/INITIAL_PROMPT.md                             |  145 +-
 docs/MILESTONES.md                                 |   39 +-
 docs/NEWS_ANALYSIS_USAGE.md                        |   10 +-
 docs/PROJECT_BRIEF.md                              |  145 +-
 docs/RFC-0001.md                                   |   31 +-
 docs/TECH_GUIDE.md                                 |   33 +-
 docs/TEST_STRATEGY.md                              |  128 +-
 next-env.d.ts                                      |    1 +
 next.config.js                                     |   25 +-
 package-lock.json                                  | 2371 ++++---
 package.json                                       |   18 +-
 postcss.config.js                                  |    2 +-
 prisma/schema.prisma                               |   90 +-
 prisma/seed.ts                                     |   17 +-
 public/tesseract/worker.min.js                     | 7160 +++++++++++++++++++-
 scripts/add-sample-lines.ts                        |   61 +-
 scripts/add-test-games.ts                          |   31 +-
 scripts/verify-data.ts                             |   20 +-
 src/app/api/admin/cleanup-games/route.ts           |    4 +-
 src/app/api/admin/cleanup-lines/route.ts           |    4 +-
 src/app/api/admin/debug-lines/route.ts             |    4 +-
 src/app/api/admin/external-data/route.ts           |    4 +-
 src/app/api/admin/fix-teams/route.ts               |    4 +-
 src/app/api/admin/reset-week/route.ts              |    4 +-
 src/app/api/data-sources/route.ts                  |  197 +-
 src/app/api/debug/news-analysis/route.ts           |   19 +-
 src/app/api/pools/[id]/route.ts                    |  106 +-
 src/app/api/recommendations/route.ts               |   71 +-
 src/app/debug/news-analysis/page.tsx               |   30 +-
 src/app/globals.css                                |  120 +-
 src/app/layout.tsx                                 |    4 +-
 src/app/pools/[id]/control-panel.tsx               |   27 +-
 src/app/pools/[id]/page.tsx                        |  597 +-
 src/app/test-badge/page.tsx                        |   28 +-
 .../projections/components/GameProjection.tsx      |  204 +-
 .../projections/components/ProjectionsList.tsx     |   15 +-
 .../uploads/services/game-matcher.service.ts       |   39 +-
 src/lib/data-sources/provider-registry.ts          |    2 +-
 .../data-sources/providers/espn-odds-provider.ts   |   11 +-
 src/lib/data-sources/types.ts                      |   11 +-
 src/lib/models/__tests__/news-analysis.test.ts     |  266 +-
 src/lib/models/__tests__/nfl-divisions.test.ts     |   33 +-
 .../models/__tests__/playoff-implications.test.ts  |    6 +-
 src/lib/models/__tests__/recent-form.test.ts       |   71 +-
 src/lib/models/__tests__/revenge-game.test.ts      |  250 +-
 src/lib/models/__tests__/travel-scheduling.test.ts |   77 +-
 src/lib/models/confidence-engine.ts                |  454 +-
 src/lib/models/elo-system.ts                       |   40 +-
 src/lib/models/news-analysis.ts                    |  496 +-
 src/lib/models/nfl-divisions.ts                    |  116 +-
 src/lib/models/pick-validators.ts                  |  321 +-
 src/lib/models/playoff-implications.ts             |   53 +-
 src/lib/models/recent-form.ts                      |   54 +-
 src/lib/models/revenge-game.ts                     |   68 +-
 src/lib/models/travel-scheduling.ts                |  323 +-
 src/lib/models/types.ts                            |   26 +
 src/lib/test-utils/database.ts                     |   97 +-
 src/server/services/grading.service.ts             |   78 +-
 tasks/001-repo-scaffold.md                         |   21 +-
 tasks/002-prisma-schema.md                         |   51 +-
 tasks/003-upload-csv.md                            |  106 +-
 tasks/004-ocr-normalizer.md                        |  140 +-
 tasks/005-numeric-model.md                         |  139 +-
 test-spread-extraction.js                          |   14 +-
 tsconfig.json                                      |   23 +-
 vitest.config.ts                                   |    2 +-
 72 files changed, 14044 insertions(+), 7375 deletions(-)

```

### Recent Commits
```
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service

```

*[Auto-generated from git history - No LLM used]*

---
