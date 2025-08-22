# NFL Survivor Pool Implementation Milestones

## Overview

Comprehensive implementation plan for NFL Survivor Pool feature with Expected Value calculations, future value assessment, and multi-strategy recommendation engine.

---

## Phase 1: Foundation (Database & Models) ✅ COMPLETED

**Goal**: Establish data architecture for Survivor pools

### Tasks

- [x] Update Prisma schema with Survivor-specific models
  - SurvivorEntry model (userId, poolId, eliminatedWeek, strikes)
  - SurvivorPick model (entryId, week, teamId, result, marginOfVictory)
  - SurvivorSettings in Pool rules JSONB (strikesAllowed, tiebreaker, buybackRules)
  - SurvivorWeekData model for tracking pool statistics
- [x] Create migration for new models
- [x] Add Survivor pool type handling to existing Pool model
- [x] Create seed data for testing Survivor pools
- [x] Write tests for Survivor data models (11 tests passing)

### Acceptance Criteria

- Database schema supports multiple entries per user
- Can track team usage per entry
- Stores elimination status and week
- Handles strikes/mulligans configuration

---

## Phase 2: Core Algorithm Components ✅ COMPLETED

**Goal**: Implement EV calculation and future value assessment

### Tasks

- [x] Create `src/lib/models/survivor-ev-engine.ts`
  - Calculate win probability from moneylines
  - Convert spreads to win probabilities
  - Implement EV formula: `(Win% × (1 / % picking)) / (Overall survival rate)`
  - Pool-size adjusted EV calculations
- [x] Create `src/lib/models/survivor-future-value.ts`
  - Project future matchups using schedule
  - Calculate team future value scores (1-5 stars)
  - Identify "high-value save" teams
  - Season projection with critical weeks identification
- [x] Create `src/lib/models/survivor-strategy.ts`
  - Define strategy presets (Conservative, Balanced, Contrarian, Risk-Seeking, Custom)
  - Weight factors for each strategy
  - Composite scoring system
  - Strategic recommendations with reasoning
- [x] Write comprehensive tests for all algorithms (20 tests passing)

### Acceptance Criteria

- EV calculations match expected values within 1%
- Future value correctly identifies favorable matchups
- Strategy presets produce distinct recommendations

---

## Phase 3: Pick Validation & Rules Engine ✅ COMPLETED

**Goal**: Enforce Survivor pool rules and constraints

### Tasks

- [x] Extend `src/lib/models/pick-validators.ts` for Survivor rules
  - Prevent team reuse per entry
  - Validate single pick per week
  - Handle elimination logic
  - Support strikes/mulligan rules
- [x] Create `src/server/services/survivor-grading.service.ts`
  - Grade picks as WIN/LOSS
  - Track margin of victory
  - Handle elimination with strikes
  - Process buybacks if configured
- [x] Add Survivor-specific tests to grading service
- [x] Create integration tests for full pick lifecycle (44 tests passing)

### Acceptance Criteria

- Cannot pick same team twice in an entry
- Eliminated entries cannot make new picks
- Strikes tracked accurately
- MOV calculated correctly

---

## Phase 4: Data Integration Services ✅ COMPLETED

**Goal**: Integrate external data sources for recommendations

### Tasks

- [x] Create `src/server/services/public-pick-service.ts`
  - Fetch public pick % from multiple sources (ESPN, Yahoo, SurvivorGrid)
  - Aggregate and normalize data with weighted averages
  - In-memory cache with appropriate TTL
- [x] Extend weather service for Survivor-specific impact
  - Weather condition analysis (rain, snow, wind, dome)
  - Favorite risk assessment
  - Historical upset patterns
- [x] Create `src/server/services/survivor-odds-service.ts`
  - Fetch moneylines from multiple sportsbooks
  - Calculate implied win probabilities
  - Track odds movement and injury adjustments
- [x] Add historical survivor pool data integration
  - Weekly survival rates
  - Historical pick distributions
  - Tests passing (16 tests)

### Acceptance Criteria

- Public pick % updates at least daily
- Moneylines refresh every 15 minutes on game day
- Historical data available for modeling

---

## Phase 5: Recommendation Engine ✅ COMPLETED

**Goal**: Build intelligent pick recommendation system

### Tasks

- [x] Create `src/lib/models/survivor-recommendations.ts`
  - Combine EV and future value calculations
  - Apply strategy presets
  - Generate top 3 recommendations with confidence
  - Provide detailed reasoning for each
- [x] Add LLM enhancement layer
  - Identify narrative factors (momentum, injuries, primetime, revenge)
  - Apply bounded adjustments (±15% max)
  - Generate explanations
- [x] Create `src/app/api/survivor/recommendations/route.ts`
  - API endpoint for recommendations
  - Support multiple entries
  - Return formatted recommendations
- [x] Write comprehensive tests (11 tests passing)

