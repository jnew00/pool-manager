# SESSION.md (Auto-Compacted)


**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 3490 ++++++++++----------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 21 files changed, 2021 insertions(+), 1923 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:25

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 2580 ++++++--------------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 21 files changed, 1101 insertions(+), 1933 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:26

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 2671 +++++++-------------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 21 files changed, 1193 insertions(+), 1932 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:26

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 2762 +++++++-------------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 21 files changed, 1285 insertions(+), 1931 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:27

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 2853 +++++++-------------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 21 files changed, 1377 insertions(+), 1930 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:28

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/load-espn-schedule.ts
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 2944 ++++++++------------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 scripts/load-espn-schedule.ts                      |    2 +-
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 22 files changed, 1470 insertions(+), 1930 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:29

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- scripts/load-espn-schedule.ts
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 3035 ++++++++------------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 scripts/load-espn-schedule.ts                      |    2 +-
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 22 files changed, 1563 insertions(+), 1928 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 00:30

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120517604 bytes
 SESSION.md                                         | 3128 +++++++++-----------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 21 files changed, 1656 insertions(+), 1926 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 09:49

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/pools/[id]/route.ts
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120516964 bytes
 SESSION.md                                         | 3219 +++++++++-----------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 src/app/api/pools/[id]/route.ts                    |   30 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/pools/page.tsx                             |   81 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 23 files changed, 1842 insertions(+), 1942 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 10:09

### Files Changed
**Modified:**
- .gitignore
- .serena/cache/typescript/document_symbols_cache_v23-06-25.pkl
- SESSION.md
- next.config.js
- package-lock.json
- package.json
- prisma/schema.prisma
- src/app/api/pools/[id]/route.ts
- src/app/api/survivor/pools/[poolId]/entries/route.ts
- src/app/api/survivor/recommendations/route.ts
- src/app/debug/news-analysis/page.tsx
- src/app/pools/[id]/page.tsx
- src/app/pools/page.tsx
- src/app/survivor/[id]/page.tsx
- src/app/test-badge/page.tsx
- src/components/ui/tabs.tsx
- src/features/picks/components/WeeklyPickScreen.tsx
- src/features/pools/components/PoolConfigurationForm.tsx
- src/features/survivor/components/MultiEntryManager.tsx
- src/features/survivor/components/SurvivorPoolManager.tsx
- src/features/survivor/components/WeekMatchupGrid.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/lib/models/survivor-recommendations.ts

**Created:**
- .dockerignore
- .env.production.example
- .env.staging.example
- .github/
- Dockerfile
- docker-compose.prod.yml
- docs/API_KEYS_SETUP.md
- docs/DEPLOYMENT_GUIDE.md
- docs/PRODUCTION_MIGRATION_PLAN.md
- prisma/migrations/20250823_add_data_source_tracking/
- prisma/migrations/20250823_optimize_indexes/
- scripts/migrate-production.ts
- src/app/api/debug/injury-providers/
- src/app/api/survivor/pools/[poolId]/entries/[entryId]/route.ts
- src/components/ui/data-source-indicator.tsx
- src/components/ui/injury-data-source-indicator.tsx
- src/lib/data-sources/providers/espn-injury-provider.ts
- src/lib/data-sources/providers/espn-nfl-stats-provider.ts
- src/lib/data-sources/providers/mysportsfeeds-injury-provider.ts
- src/lib/models/real-injury-analysis.ts
- src/lib/models/real-schedule-analysis.ts
- src/lib/models/real-team-analysis.ts
- unraid-template.xml

### Git Statistics
```
 .gitignore                                         |    1 +
 .../document_symbols_cache_v23-06-25.pkl           |  Bin 119996337 -> 120516964 bytes
 SESSION.md                                         | 3312 +++++++++-----------
 next.config.js                                     |    2 +
 package-lock.json                                  |  127 +-
 package.json                                       |    3 +
 prisma/schema.prisma                               |    1 +
 src/app/api/pools/[id]/route.ts                    |   30 +
 .../api/survivor/pools/[poolId]/entries/route.ts   |    8 +
 src/app/api/survivor/recommendations/route.ts      |   12 +-
 src/app/debug/news-analysis/page.tsx               |    4 +-
 src/app/pools/[id]/page.tsx                        |    7 +-
 src/app/pools/page.tsx                             |   81 +-
 src/app/survivor/[id]/page.tsx                     |   68 +-
 src/app/test-badge/page.tsx                        |    2 +-
 src/components/ui/tabs.tsx                         |   23 +-
 src/features/picks/components/WeeklyPickScreen.tsx |    2 +-
 .../pools/components/PoolConfigurationForm.tsx     |    2 +-
 .../survivor/components/MultiEntryManager.tsx      |  109 +-
 .../survivor/components/SurvivorPoolManager.tsx    |    2 +-
 .../survivor/components/WeekMatchupGrid.tsx        |    2 +-
 .../uploads/components/ProfileSelector.tsx         |    5 +-
 src/lib/models/survivor-recommendations.ts         |   74 +-
 23 files changed, 1937 insertions(+), 1940 deletions(-)

```

