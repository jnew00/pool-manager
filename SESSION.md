

## Session - 2025-08-18 19:55

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/games/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/route.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/test-utils/database.ts
- src/server/services/game.service.ts
- src/server/services/pick.service.ts

**Created:**
- .claude/
- .env.example
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-espn-fetch.js
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 ++
 package-lock.json                                  | 162 +++++++++++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 ++
 prisma/seed.ts                                     |  12 ++
 src/app/api/games/route.ts                         |  58 ++++--
 src/app/api/picks/picks.api.test.ts                |   8 +-
 src/app/api/picks/route.ts                         | 122 ++++++++++++-
 src/app/api/pools/route.ts                         |   7 +-
 src/app/globals.css                                |  60 +------
 src/app/page.tsx                                   | 199 +++++++++++++++++----
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +++-
 src/lib/data-sources/provider-registry.ts          |  22 +++
 .../data-sources/providers/espn-odds-provider.ts   |  14 +-
 .../data-sources/providers/mock-odds-provider.ts   |  28 ++-
 src/lib/data-sources/types.ts                      |   2 +
 src/lib/test-utils/database.ts                     |  74 +++++++-
 src/server/services/game.service.ts                | 143 +++++++++++++++
 src/server/services/pick.service.ts                |  16 ++
 tailwind.config.js                                 |  77 --------
 22 files changed, 863 insertions(+), 218 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:02

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/games/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/route.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/test-utils/database.ts
- src/server/services/game.service.ts
- src/server/services/pick.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 ++
 package-lock.json                                  | 162 +++++++++++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 ++
 prisma/seed.ts                                     |  12 ++
 src/app/api/games/route.ts                         |  58 ++++--
 src/app/api/picks/picks.api.test.ts                |   8 +-
 src/app/api/picks/route.ts                         | 122 ++++++++++++-
 src/app/api/pools/route.ts                         |   7 +-
 src/app/globals.css                                |  60 +------
 src/app/page.tsx                                   | 199 +++++++++++++++++----
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +++-
 src/lib/data-sources/provider-registry.ts          |  22 +++
 .../data-sources/providers/espn-odds-provider.ts   |  14 +-
 .../data-sources/providers/mock-odds-provider.ts   |  28 ++-
 src/lib/data-sources/types.ts                      |   2 +
 src/lib/test-utils/database.ts                     |  74 +++++++-
 src/server/services/game.service.ts                | 143 +++++++++++++++
 src/server/services/pick.service.ts                |  16 ++
 tailwind.config.js                                 |  77 --------
 22 files changed, 863 insertions(+), 218 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:20

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/games/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/route.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/test-utils/database.ts
- src/server/services/game.service.ts
- src/server/services/pick.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 ++
 package-lock.json                                  | 162 +++++++++++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 ++
 prisma/seed.ts                                     |  12 ++
 src/app/api/games/route.ts                         |  58 ++++--
 src/app/api/picks/picks.api.test.ts                |   8 +-
 src/app/api/picks/route.ts                         | 122 ++++++++++++-
 src/app/api/pools/route.ts                         |   7 +-
 src/app/globals.css                                |  60 +------
 src/app/page.tsx                                   | 199 +++++++++++++++++----
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +++-
 src/lib/data-sources/provider-registry.ts          |  22 +++
 .../data-sources/providers/espn-odds-provider.ts   |  14 +-
 .../data-sources/providers/mock-odds-provider.ts   |  28 ++-
 src/lib/data-sources/types.ts                      |   2 +
 src/lib/test-utils/database.ts                     |  74 +++++++-
 src/server/services/game.service.ts                | 143 +++++++++++++++
 src/server/services/pick.service.ts                |  16 ++
 tailwind.config.js                                 |  77 --------
 22 files changed, 863 insertions(+), 218 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:28

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/games/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/route.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/test-utils/database.ts
- src/server/services/game.service.ts
- src/server/services/pick.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 ++
 package-lock.json                                  | 162 +++++++++++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 ++
 prisma/seed.ts                                     |  12 ++
 src/app/api/games/route.ts                         |  58 ++++--
 src/app/api/picks/picks.api.test.ts                |   8 +-
 src/app/api/picks/route.ts                         | 122 ++++++++++++-
 src/app/api/pools/route.ts                         |   7 +-
 src/app/globals.css                                |  60 +------
 src/app/page.tsx                                   | 199 +++++++++++++++++----
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +++-
 src/lib/data-sources/provider-registry.ts          |  22 +++
 .../data-sources/providers/espn-odds-provider.ts   |  48 +++--
 .../data-sources/providers/mock-odds-provider.ts   |  28 ++-
 src/lib/data-sources/types.ts                      |   3 +
 src/lib/test-utils/database.ts                     |  74 +++++++-
 src/server/services/game.service.ts                | 143 +++++++++++++++
 src/server/services/pick.service.ts                |  16 ++
 tailwind.config.js                                 |  77 --------
 22 files changed, 885 insertions(+), 231 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:32

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/games/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/route.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/test-utils/database.ts
- src/server/services/game.service.ts
- src/server/services/pick.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 ++
 package-lock.json                                  | 162 +++++++++++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 ++
 prisma/seed.ts                                     |  12 ++
 src/app/api/games/route.ts                         |  58 ++++--
 src/app/api/picks/picks.api.test.ts                |   8 +-
 src/app/api/picks/route.ts                         | 122 ++++++++++++-
 src/app/api/pools/route.ts                         |   7 +-
 src/app/globals.css                                |  60 +------
 src/app/page.tsx                                   | 199 +++++++++++++++++----
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +++-
 src/lib/data-sources/provider-registry.ts          |  22 +++
 .../data-sources/providers/espn-odds-provider.ts   |  48 +++--
 .../data-sources/providers/mock-odds-provider.ts   |  28 ++-
 src/lib/data-sources/types.ts                      |   3 +
 src/lib/test-utils/database.ts                     |  74 +++++++-
 src/server/services/game.service.ts                | 143 +++++++++++++++
 src/server/services/pick.service.ts                |  16 ++
 tailwind.config.js                                 |  77 --------
 22 files changed, 885 insertions(+), 231 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:34

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/games/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/route.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/test-utils/database.ts
- src/server/services/game.service.ts
- src/server/services/pick.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 ++
 package-lock.json                                  | 162 +++++++++++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 ++
 prisma/seed.ts                                     |  12 ++
 src/app/api/games/route.ts                         |  58 ++++--
 src/app/api/picks/picks.api.test.ts                |   8 +-
 src/app/api/picks/route.ts                         | 122 ++++++++++++-
 src/app/api/pools/route.ts                         |   7 +-
 src/app/globals.css                                |  60 +------
 src/app/page.tsx                                   | 199 +++++++++++++++++----
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +++-
 src/lib/data-sources/provider-registry.ts          |  22 +++
 .../data-sources/providers/espn-odds-provider.ts   |  48 +++--
 .../data-sources/providers/mock-odds-provider.ts   |  28 ++-
 src/lib/data-sources/types.ts                      |   3 +
 src/lib/test-utils/database.ts                     |  74 +++++++-
 src/server/services/game.service.ts                | 143 +++++++++++++++
 src/server/services/pick.service.ts                |  16 ++
 tailwind.config.js                                 |  77 --------
 22 files changed, 885 insertions(+), 231 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:46

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |   6 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |   9 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |   6 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |   6 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |   6 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2516 insertions(+), 1072 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:49

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |   6 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |   9 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |   6 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |   6 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |   6 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2516 insertions(+), 1072 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:54

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |   6 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |   9 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |   6 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |   6 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |   6 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2516 insertions(+), 1072 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 20:58

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |   6 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |   9 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |   6 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |   6 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |   6 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2516 insertions(+), 1072 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 21:01

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |   6 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |   9 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |   6 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |   6 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |   6 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2516 insertions(+), 1072 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 21:20

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- .session_backup_20250818_210151.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |   6 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |   9 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |   6 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |   6 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |   6 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2516 insertions(+), 1072 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 21:39

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- .session_backup_20250818_210151.md
- .session_backup_20250818_212026.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |  11 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |  17 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |  21 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |  21 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |  21 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2551 insertions(+), 1095 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 21:48

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- .session_backup_20250818_210151.md
- .session_backup_20250818_212026.md
- .session_backup_20250818_213945.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |  11 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |  14 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |  21 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |  21 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |  21 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2548 insertions(+), 1095 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 22:13

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- .session_backup_20250818_210151.md
- .session_backup_20250818_212026.md
- .session_backup_20250818_213945.md
- .session_backup_20250818_214844.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  18 +
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |  11 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |  14 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |  21 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |  21 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |  21 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2548 insertions(+), 1095 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 22:31

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- .session_backup_20250818_210151.md
- .session_backup_20250818_212026.md
- .session_backup_20250818_213945.md
- .session_backup_20250818_214844.md
- .session_backup_20250818_221317.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  35 ++
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |  11 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |  14 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |  21 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |  21 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |  21 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2565 insertions(+), 1095 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 22:50

