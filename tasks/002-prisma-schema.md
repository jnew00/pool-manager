# Task 002: Prisma Schema & Database Setup

**Priority:** High  
**Estimated Time:** 6-8 hours  
**Dependencies:** 001-repo-scaffold  
**Milestone:** 2 - Database Schema & Prisma Setup

## Objective

Implement complete database schema with Prisma ORM, including all entities, relationships, and basic CRUD operations with comprehensive testing.

## Acceptance Criteria

### Prisma Configuration

- [ ] Prisma client installed and configured
- [ ] PostgreSQL provider configured in schema
- [ ] Database connection using existing `DATABASE_URL` from `.env`
- [ ] Prisma generate and migrate commands working

### Database Schema

- [ ] All entities defined with proper relationships:
  - Team (id, nflAbbr, name)
  - Game (id, season, week, kickoff, homeTeamId, awayTeamId, venue?, lat?, lon?, apiRefs JSONB?)
  - Line (id, gameId, poolId?, source, spread?, total?, moneylineHome?, moneylineAway?, capturedAt, isUserProvided)
  - Pool (id, name, type enum[ATS,SU,POINTS_PLUS,SURVIVOR], rules JSONB)
  - Entry (id, poolId, season)
  - Pick (id, entryId, gameId, teamId, lockedAt?, confidence, sourceUploadId?)
  - Result (id, gameId, homeScore?, awayScore?, status enum[SCHEDULED,FINAL])
  - Grade (id, pickId, outcome enum[WIN,LOSS,PUSH,VOID], points numeric, details JSONB?)
  - Upload (id, kind enum[CSV,IMAGE], path, parsed JSONB?, mappingProfileId?)
  - MappingProfile (id, name, columnMap JSONB)
  - ModelWeights (id, name, weights JSONB, createdAt)

### Data Relationships

- [ ] Proper foreign key constraints
- [ ] Cascade delete behaviors where appropriate
- [ ] Unique constraints on business keys
- [ ] Indexes on frequently queried fields

### Seed Data

- [ ] Complete NFL teams data (32 teams with official abbreviations)
- [ ] Sample pool configurations for each type
- [ ] Test data for development environment

### CRUD Operations

- [ ] Service layer with TypeScript interfaces
- [ ] Create, Read, Update, Delete for all entities
- [ ] Batch operations for bulk inserts
- [ ] Transaction support for complex operations
- [ ] Error handling and validation

### Testing

- [ ] Database test utilities (setup/teardown)
- [ ] Unit tests for all CRUD operations
- [ ] Integration tests with actual database
- [ ] Seed data validation tests
- [ ] Schema migration tests

## Test List

### Schema Validation Tests

1. **Migration Tests**
   - Schema generates without errors
   - Migration applies successfully to empty database
   - Migration is idempotent (can run multiple times)
   - Rollback migrations work correctly

2. **Relationship Tests**
   - Foreign key constraints enforced
   - Cascade deletes work as expected
   - Optional relationships handle null values
   - JSONB fields accept valid JSON

3. **Constraint Tests**
   - Unique constraints prevent duplicates
   - Required fields reject null values
   - Enum fields only accept valid values
   - String length limits enforced

### CRUD Operation Tests (TDD)

1. **Team Entity**
   - **RED:** Test creating team with invalid NFL abbreviation
   - **GREEN:** Implement validation for NFL abbreviations
   - **REFACTOR:** Extract validation to utility function
   - Create, read, update, delete operations
   - Bulk insert for all 32 NFL teams

2. **Game Entity**
   - **RED:** Test creating game without required teams
   - **GREEN:** Implement foreign key validation
   - **REFACTOR:** Add game creation helper
   - Complex queries (by season, week, team)
   - Date range queries for kickoff times

3. **Pool & Entry Entities**
   - **RED:** Test pool creation with invalid type
   - **GREEN:** Implement enum validation
   - **REFACTOR:** Extract pool rules validation
   - Pool configuration JSONB handling
   - Entry association with pools

4. **Pick & Grade Entities**
   - **RED:** Test pick creation with confidence out of range
   - **GREEN:** Implement confidence validation (0-100)
   - **REFACTOR:** Add pick validation utilities
   - Pick locking mechanism
   - Grade calculation accuracy

5. **Upload & Processing**
   - File upload metadata storage
   - Parsing result JSONB handling
   - Mapping profile associations