### Acceptance Criteria

- Recommendations adapt to pool size
- Different strategies produce varied picks
- LLM adjustments are bounded and logged
- Clear reasoning provided for each recommendation

---

## Phase 6: User Interface - Dashboard ✅ COMPLETED

**Goal**: Create main Survivor pool dashboard

### Tasks

- [x] Create `src/app/survivor/[poolId]/page.tsx`
  - Matchup grid with team records
  - Win probability indicators (color-coded)
  - Public pick % with trends
  - EV scores highlighted when >1.0
  - Future value star ratings
- [x] Create `src/features/survivor/components/TeamSelector.tsx`
  - Visual team availability tracker (grid and list views)
  - Quick pick buttons
  - Confirmation dialogs
- [x] Create `src/features/survivor/components/PickHistory.tsx`
  - Timeline of past picks
  - Results and MOV display
  - Strike indicator
  - Achievement badges
- [x] Create `src/features/survivor/components/WeekMatchupGrid.tsx`
  - Game cards with full data visualization
  - Weather indicators
  - Used team locking
- [x] Create `src/features/survivor/components/RecommendationPanel.tsx`
  - AI-powered recommendations display
  - Strategy selector
  - Narrative factors and adjustments
- [x] Create `src/features/survivor/components/SurvivorStats.tsx`
  - Pool statistics dashboard
  - Survival projections
  - Team usage rates

### Acceptance Criteria

- Responsive grid layout
- Real-time data updates (30-second refresh)
- Clear visual indicators
- Mobile-friendly interface

---

## Phase 7: User Interface - Analytics ✅ COMPLETED

**Goal**: Advanced analytics and planning tools

### Tasks

- [x] Create `src/features/survivor/components/SeasonPlanner.tsx`
  - Drag-and-drop pick planning for full season
  - Future matchup projections with difficulty ratings
  - Team availability visualization
  - Save/load/export plan functionality
  - Path probability calculations
- [x] Create `src/features/survivor/components/RiskMeter.tsx`
  - Current week risk assessment (LOW/MODERATE/HIGH/CRITICAL)
  - Survival probability calculator
  - Pool field comparison (percentile rankings)
  - Risk factor breakdown (6 categories)
  - Historical risk tracking
- [x] Create `src/features/survivor/components/WhatIfSimulator.tsx`
  - Monte Carlo simulation (10,000 scenarios)
  - Strategy testing (4 presets)
  - Path optimization with best/average/worst paths
  - Outcome probabilities and milestones
  - Multi-entry simulation support
  - Critical week identification

### Acceptance Criteria

- Interactive planning interface with drag-and-drop
- Accurate probability calculations
- Real-time simulation results

---

## Phase 8: Multi-Entry Management

**Goal**: Support multiple entries with coordination

### Tasks

- [ ] Create `src/features/survivor/components/MultiEntryManager.tsx`
  - Tabbed interface for entries
  - Bulk operations support
  - Entry comparison view
- [ ] Implement diversification strategies
  - Block picking (different teams per entry)
  - Correlated pick warnings
  - Optimal spread calculations
- [ ] Add multi-entry tests

### Acceptance Criteria

- Smooth switching between entries
- Clear entry differentiation
- Coordinated pick suggestions
- Bulk operations work correctly

---

## Phase 9: Advanced Features & Polish

**Goal**: Complete advanced features and UI polish

### Tasks

- [ ] Implement tiebreaker systems
  - Cumulative point differential
  - Combined record of unused teams
  - Fewest strikes used
- [ ] Add playoff continuation logic
- [ ] Create notification system
  - Pick deadlines
  - Elimination alerts
  - Weekly reminders
- [ ] Performance optimization
  - Query optimization
  - Client-side caching
  - Lazy loading

### Acceptance Criteria

- All tiebreakers calculate correctly
- Smooth performance with 1000+ entries
- Notifications delivered on time
- Sub-second response times

---

## Phase 10: Testing & Documentation

**Goal**: Comprehensive testing and documentation

### Tasks

- [ ] Write end-to-end tests with Playwright
- [ ] Create load tests for 1000+ entries
- [ ] Write user documentation
- [ ] Create admin documentation
- [ ] Performance profiling and optimization
- [ ] Security audit

### Acceptance Criteria

- 90%+ test coverage
- All edge cases handled
- Documentation complete
- Performance targets met
- Security review passed

---

## Success Metrics

- [ ] EV calculations complete in <1 second
- [ ] Recommendation accuracy improves survival rate by 2x
- [ ] Zero data loss for pick submissions
- [ ] UI feels "fast, fluid, and premium"

## Technical Debt & Future Enhancements

- GraphQL API for real-time updates
- Mobile app with push notifications
- Machine learning for pick prediction
- Social features (leagues, chat)
- Advanced statistics dashboard
- Historical performance tracking