### Files Changed
**Modified:**
- next.config.js
- package-lock.json
- package.json
- postcss.config.js
- prisma/schema.prisma
- prisma/seed.ts
- src/app/api/entries/[id]/route.ts
- src/app/api/entries/entries.api.test.ts
- src/app/api/entries/route.ts
- src/app/api/games/[id]/route.ts
- src/app/api/games/games.api.test.ts
- src/app/api/games/route.ts
- src/app/api/picks/[id]/route.ts
- src/app/api/picks/picks.api.test.ts
- src/app/api/picks/route.ts
- src/app/api/pools/[id]/route.ts
- src/app/api/pools/pools.api.test.ts
- src/app/api/pools/route.ts
- src/app/api/teams/[id]/route.ts
- src/app/api/teams/route.ts
- src/app/api/teams/teams.api.basic.test.ts
- src/app/globals.css
- src/app/page.tsx
- src/components/Welcome.test.tsx
- src/components/Welcome.tsx
- src/features/uploads/components/ColumnMapper.test.tsx
- src/features/uploads/components/ColumnMapper.tsx
- src/features/uploads/components/DataPreview.test.tsx
- src/features/uploads/components/DataPreview.tsx
- src/features/uploads/components/FileUpload.test.tsx
- src/features/uploads/components/FileUpload.tsx
- src/features/uploads/components/ProfileSelector.test.tsx
- src/features/uploads/components/ProfileSelector.tsx
- src/features/uploads/components/index.ts
- src/features/uploads/lib/csv-parser.test.ts
- src/features/uploads/lib/csv-parser.ts
- src/features/uploads/lib/index.ts
- src/features/uploads/lib/upload-validator.test.ts
- src/features/uploads/lib/upload-validator.ts
- src/features/uploads/services/file-storage.service.ts
- src/features/uploads/services/index.ts
- src/features/uploads/services/mapping-profile.service.test.ts
- src/features/uploads/services/mapping-profile.service.ts
- src/lib/api/response.ts
- src/lib/data-sources/base-provider.ts
- src/lib/data-sources/index.ts
- src/lib/data-sources/provider-registry.test.ts
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/providers/index.ts
- src/lib/data-sources/providers/mock-odds-provider.ts
- src/lib/data-sources/providers/mock-providers.test.ts
- src/lib/data-sources/providers/mock-weather-provider.ts
- src/lib/data-sources/providers/openweather-provider.ts
- src/lib/data-sources/types.ts
- src/lib/jobs/data-snapshot-job.test.ts
- src/lib/jobs/data-snapshot-job.ts
- src/lib/jobs/index.ts
- src/lib/prisma.ts
- src/lib/test-utils/database.test.ts
- src/lib/test-utils/database.ts
- src/lib/types/database.ts
- src/server/services/base.service.ts
- src/server/services/entry.service.test.ts
- src/server/services/entry.service.ts
- src/server/services/game.service.test.ts
- src/server/services/game.service.ts
- src/server/services/integration.test.ts
- src/server/services/pick.service.test.ts
- src/server/services/pick.service.ts
- src/server/services/pool.service.test.ts
- src/server/services/pool.service.ts
- src/server/services/team.service.test.ts
- src/server/services/team.service.ts

