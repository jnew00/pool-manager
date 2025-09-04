# SESSION.md (Auto-Compacted)

- src/app/survivor/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/pools/components/PoolSetup.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts
- src/server/services/pool.service.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/completions/
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/pools/components/PoolEdit.tsx
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2581 +++++++++++---------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  714 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++--
 src/app/pools/page.tsx                             |  110 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 22 files changed, 3193 insertions(+), 1951 deletions(-)

```

### Recent Commits
```
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-27 22:44

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/route.ts
- src/app/api/survivor/entries/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/pools/components/PoolSetup.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts
- src/server/services/pool.service.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/completions/
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/pools/components/PoolEdit.tsx
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2210 +++++++-------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/survivor/entries/route.ts              |    8 +-
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  714 ++++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++---
 src/app/pools/page.tsx                             |  110 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 23 files changed, 2525 insertions(+), 2256 deletions(-)

```

### Recent Commits
```
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-27 22:48

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/route.ts
- src/app/api/survivor/entries/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/pools/components/PoolSetup.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts
- src/server/services/pool.service.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/completions/
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/pools/components/PoolEdit.tsx
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2260 +++++++-------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/survivor/entries/route.ts              |    8 +-
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  714 ++++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++---
 src/app/pools/page.tsx                             |  110 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 23 files changed, 2595 insertions(+), 2236 deletions(-)

```

### Recent Commits
```
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-27 23:00

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/route.ts
- src/app/api/survivor/entries/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/pools/components/PoolSetup.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts
- src/server/services/pool.service.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/completions/
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/pools/components/PoolEdit.tsx
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2308 ++++++++------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/survivor/entries/route.ts              |    8 +-
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  714 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  745 +++++--
 src/app/pools/page.tsx                             |  119 +-
 src/app/survivor/[id]/page.tsx                     |  121 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    1 -
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 24 files changed, 2647 insertions(+), 2256 deletions(-)

```

### Recent Commits
```
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-27 23:06

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/route.ts
- src/app/api/survivor/entries/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/pools/components/PoolSetup.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts
- src/server/services/pool.service.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/check-data-load.ts
- scripts/clear-pools-spreads.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/completions/
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/pools/components/PoolEdit.tsx
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2366 ++++++++------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/survivor/entries/route.ts              |    8 +-
 src/app/api/upload/spreads/route.ts                |  227 +-
 src/app/picks/page.tsx                             |  714 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  745 ++++--
 src/app/pools/page.tsx                             |  119 +-
 src/app/survivor/[id]/page.tsx                     |  121 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    1 -
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 24 files changed, 2713 insertions(+), 2252 deletions(-)

```

### Recent Commits
```
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 07:04

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/route.ts
- src/app/api/survivor/entries/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/pools/components/PoolSetup.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts
- src/server/services/pool.service.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/check-data-load.ts
- scripts/clear-pools-spreads.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/completions/
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/pools/components/PoolEdit.tsx
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2418 +++++++++-----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/survivor/entries/route.ts              |    8 +-
 src/app/api/upload/spreads/route.ts                |  227 +-
 src/app/picks/page.tsx                             |  714 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  745 ++++--
 src/app/pools/page.tsx                             |  119 +-
 src/app/survivor/[id]/page.tsx                     |  121 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    1 -
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 24 files changed, 2787 insertions(+), 2230 deletions(-)

```

### Recent Commits
```
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 15:12

### Files Changed
**Modified:**
- prisma/schema.prisma

**Created:**
- prisma/migrations/20250828_add_missing_pool_columns/
- prisma/migrations/20250829_optimize_indexes/
- scripts/deploy-production-migrations.sh

**Deleted:**
- prisma/migrations/20250823_optimize_indexes/migration.sql

### Git Statistics
```
 .../20250823_optimize_indexes/migration.sql        |  29 --
 prisma/schema.prisma                               | 349 +++++++++++----------
 2 files changed, 191 insertions(+), 187 deletions(-)

```

