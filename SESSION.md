

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