**Created:**
- .claude/
- .env.example
- .session_backup_20250818_195551.md
- .session_backup_20250818_200209.md
- .session_backup_20250818_202014.md
- .session_backup_20250818_202824.md
- .session_backup_20250818_203235.md
- .session_backup_20250818_203447.md
- .session_backup_20250818_204649.md
- .session_backup_20250818_204952.md
- .session_backup_20250818_205433.md
- .session_backup_20250818_205840.md
- .session_backup_20250818_210151.md
- .session_backup_20250818_212026.md
- .session_backup_20250818_213945.md
- .session_backup_20250818_214844.md
- .session_backup_20250818_221317.md
- .session_backup_20250818_223108.md
- SESSION.md
- eng.traineddata
- prisma/migrations/20250817172155_add_grade_overrides/
- public/
- src/app/api/admin/
- src/app/api/data-sources/
- src/app/api/grades/
- src/app/api/picks/__tests__/
- src/app/api/picks/lock-status/
- src/app/api/recommendations/
- src/app/api/standings/
- src/app/api/upload/
- src/app/page.test.tsx
- src/app/picks/
- src/app/pools/
- src/app/standings/
- src/app/upload/
- src/features/picks/
- src/features/pools/
- src/features/projections/
- src/features/standings/
- src/features/uploads/services/__tests__/
- src/features/uploads/services/game-matcher.service.ts
- src/features/uploads/services/llm-normalizer.service.ts
- src/features/uploads/services/mock-ocr.service.ts
- src/features/uploads/services/ocr.service.ts
- src/lib/models/
- src/server/services/__tests__/
- src/server/services/grade-override.service.ts
- src/server/services/grading.service.ts
- src/server/services/pick-locking.service.ts
- src/server/services/standings.service.ts
- tailwind.config.js.backup
- test-spread-extraction.js

