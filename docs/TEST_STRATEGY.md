# PoolManager Testing Strategy

**Project:** PoolManager NFL Pool Management System  
**Created:** 2025-08-16  
**Approach:** Test-Driven Development with TDD Guard continuous feedback

## Testing Philosophy

### TDD Workflow (Mandatory)

Every feature follows strict Red-Green-Refactor cycle:

1. **Red:** Write a failing test that describes the desired behavior
2. **Green:** Write minimal code to make the test pass
3. **Refactor:** Improve code while keeping tests green
4. **Commit:** Small, focused commits after each cycle

### TDD Guard Integration

- Continuous test runner monitoring file changes
- Immediate feedback on test status
- Custom reporter for clear pass/fail visibility
- Two terminal setup: `npx tdd-guard` + `npm run test:watch`

## Test Stack

### Core Framework

- **Vitest** - Fast unit test runner with TypeScript support
- **@testing-library/react** - Component testing utilities
- **happy-dom** - Lightweight DOM environment
- **@testing-library/jest-dom** - DOM assertion matchers

### Additional Tools

- **MSW (Mock Service Worker)** - API mocking for integration tests
- **Prisma Client Mock** - Database operation mocking
- **Supertest** - HTTP endpoint testing
- **Faker.js** - Test data generation

## Test Categories

### Unit Tests (80% coverage target)

**Location:** Co-located with source files (`*.test.ts`, `*.test.tsx`)

**Scope:**

- Pure functions and utilities
- Component behavior and props
- Business logic calculations
- Validation functions
- Model transformations

**Example Structure:**

```typescript
// src/lib/model/calculations.test.ts
describe('Elo Rating Calculations', () => {
  it('should update ratings after win', () => {
    // Arrange
    const team1Elo = 1500
    const team2Elo = 1600
    const kFactor = 24

    // Act
    const result = updateEloRatings(team1Elo, team2Elo, 'WIN', kFactor)

    // Assert
    expect(result.team1NewElo).toBe(1512)
    expect(result.team2NewElo).toBe(1588)
  })
})
```

### Integration Tests (15% coverage target)

**Location:** `/src/test/integration/`

**Scope:**

- API endpoint behavior
- Database operations with test DB
- File upload processing
- External service integration (mocked)
- End-to-end feature workflows

**Example Structure:**

```typescript
// src/test/integration/upload.test.ts
describe('CSV Upload Integration', () => {
  it('should process valid CSV and create database records', async () => {
    // Arrange
    const csvContent = readTestFixture('valid-lines.csv')

    // Act
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from(csvContent), 'test.csv')

    // Assert
    expect(response.status).toBe(200)
    const games = await prisma.game.findMany()
    expect(games).toHaveLength(16)
  })
})
```

### Component Tests (5% coverage target)

**Location:** Co-located with components (`*.test.tsx`)

**Scope:**

- User interaction flows
- State management
- Form validation
- Conditional rendering
- Event handling

**Example Structure:**

```typescript
// src/components/UploadForm.test.tsx
describe('UploadForm Component', () => {
  it('should show validation errors for invalid files', async () => {
    // Arrange
    render(<UploadForm onUpload={mockFn} />);
    const fileInput = screen.getByLabelText(/upload file/i);

    // Act
    await userEvent.upload(fileInput, invalidFile);

    // Assert
    expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
  });
});
```

## Test Configuration