### Recent Commits
```
f12ed73 mvp
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 15:16

### Files Changed
**Modified:**
- SESSION.md
- prisma/schema.prisma

**Created:**
- prisma/migrations/20250828_add_missing_pool_columns/
- prisma/migrations/20250828_add_pending_outcome/
- prisma/migrations/20250829_optimize_indexes/
- scripts/deploy-production-migrations.sh

**Deleted:**
- prisma/migrations/20250823_optimize_indexes/migration.sql

### Git Statistics
```
 SESSION.md                                         |  37 +++
 .../20250823_optimize_indexes/migration.sql        |  29 --
 prisma/schema.prisma                               | 350 +++++++++++----------
 3 files changed, 229 insertions(+), 187 deletions(-)

```

### Recent Commits
```
f12ed73 mvp
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 15:26

### Files Changed
**Created:**
- scripts/fix-production-migrations.sh
- scripts/manual-production-sync.sql

### Git Statistics
```

```

### Recent Commits
```
e7cd699 mvp
f12ed73 mvp
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 15:33

### Files Changed
**Created:**
- scripts/apply-missing-schema.sql
- scripts/verify-production-sync.sh

### Git Statistics
```

```

### Recent Commits
```
f25d2cd mvp
e7cd699 mvp
f12ed73 mvp
991bb62 update SESSION.md and docker-entrypoint.sh
3d3ee28 update SESSION.md and docker-entrypoint.sh

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 15:40

### Files Changed
**Created:**
- scripts/force-sync-production.sql

### Git Statistics
```

```

### Recent Commits
```
602d31e mvp
f25d2cd mvp
e7cd699 mvp
f12ed73 mvp
991bb62 update SESSION.md and docker-entrypoint.sh

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 15:55

### Files Changed
**Created:**
- scripts/fix-migration-mismatch.sql

### Git Statistics
```

```

### Recent Commits
```
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp
f12ed73 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:08

### Files Changed
### Git Statistics
```

```

### Recent Commits
```
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:10

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 23 +++++++++++++++++++++++
 1 file changed, 23 insertions(+)

```

### Recent Commits
```
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:12

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 51 +++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 51 insertions(+)

```

### Recent Commits
```
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:18

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 79 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 79 insertions(+)

```

### Recent Commits
```
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:24

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 107 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 107 insertions(+)

```

### Recent Commits
```
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:28

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 135 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 135 insertions(+)

```

### Recent Commits
```
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp
e7cd699 mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:40

### Files Changed
### Git Statistics
```

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:41

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 23 +++++++++++++++++++++++
 1 file changed, 23 insertions(+)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:42

### Files Changed
**Modified:**
- SESSION.md