**Deleted:**
- tailwind.config.js

### Git Statistics
```
 next.config.js                                     |  17 +
 package-lock.json                                  | 162 +++++++++
 package.json                                       |   4 +
 postcss.config.js                                  |   1 -
 prisma/schema.prisma                               |  35 ++
 prisma/seed.ts                                     |  12 +
 src/app/api/entries/[id]/route.ts                  |  11 +-
 src/app/api/entries/entries.api.test.ts            |  22 +-
 src/app/api/entries/route.ts                       |   2 +-
 src/app/api/games/[id]/route.ts                    |  14 +-
 src/app/api/games/games.api.test.ts                |  42 ++-
 src/app/api/games/route.ts                         |  74 +++-
 src/app/api/picks/[id]/route.ts                    |  21 +-
 src/app/api/picks/picks.api.test.ts                | 107 ++++--
 src/app/api/picks/route.ts                         | 151 +++++++-
 src/app/api/pools/[id]/route.ts                    |  21 +-
 src/app/api/pools/pools.api.test.ts                |  22 +-
 src/app/api/pools/route.ts                         |  18 +-
 src/app/api/teams/[id]/route.ts                    |  21 +-
 src/app/api/teams/route.ts                         |   2 +-
 src/app/api/teams/teams.api.basic.test.ts          |  16 +-
 src/app/globals.css                                |  60 +---
 src/app/page.tsx                                   | 391 +++++++++++++++++++--
 src/components/Welcome.test.tsx                    |   7 +-
 src/components/Welcome.tsx                         |  30 +-
 .../uploads/components/ColumnMapper.test.tsx       |  28 +-
 src/features/uploads/components/ColumnMapper.tsx   |  62 ++--
 .../uploads/components/DataPreview.test.tsx        |  32 +-
 src/features/uploads/components/DataPreview.tsx    | 210 +++++++----
 .../uploads/components/FileUpload.test.tsx         |  60 ++--
 src/features/uploads/components/FileUpload.tsx     |  71 ++--
 .../uploads/components/ProfileSelector.test.tsx    |  40 +--
 .../uploads/components/ProfileSelector.tsx         |  51 +--
 src/features/uploads/components/index.ts           |   2 +-
 src/features/uploads/lib/csv-parser.test.ts        |  66 ++--
 src/features/uploads/lib/csv-parser.ts             |  15 +-
 src/features/uploads/lib/index.ts                  |  12 +-
 src/features/uploads/lib/upload-validator.test.ts  |  76 ++--
 src/features/uploads/lib/upload-validator.ts       |  54 ++-
 .../uploads/services/file-storage.service.ts       |  43 ++-
 src/features/uploads/services/index.ts             |   7 +-
 .../services/mapping-profile.service.test.ts       |  87 +++--
 .../uploads/services/mapping-profile.service.ts    |   7 +-
 src/lib/api/response.ts                            |  28 +-
 src/lib/data-sources/base-provider.ts              |  49 ++-
 src/lib/data-sources/index.ts                      |   2 +-
 src/lib/data-sources/provider-registry.test.ts     |  64 ++--
 src/lib/data-sources/provider-registry.ts          |  94 +++--
 .../data-sources/providers/espn-odds-provider.ts   | 109 +++---
 src/lib/data-sources/providers/index.ts            |   2 +-
 .../data-sources/providers/mock-odds-provider.ts   |  57 +--
 .../data-sources/providers/mock-providers.test.ts  | 121 ++++---
 .../providers/mock-weather-provider.ts             |  87 +++--
 .../data-sources/providers/openweather-provider.ts | 130 +++++--
 src/lib/data-sources/types.ts                      |  29 +-
 src/lib/jobs/data-snapshot-job.test.ts             | 112 +++---
 src/lib/jobs/data-snapshot-job.ts                  | 128 ++++---
 src/lib/jobs/index.ts                              |   8 +-
 src/lib/prisma.ts                                  |   2 +-
 src/lib/test-utils/database.test.ts                |   2 +-
 src/lib/test-utils/database.ts                     | 110 +++++-
 src/lib/types/database.ts                          |  17 +-
 src/server/services/base.service.ts                |  14 +-
 src/server/services/entry.service.test.ts          |   2 +-
 src/server/services/entry.service.ts               |   2 +-
 src/server/services/game.service.test.ts           |   2 +-
 src/server/services/game.service.ts                | 152 +++++++-
 src/server/services/integration.test.ts            |  13 +-
 src/server/services/pick.service.test.ts           |   2 +-
 src/server/services/pick.service.ts                |  35 +-
 src/server/services/pool.service.test.ts           |   2 +-
 src/server/services/pool.service.ts                |  12 +-
 src/server/services/team.service.test.ts           |   6 +-
 src/server/services/team.service.ts                |   4 +-
 tailwind.config.js                                 |  77 ----
 75 files changed, 2565 insertions(+), 1095 deletions(-)

```