### Vitest Setup

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
    reporters: ['default', 'tdd-guard'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.mock('process.env', () => ({
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  USE_LLM_NORMALIZER: 'false',
  LLM_ADVISOR_ENABLED: 'false',
}))

// Global test utilities
global.mockPrisma = vi.mocked(prisma)
```

## Test Data Management

### Fixtures

**Location:** `/src/test/fixtures/`

**Categories:**

- `csv/` - Sample CSV files for upload testing
- `images/` - Test images for OCR processing
- `api/` - Mock API responses
- `database/` - Seed data for integration tests

### Factory Functions

```typescript
// src/test/factories/game.factory.ts
export const createTestGame = (overrides: Partial<Game> = {}): Game => ({
  id: faker.string.uuid(),
  season: 2024,
  week: 1,
  kickoff: faker.date.future(),
  homeTeamId: faker.string.uuid(),
  awayTeamId: faker.string.uuid(),
  ...overrides,
})
```

### Database Test Utilities

```typescript
// src/test/utils/database.ts
export const cleanDatabase = async () => {
  await prisma.grade.deleteMany()
  await prisma.pick.deleteMany()
  await prisma.entry.deleteMany()
  // ... cleanup in dependency order
}

export const seedTestData = async () => {
  await prisma.team.createMany({
    data: NFL_TEAMS_FIXTURE,
  })
}
```

## Mocking Strategy

### External APIs

```typescript
// src/test/mocks/handlers.ts
export const handlers = [
  rest.get('https://api.weather.com/*', (req, res, ctx) => {
    return res(ctx.json(weatherFixture))
  }),

  rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
    return res(ctx.json(llmResponseFixture))
  }),
]
```

### Database Operations

```typescript
// src/test/mocks/prisma.ts
export const mockPrisma = {
  game: {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(mockGame),
  },
  // ... other models
}
```

## Coverage Targets

### Overall Coverage: >85%

- **Statements:** 90%
- **Branches:** 85%
- **Functions:** 90%
- **Lines:** 90%

### Critical Path Coverage: 100%

- Pick validation logic
- Grading calculations
- Model score computations
- Database migrations
- File upload processing

### Exclusions

- Type definitions
- Configuration files
- Development utilities
- Third-party integrations (with mocks)

## Test Organization

### File Naming Conventions

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- Component tests: `*.component.test.tsx`
- E2E tests: `*.e2e.test.ts` (future)

### Test Suite Structure

```
src/
├── lib/
│   ├── model/
│   │   ├── calculations.ts
│   │   └── calculations.test.ts
│   └── utils/
│       ├── validation.ts
│       └── validation.test.ts
├── components/
│   ├── UploadForm.tsx
│   └── UploadForm.test.tsx
└── test/
    ├── setup.ts
    ├── fixtures/
    ├── factories/
    ├── mocks/
    └── integration/
```

## Continuous Integration

### Pre-commit Hooks

- Run affected tests
- Type checking
- Linting
- Format checking

### GitHub Actions

```yaml
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_PASSWORD: postgres
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
    - run: npm ci
    - run: npm run test:ci
    - run: npm run typecheck
```

## TDD Guard Configuration

### Custom Reporter

```typescript
// src/test/tdd-guard-reporter.ts
export class TDDGuardReporter implements Reporter {
  onTaskUpdate(packs: TaskResultPack[]) {
    const failed = packs.filter((p) => p.result?.state === 'fail')
    if (failed.length > 0) {
      console.log(chalk.red(`❌ ${failed.length} tests failing`))
    } else {
      console.log(chalk.green('✅ All tests passing'))
    }
  }
}
```

### Workflow Integration

1. **Terminal 1:** `npx tdd-guard` (file watcher)
2. **Terminal 2:** `npm run test:watch` (test runner)
3. **IDE:** Live feedback on test status

## Performance Testing

### Load Testing (Future)

- API endpoint performance
- Database query optimization
- File upload limits
- LLM request timeouts

### Benchmark Tests

```typescript
// src/test/benchmarks/model.bench.ts
describe('Model Performance', () => {
  bench('should calculate 1000 pick confidences under 100ms', async () => {
    const games = generateTestGames(1000)
    await calculatePickConfidences(games)
  })
})
```

## Test Maintenance

### Regular Tasks

- Update fixtures with real data samples
- Review and update mock responses
- Prune obsolete test cases
- Optimize slow-running tests

### Test Debt Prevention

- Mandatory test writing before implementation
- Test review in code reviews
- Regular refactoring of test utilities
- Documentation of testing patterns

## Debugging & Troubleshooting

### Common Issues

- **Slow tests:** Check for unnecessary async operations
- **Flaky tests:** Review timing dependencies and mocks
- **Memory leaks:** Ensure proper cleanup in test teardown
- **Mock staleness:** Regular sync with actual API responses

### Debug Tools

- `--reporter=verbose` for detailed test output
- `--run` for single test execution
- `--coverage` for coverage analysis
- `--ui` for interactive test debugging