### Integration Tests

1. **Complete Game Flow**
   - Create teams → create game → create lines → create picks → grade picks
   - Data consistency throughout workflow
   - Transaction rollback on errors

2. **Pool Management**
   - Create pool → add entries → make picks → calculate results
   - Different pool types with specific rules
   - Bulk operations for large datasets

## Implementation Steps

### Phase 1: Prisma Setup (TDD Red)

```bash
# Install Prisma
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init --datasource-provider postgresql
```

### Phase 2: Schema Definition (TDD Green)

1. Define all entities in `prisma/schema.prisma`
2. Set up proper relationships and constraints
3. Configure indexes for performance
4. Define enums for status fields

### Phase 3: Migration & Generation (TDD Refactor)

```bash
# Generate initial migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### Phase 4: Service Layer (TDD Red-Green-Refactor)

1. **RED:** Write tests for team CRUD operations
2. **GREEN:** Implement team service with basic operations
3. **REFACTOR:** Extract common patterns to base service
4. Repeat for each entity following TDD cycle

### Phase 5: Seed Data

1. Create comprehensive NFL teams data
2. Sample configurations for all pool types
3. Development test data for realistic scenarios

## File Deliverables

### Prisma Files

- `prisma/schema.prisma` - Complete database schema
- `prisma/migrations/` - Database migration files
- `prisma/seed.ts` - Seed data script

### Service Layer

- `src/server/services/base.service.ts` - Base CRUD operations
- `src/server/services/team.service.ts` - Team-specific operations
- `src/server/services/game.service.ts` - Game management
- `src/server/services/pool.service.ts` - Pool configuration
- `src/server/services/pick.service.ts` - Pick management
- `src/server/services/grade.service.ts` - Grading operations

### Type Definitions

- `src/lib/types/database.ts` - Prisma type exports
- `src/lib/types/enums.ts` - Enum definitions
- `src/lib/types/api.ts` - API request/response types

### Test Files

- `src/test/utils/database.test.ts` - Database utilities
- `src/server/services/*.test.ts` - Service layer tests
- `src/test/integration/database.integration.test.ts` - Full integration

### Configuration

- `package.json` - Updated with Prisma scripts
- `.env.example` - Database URL template

## Schema Details

### Key Relationships

```prisma
model Game {
  id         String  @id @default(cuid())
  season     Int
  week       Int
  kickoff    DateTime
  homeTeam   Team    @relation("HomeGames", fields: [homeTeamId], references: [id])
  awayTeam   Team    @relation("AwayGames", fields: [awayTeamId], references: [id])
  lines      Line[]
  picks      Pick[]
  result     Result?

  @@unique([season, week, homeTeamId, awayTeamId])
  @@index([season, week])
  @@index([kickoff])
}
```

### Enum Definitions

```prisma
enum PoolType {
  ATS
  SU
  POINTS_PLUS
  SURVIVOR
}

enum PickOutcome {
  WIN
  LOSS
  PUSH
  VOID
}

enum GameStatus {
  SCHEDULED
  FINAL
}

enum UploadKind {
  CSV
  IMAGE
}
```

### JSONB Schema Examples

```typescript
// Pool rules for Points Plus
interface PointsPlusRules {
  minGames: number
  requireEqualFavUnderdogs: boolean
  allowPickEm: boolean
  pushHandling: 'void' | 'half_point'
}

// Model weights configuration
interface ModelWeights {
  market_prob_weight: number
  elo_weight: number
  home_adv_weight: number
  rest_weight: number
  weather_penalty_weight: number
  injury_penalty_weight: number
  k_elo: number
  // ... additional weights
}
```

## Definition of Done

- [ ] All Prisma migrations apply successfully
- [ ] Prisma client generates without errors
- [ ] All CRUD operations tested and working
- [ ] Seed data populates correctly
- [ ] Integration tests pass with actual database
- [ ] TypeScript types exported and usable
- [ ] Performance acceptable for expected data volumes
- [ ] Documentation updated with schema changes
- [ ] All acceptance criteria verified

## Notes

- Use existing `DATABASE_URL` from project `.env`
- Follow TDD strictly for all service implementations
- Keep database queries optimized with proper indexing
- Use transactions for multi-table operations
- Validate all inputs at service layer
- Handle database errors gracefully with meaningful messages