### Recent Commits
```
79a8915 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 10:26

### Files Changed
### Git Statistics
```

```

### Recent Commits
```
5c80bfa ignore serena
d8550d6 main
a321059 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 10:35

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
5c80bfa ignore serena
d8550d6 main
a321059 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 10:41

### Files Changed
**Modified:**
- Dockerfile
- SESSION.md

**Created:**
- scripts/docker-entrypoint.sh

### Git Statistics
```
 Dockerfile | 28 +++++++++++++---------------
 SESSION.md | 51 +++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 64 insertions(+), 15 deletions(-)

```

### Recent Commits
```
5c80bfa ignore serena
d8550d6 main
a321059 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 10:44

### Files Changed
**Modified:**
- Dockerfile
- SESSION.md

**Created:**
- scripts/docker-entrypoint.sh

### Git Statistics
```
 Dockerfile | 58 ++++++++++++-------------------------------
 SESSION.md | 84 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 100 insertions(+), 42 deletions(-)

```

### Recent Commits
```
5c80bfa ignore serena
d8550d6 main
a321059 survivor
cec0cd6 feat(models): implement travel/scheduling analysis factor
ec28e12 working

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:12

### Files Changed
**Modified:**
- scripts/docker-entrypoint.sh

### Git Statistics
```
 scripts/docker-entrypoint.sh | 19 +++++++++++++++----
 1 file changed, 15 insertions(+), 4 deletions(-)

```

### Recent Commits
```
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main
a321059 survivor

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:14

### Files Changed
### Git Statistics
```

```

### Recent Commits
```
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:24

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
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:28

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
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:29

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
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:32

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
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:33

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
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:36

### Files Changed
**Modified:**
- SESSION.md

**Created:**
- diun-config.yml

### Git Statistics
```
 SESSION.md | 163 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 163 insertions(+)

```

### Recent Commits
```
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:41

### Files Changed
**Modified:**
- .github/workflows/deploy.yml
- SESSION.md

**Created:**
- diun-config.yml

### Git Statistics
```
 .github/workflows/deploy.yml |  33 ++++++++
 SESSION.md                   | 194 +++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 227 insertions(+)

```

### Recent Commits
```
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 11:56

### Files Changed
**Modified:**
- .github/workflows/deploy.yml
- SESSION.md

**Created:**
- diun-config.yml

### Git Statistics
```
 .github/workflows/deploy.yml |  33 +++++++
 SESSION.md                   | 227 +++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 260 insertions(+)

```

### Recent Commits
```
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena
d8550d6 main

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 12:19

### Files Changed
### Git Statistics
```

```

### Recent Commits
```
18d65fa Adds Diun integration to Docker deployment
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 12:22

### Files Changed
**Modified:**
- .github/workflows/deploy.yml
- SESSION.md

### Git Statistics
```
 .github/workflows/deploy.yml | 13 +++++++++++--
 SESSION.md                   | 23 +++++++++++++++++++++++
 2 files changed, 34 insertions(+), 2 deletions(-)

```

### Recent Commits
```
18d65fa Adds Diun integration to Docker deployment
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile
5c80bfa ignore serena

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 12:30

### Files Changed
**Modified:**
- .github/workflows/deploy.yml

### Git Statistics
```
 .github/workflows/deploy.yml | 16 +++++-----------
 1 file changed, 5 insertions(+), 11 deletions(-)

```

### Recent Commits
```
35e50bd Updates Tailscale action and debugs secrets
18d65fa Adds Diun integration to Docker deployment
5fb7f5d Improves migration robustness
d575ded workflow
132ac65 simple dockerfile

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-23 12:41

### Files Changed
**Modified:**
- .github/workflows/deploy.yml

### Git Statistics
```
 .github/workflows/deploy.yml | 23 +++++++++++++++--------
 1 file changed, 15 insertions(+), 8 deletions(-)

```

### Recent Commits
```
1a66e61 Reverts to Tailscale GitHub Action v1
1541e42 Updates Tailscale action configuration
35e50bd Updates Tailscale action and debugs secrets
18d65fa Adds Diun integration to Docker deployment
5fb7f5d Improves migration robustness

```

*[Auto-generated from git history - No LLM used]*

---