### Git Statistics
```
 SESSION.md | 51 +++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 51 insertions(+)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:46

### Files Changed
**Modified:**
- SESSION.md

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md | 79 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 79 insertions(+)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:55

### Files Changed
**Modified:**
- SESSION.md
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 112 +++++++++++++++++++++++
 src/components/spreads/SpreadManager.tsx | 149 ++++++++++++++++++++++++++++++-
 2 files changed, 260 insertions(+), 1 deletion(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 16:59

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 1165 ++++--------------------------
 src/app/pools/[id]/page.tsx              |   81 +++
 src/components/spreads/SpreadManager.tsx |  149 +++-
 3 files changed, 376 insertions(+), 1019 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 17:31

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 1202 +++++-------------------------
 src/app/pools/[id]/page.tsx              |   81 ++
 src/components/spreads/SpreadManager.tsx |  149 +++-
 3 files changed, 413 insertions(+), 1019 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 17:37

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 1239 ++++++------------------------
 src/app/pools/[id]/page.tsx              |  102 +++
 src/components/spreads/SpreadManager.tsx |  149 +++-
 3 files changed, 471 insertions(+), 1019 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 17:51

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 1276 ++++++------------------------
 src/app/pools/[id]/page.tsx              |  102 +++
 src/components/spreads/SpreadManager.tsx |  149 +++-
 3 files changed, 508 insertions(+), 1019 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 17:52

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 1313 +++++++-----------------------
 src/app/pools/[id]/page.tsx              |  102 +++
 src/components/spreads/SpreadManager.tsx |  149 +++-
 3 files changed, 545 insertions(+), 1019 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:07

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                               | 1378 ++++++++----------------------
 src/app/pools/[id]/page.tsx              |   64 ++
 src/components/spreads/SpreadManager.tsx |  149 +++-
 3 files changed, 558 insertions(+), 1033 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:17

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1385 ++++++--------------
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 ++-
 .../uploads/services/game-matcher.service.ts       |  137 +-
 4 files changed, 683 insertions(+), 1052 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:35

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/test-number1pool-matching.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1378 ++++++--------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 ++-
 .../uploads/services/game-matcher.service.ts       |  107 +-
 5 files changed, 680 insertions(+), 1031 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:39

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/test-actual-number1pool.ts
- scripts/test-bidirectional-matching.ts
- scripts/test-number1pool-matching.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1392 ++++++--------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 ++-
 .../uploads/services/game-matcher.service.ts       |  147 ++-
 5 files changed, 741 insertions(+), 1024 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:50

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/cleanup-duplicate-lines.ts
- scripts/test-actual-number1pool.ts
- scripts/test-bidirectional-matching.ts
- scripts/test-number1pool-matching.ts
- scripts/test-upsert-logic.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1420 ++++++--------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 +-
 .../uploads/services/game-matcher.service.ts       |  195 ++-
 5 files changed, 813 insertions(+), 1028 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:51

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/cleanup-duplicate-lines.ts
- scripts/test-actual-number1pool.ts
- scripts/test-bidirectional-matching.ts
- scripts/test-number1pool-matching.ts
- scripts/test-upsert-logic.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1460 +++++++-------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 +-
 .../uploads/services/game-matcher.service.ts       |  195 ++-
 5 files changed, 856 insertions(+), 1025 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:54

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/cleanup-duplicate-lines.ts
- scripts/test-actual-number1pool.ts
- scripts/test-bidirectional-matching.ts
- scripts/test-number1pool-matching.ts
- scripts/test-upsert-logic.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1500 +++++++-------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 +-
 .../uploads/services/game-matcher.service.ts       |  195 ++-
 5 files changed, 899 insertions(+), 1022 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 18:56

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/cleanup-duplicate-lines.ts
- scripts/clear-spreads.ts
- scripts/test-actual-number1pool.ts
- scripts/test-bidirectional-matching.ts
- scripts/test-number1pool-matching.ts
- scripts/test-upsert-logic.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1544 ++++++++------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 +-
 .../uploads/services/game-matcher.service.ts       |  195 ++-
 5 files changed, 944 insertions(+), 1021 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-28 20:53

### Files Changed
**Modified:**
- SESSION.md
- scripts/test-team-matching.ts
- src/app/pools/[id]/page.tsx
- src/components/spreads/SpreadManager.tsx
- src/features/uploads/services/game-matcher.service.ts

**Created:**
- scripts/cleanup-duplicate-lines.ts
- scripts/clear-spreads.ts
- scripts/test-actual-number1pool.ts
- scripts/test-bidirectional-matching.ts
- scripts/test-number1pool-matching.ts
- scripts/test-upsert-logic.ts
- src/app/api/upload/number1pool/
- src/features/uploads/services/number1pool-scraper.service.ts
- src/features/uploads/services/ocr-table-preprocessor.ts

### Git Statistics
```
 SESSION.md                                         | 1587 ++++++++------------
 scripts/test-team-matching.ts                      |   13 +
 src/app/pools/[id]/page.tsx                        |   64 +
 src/components/spreads/SpreadManager.tsx           |  149 +-
 .../uploads/services/game-matcher.service.ts       |  195 ++-
 5 files changed, 989 insertions(+), 1019 deletions(-)

```

### Recent Commits
```
9627ed1 mvp
2687716 mvp
172b742 mvp
602d31e mvp
f25d2cd mvp

```

*[Auto-generated from git history - No LLM used]*

---