### Recent Commits
```
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 23:12

### Files Changed
**Modified:**
- src/app/pools/[id]/control-panel.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 src/app/pools/[id]/control-panel.tsx               |  82 +++++++++++++++--
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 100 +++++++++++++++++----
 src/lib/models/types.ts                            |  14 +--
 4 files changed, 171 insertions(+), 27 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-18 23:25

### Files Changed
**Modified:**
- SESSION.md
- src/app/pools/[id]/control-panel.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 SESSION.md                                         |  38 +++++
 src/app/pools/[id]/control-panel.tsx               |  82 +++++++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 167 ++++++++++++++++++---
 src/lib/models/types.ts                            |  22 ++-
 5 files changed, 281 insertions(+), 30 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:02

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 SESSION.md                                         |  80 ++++++++++
 package-lock.json                                  |  34 +++++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++++++++-
 .../projections/components/GameProjection.tsx      |  72 ++++++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 167 ++++++++++++++++++---
 src/lib/models/types.ts                            |  22 ++-
 8 files changed, 425 insertions(+), 36 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:13

### Files Changed
**Modified:**
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 SESSION.md                                         | 129 ++++++++++++++++
 package-lock.json                                  |  34 +++++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++++++++-
 .../projections/components/GameProjection.tsx      |  72 ++++++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 167 ++++++++++++++++++---
 src/lib/models/types.ts                            |  22 ++-
 8 files changed, 474 insertions(+), 36 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:18

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   3 +-
 SESSION.md                                         | 178 +++++++++++++++++++++
 package-lock.json                                  |  34 ++++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++++++++-
 .../projections/components/GameProjection.tsx      |  72 ++++++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 167 ++++++++++++++++---
 src/lib/models/types.ts                            |  22 ++-
 9 files changed, 525 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:24

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   3 +-
 SESSION.md                                         | 229 +++++++++++++++++++++
 package-lock.json                                  |  34 +++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++++++-
 .../projections/components/GameProjection.tsx      |  72 ++++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 177 ++++++++++++++--
 src/lib/models/types.ts                            |  22 +-
 9 files changed, 586 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:32

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   8 +-
 SESSION.md                                         | 280 +++++++++++++++++++++
 package-lock.json                                  |  34 +++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++++-
 .../projections/components/GameProjection.tsx      |  72 +++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 181 +++++++++++--
 src/lib/models/types.ts                            |  22 +-
 9 files changed, 646 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:40

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   8 +-
 SESSION.md                                         | 331 +++++++++++++++++++++
 package-lock.json                                  |  34 +++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 ++++-
 .../projections/components/GameProjection.tsx      |  72 ++++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 181 +++++++++--
 src/lib/models/types.ts                            |  22 +-
 9 files changed, 697 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:45

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   8 +-
 SESSION.md                                         | 384 +++++++++++++++++++++
 package-lock.json                                  |  34 ++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 ++++-
 .../projections/components/GameProjection.tsx      |  72 +++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 185 +++++++++-
 src/lib/models/types.ts                            |  22 +-
 9 files changed, 754 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 07:47

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 437 +++++++++++++++++++++
 package-lock.json                                  |  34 ++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++-
 .../projections/components/GameProjection.tsx      |  72 +++-
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 188 ++++++++-
 src/lib/models/types.ts                            |  22 +-
 9 files changed, 811 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:02

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 490 +++++++++++++++++++++
 package-lock.json                                  |  34 ++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++-
 .../projections/components/GameProjection.tsx      |  72 ++-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 188 +++++++-
 src/lib/models/types.ts                            |  22 +-
 10 files changed, 871 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:07

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 545 +++++++++++++++++++++
 package-lock.json                                  |  34 ++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 +++-
 .../projections/components/GameProjection.tsx      |  75 ++-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 ++++++-
 src/lib/models/types.ts                            |  22 +-
 10 files changed, 927 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:12

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 600 +++++++++++++++++++++
 package-lock.json                                  |  34 ++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 ++-
 .../projections/components/GameProjection.tsx      |  75 ++-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 ++++++-
 src/lib/models/types.ts                            |  22 +-
 10 files changed, 982 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:25

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 656 +++++++++++++++++++++
 package-lock.json                                  |  34 ++
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 ++-
 src/app/pools/[id]/page.tsx                        |  91 +++
 .../projections/components/GameProjection.tsx      |  75 ++-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 +++++-
 src/lib/models/types.ts                            |  22 +-
 11 files changed, 1129 insertions(+), 37 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:27

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 714 +++++++++++++++++++++
 package-lock.json                                  |  34 +
 package.json                                       |   2 +
 src/app/pools/[id]/control-panel.tsx               |  82 ++-
 src/app/pools/[id]/page.tsx                        | 101 ++-
 .../projections/components/GameProjection.tsx      |  75 ++-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 +++++-
 src/lib/models/types.ts                            |  22 +-
 11 files changed, 1193 insertions(+), 41 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:32

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 772 +++++++++++++++++++++
 package-lock.json                                  |  34 +
 package.json                                       |   2 +
 src/app/api/recommendations/route.ts               |   3 +-
 src/app/pools/[id]/control-panel.tsx               |  82 ++-
 src/app/pools/[id]/page.tsx                        | 102 ++-
 .../projections/components/GameProjection.tsx      |  75 +-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 ++++-
 src/lib/models/types.ts                            |  22 +-
 12 files changed, 1254 insertions(+), 42 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:34

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 832 +++++++++++++++++++++
 package-lock.json                                  |  34 +
 package.json                                       |   2 +
 src/app/api/recommendations/route.ts               |   3 +-
 src/app/pools/[id]/control-panel.tsx               |  82 +-
 src/app/pools/[id]/page.tsx                        | 102 ++-
 .../projections/components/GameProjection.tsx      |  75 +-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 ++++-
 src/lib/models/types.ts                            |  22 +-
 12 files changed, 1314 insertions(+), 42 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:36

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 892 +++++++++++++++++++++
 package-lock.json                                  |  36 +-
 package.json                                       |   2 +
 src/app/api/recommendations/route.ts               |   3 +-
 src/app/pools/[id]/control-panel.tsx               |  82 +-
 src/app/pools/[id]/page.tsx                        | 102 ++-
 .../projections/components/GameProjection.tsx      |  75 +-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 186 ++++-
 src/lib/models/types.ts                            |  22 +-
 12 files changed, 1375 insertions(+), 43 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 08:41

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |   9 +-
 SESSION.md                                         | 952 +++++++++++++++++++++
 package-lock.json                                  |  36 +-
 package.json                                       |   2 +
 src/app/api/recommendations/route.ts               |   3 +-
 src/app/pools/[id]/control-panel.tsx               |  82 +-
 src/app/pools/[id]/page.tsx                        | 102 ++-
 .../projections/components/GameProjection.tsx      |  85 +-
 .../projections/components/ProjectionsList.tsx     |   7 +
 src/lib/models/__tests__/confidence-engine.test.ts |   2 +-
 src/lib/models/confidence-engine.ts                | 223 ++++-
 src/lib/models/types.ts                            |  22 +-
 12 files changed, 1463 insertions(+), 62 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 09:12

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1012 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    2 +
 src/app/api/recommendations/route.ts               |    3 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  102 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  223 ++++-
 src/lib/models/types.ts                            |   22 +-
 12 files changed, 1523 insertions(+), 62 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 09:35

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1072 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    2 +
 src/app/api/recommendations/route.ts               |    3 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  102 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  297 +++++-
 src/lib/models/types.ts                            |   24 +-
 src/lib/test-utils/database.ts                     |    2 +
 13 files changed, 1659 insertions(+), 64 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 10:16

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1136 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    2 +
 src/app/api/data-sources/route.ts                  |    9 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  103 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 17 files changed, 1843 insertions(+), 85 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 10:27

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1210 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    2 +
 src/app/api/data-sources/route.ts                  |    9 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  104 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 17 files changed, 1918 insertions(+), 85 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 10:50

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1284 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 ++
 src/app/api/data-sources/route.ts                  |    9 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  104 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 +++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2064 insertions(+), 86 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 11:06

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1361 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |   92 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  104 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 +++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2223 insertions(+), 87 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 11:13

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1438 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |   92 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  104 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 +++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2300 insertions(+), 87 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 11:15

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1515 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |   92 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  104 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2377 insertions(+), 87 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 11:24

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1592 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |  134 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  143 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2532 insertions(+), 90 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 11:26

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1669 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |  134 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  143 +-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2609 insertions(+), 90 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 11:31

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1746 ++++++++++++++++++++
 package-lock.json                                  |   36 +-
 package.json                                       |    7 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |  134 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  229 ++-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2765 insertions(+), 97 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---


## Session - 2025-08-19 12:02

### Files Changed
**Modified:**
- .env.example
- SESSION.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/api/data-sources/route.ts
- src/app/api/recommendations/route.ts
- src/app/pools/[id]/control-panel.tsx
- src/app/pools/[id]/page.tsx
- src/features/projections/components/GameProjection.tsx
- src/features/projections/components/ProjectionsList.tsx
- src/lib/data-sources/provider-registry.ts
- src/lib/data-sources/providers/espn-odds-provider.ts
- src/lib/data-sources/types.ts
- src/lib/models/__tests__/confidence-engine.test.ts
- src/lib/models/confidence-engine.ts
- src/lib/models/types.ts
- src/lib/test-utils/database.ts

**Created:**
- docs/NEWS_ANALYSIS_USAGE.md
- scripts/
- src/app/api/debug/
- src/app/debug/
- src/app/test-badge/
- src/lib/models/__tests__/news-analysis.test.ts
- src/lib/models/__tests__/playoff-implications.test.ts
- src/lib/models/__tests__/recent-form.test.ts
- src/lib/models/__tests__/revenge-game.test.ts
- src/lib/models/news-analysis.ts
- src/lib/models/playoff-implications.ts
- src/lib/models/recent-form.ts
- src/lib/models/revenge-game.ts

### Git Statistics
```
 .env.example                                       |    9 +-
 SESSION.md                                         | 1823 ++++++++++++++++++++
 package-lock.json                                  |   44 +
 package.json                                       |    8 +-
 prisma/seed.ts                                     |   68 +
 src/app/api/data-sources/route.ts                  |  134 +-
 src/app/api/recommendations/route.ts               |    5 +-
 src/app/pools/[id]/control-panel.tsx               |   82 +-
 src/app/pools/[id]/page.tsx                        |  266 ++-
 .../projections/components/GameProjection.tsx      |   85 +-
 .../projections/components/ProjectionsList.tsx     |    7 +
 src/lib/data-sources/provider-registry.ts          |   18 +-
 .../data-sources/providers/espn-odds-provider.ts   |   18 +-
 src/lib/data-sources/types.ts                      |    3 +-
 src/lib/models/__tests__/confidence-engine.test.ts |    2 +-
 src/lib/models/confidence-engine.ts                |  385 ++++-
 src/lib/models/types.ts                            |   26 +-
 src/lib/test-utils/database.ts                     |    2 +
 18 files changed, 2889 insertions(+), 96 deletions(-)

```

### Recent Commits
```
2da9bcc initial
ba95c57 feat(data-sources): implement milestone 4 odds/weather connectors
3b94018 feat(uploads): implement file storage service
a6eb658 feat: add data preview component with validation display
ac2b4fe feat: implement milestone 3 file upload system

```

*[Auto-generated from git history - No LLM used]*

---
