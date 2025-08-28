# SESSION.md (Auto-Compacted)

3d3ee28 update SESSION.md and docker-entrypoint.sh
819d94d update Dockerfile and SESSION.md
e9cbcac dockerfile
0e81098 Replaces Diun notification with Discord

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-27 21:19

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2098 +++++++-------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/upload/spreads/route.ts                |  223 ++-
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  742 ++++---
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  169 +-
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 14 files changed, 1817 insertions(+), 1822 deletions(-)

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


## Session - 2025-08-27 21:20

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2126 +++++++-------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  742 ++++---
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  169 +-
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 14 files changed, 1867 insertions(+), 1800 deletions(-)

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


## Session - 2025-08-27 21:40

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2158 +++++++-------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  626 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  742 +++++--
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 15 files changed, 2238 insertions(+), 2086 deletions(-)

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


## Session - 2025-08-27 21:55

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/upload/spreads/route.ts
- src/app/picks/page.tsx
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/features/pools/components/PointsPlusStrategyAdvisor.tsx
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/points-plus-strategy.ts

**Created:**
- scripts/add-general-lines.ts
- scripts/manual-parse-reference.ts
- scripts/test-actual-image-data.ts
- scripts/test-fallback-parsing.ts
- scripts/test-preprocessor.ts
- scripts/test-spread-upload.ts
- scripts/test-team-matching.ts
- scripts/test-vertical-ocr.ts
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2192 ++++++++------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  632 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++---
 src/app/pools/page.tsx                             |    6 -
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 17 files changed, 2342 insertions(+), 2138 deletions(-)

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


## Session - 2025-08-27 22:03

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2230 ++++++++------------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |    1 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  647 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++---
 src/app/pools/page.tsx                             |   24 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2466 insertions(+), 2121 deletions(-)

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


## Session - 2025-08-27 22:06

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2282 +++++++++-----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |    1 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  658 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 +++++--
 src/app/pools/page.tsx                             |   35 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2555 insertions(+), 2106 deletions(-)

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


## Session - 2025-08-27 22:07

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2330 +++++++++-----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |    1 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  658 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 +++++--
 src/app/pools/page.tsx                             |   35 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2622 insertions(+), 2087 deletions(-)

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


## Session - 2025-08-27 22:13

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2346 +++++++++-----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |    1 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  681 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 +++++--
 src/app/pools/page.tsx                             |   35 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2694 insertions(+), 2054 deletions(-)

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


## Session - 2025-08-27 22:14

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2392 ++++++++++----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |    1 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  681 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 +++++--
 src/app/pools/page.tsx                             |   35 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2760 insertions(+), 2034 deletions(-)

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


## Session - 2025-08-27 22:15

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/app/api/debug/last-upload/
- src/app/api/lines/
- src/app/api/pools/[id]/spreads/
- src/components/spreads/
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2438 ++++++++++----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |    1 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  681 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++--
 src/app/pools/page.tsx                             |   35 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2826 insertions(+), 2014 deletions(-)

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


## Session - 2025-08-27 22:20

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/check-games.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/pools/route.ts
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
- src/features/uploads/services/ocr-preprocessor.ts
- src/features/uploads/services/server-ocr.service.ts
- src/lib/debug-store.ts
- upload.log

### Git Statistics
```
 SESSION.md                                         | 2484 ++++++++++----------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  710 +++---
 src/app/pools/[id]/control-panel.tsx               |   50 +-
 src/app/pools/[id]/page.tsx                        |  760 ++++--
 src/app/pools/page.tsx                             |   35 +-
 src/app/survivor/[id]/page.tsx                     |   92 +-
 .../pools/components/PointsPlusStrategyAdvisor.tsx |  168 +-
 src/features/pools/components/PoolSetup.tsx        |   31 +
 .../uploads/services/game-matcher.service.ts       |   34 +-
 .../uploads/services/llm-normalizer.service.ts     |   69 +-
 src/features/uploads/services/mock-ocr.service.ts  |   18 +-
 src/features/uploads/services/ocr.service.ts       |   10 +-
 src/lib/models/points-plus-strategy.ts             |   56 +-
 src/server/services/pool.service.ts                |    2 +
 21 files changed, 2944 insertions(+), 1992 deletions(-)

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


## Session - 2025-08-27 22:31

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
 SESSION.md                                         | 2531 +++++++++++---------
 package-lock.json                                  |   17 +
 package.json                                       |    2 +
 prisma/schema.prisma                               |   22 +
 scripts/check-games.ts                             |  146 +-
 src/app/api/entries/[id]/route.ts                  |    5 +-
 src/app/api/pools/[id]/route.ts                    |   32 +-
 src/app/api/pools/route.ts                         |    2 +
 src/app/api/upload/spreads/route.ts                |  223 +-
 src/app/picks/page.tsx                             |  702 +++---
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
 22 files changed, 3109 insertions(+), 1973 deletions(-)

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


## Session - 2025-08-27 22:40

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
