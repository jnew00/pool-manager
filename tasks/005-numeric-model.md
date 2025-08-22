# Task 005: Numeric Decision Model

**Priority:** High  
**Estimated Time:** 12-14 hours  
**Dependencies:** 001-repo-scaffold, 002-prisma-schema  
**Milestone:** 6 - Numeric Decision Model

## Objective

Build the core deterministic pick recommendation engine using market probability, Elo ratings, and situational factors with configurable weights and comprehensive testing.

## Acceptance Criteria

### Market Probability Calculator

- [ ] Spread-to-probability conversion using statistical models
- [ ] Total-based probability calculation
- [ ] Moneyline-to-probability conversion (when available)
- [ ] Probability normalization and validation (0-100%)
- [ ] Handle edge cases (large spreads, totals, pick'em games)

### Elo Rating System

- [ ] Team rating initialization from historical data
- [ ] Weekly rating updates after game results
- [ ] Configurable K-factor for rating adjustments
- [ ] Home field advantage integration
- [ ] Rating persistence and historical tracking

### Situational Factors

- [ ] Home/away advantage calculations
- [ ] Rest differential impact (days between games)
- [ ] Weather penalty calculations (wind, precipitation)
- [ ] Injury impact modeling (QB, positional clusters)
- [ ] Bye week and short week adjustments

### Model Integration

- [ ] Weighted factor combination using configurable weights
- [ ] Final confidence score calculation (0-100)
- [ ] Factor contribution breakdown for transparency
- [ ] Model validation against historical outcomes
- [ ] Performance metrics and accuracy tracking

### Configuration System

- [ ] Model weights management (database-stored)
- [ ] Real-time weight adjustment interface
- [ ] A/B testing framework for weight optimization
- [ ] Model versioning and rollback capabilities
- [ ] Export/import configurations

### UI Components

- [ ] Pick confidence display with visual indicators
- [ ] Factor breakdown interface (tooltips/expandable)
- [ ] Model performance dashboard
- [ ] Weight adjustment controls
- [ ] Historical accuracy charts

## Test List

### Market Probability Tests (TDD)

1. **Spread Conversion**
   - **RED:** Test spread-to-probability with invalid input
   - **GREEN:** Implement robust spread conversion formula
   - **REFACTOR:** Add configurable probability models
   - Standard NFL spread conversions (-14 to +14 range)
   - Large spread handling (>14 points)
   - Pick'em game probability (spread = 0)

2. **Moneyline Conversion**
   - **RED:** Test moneyline probability with edge cases
   - **GREEN:** Implement American odds conversion
   - **REFACTOR:** Add validation for reasonable ranges
   - Positive moneyline to probability
   - Negative moneyline to probability
   - Probability normalization when both sides provided

### Elo Rating Tests

1. **Rating Updates**
   - **RED:** Test Elo update with impossible scores
   - **GREEN:** Implement standard Elo calculation
   - **REFACTOR:** Add configurable K-factor and validation
   - Win/loss rating adjustments
   - Point differential impact
   - Home field advantage in calculations

2. **Rating Management**
   - **RED:** Test rating initialization for new teams
   - **GREEN:** Implement default rating assignment
   - **REFACTOR:** Add historical seeding capabilities
   - Rating persistence across seasons
   - Rating decay for long periods of inactivity
   - Rating bounds enforcement (reasonable ranges)

### Situational Factor Tests

1. **Home Advantage**
   - **RED:** Test home advantage with neutral site games
   - **GREEN:** Implement venue-based advantage calculation
   - **REFACTOR:** Add configurable advantage values
   - Standard home field advantage (typically 2.5-3 points)
   - Neutral site game handling
   - Venue-specific advantages (domes, outdoor, altitude)

2. **Weather Impact**
   - **RED:** Test weather penalty with missing data
   - **GREEN:** Implement wind/precipitation penalties
   - **REFACTOR:** Add configurable weather thresholds
   - Wind speed impact on passing games
   - Precipitation probability penalties
   - Temperature extreme handling

3. **Injury Impact**
   - **RED:** Test injury modeling with invalid position data
   - **GREEN:** Implement QB and positional penalties
   - **REFACTOR:** Add injury severity and timing factors
   - QB injury major penalty
   - Offensive line cluster penalties
   - Defensive back cluster penalties

### Model Integration Tests

1. **Weight Combination**
   - **RED:** Test model with weights not summing to 1.0
   - **GREEN:** Implement weight normalization
   - **REFACTOR:** Add weight validation and constraints
   - All factors weighted combination
   - Confidence score boundary enforcement (0-100)
   - Weight configuration validation

2. **Factor Breakdown**
   - **RED:** Test factor contribution calculation
   - **GREEN:** Implement transparent factor tracking
   - **REFACTOR:** Add detailed breakdown reporting
   - Individual factor contribution percentages
   - Factor interaction effects
   - Confidence interval calculations

### Performance Tests

1. **Calculation Speed**
   - **RED:** Test model performance with large datasets
   - **GREEN:** Implement efficient calculation algorithms
   - **REFACTOR:** Add caching for expensive operations
   - Single game calculation speed (<10ms)
   - Bulk calculation performance (100 games <100ms)
   - Memory usage optimization

2. **Accuracy Validation**
   - **RED:** Test model accuracy against historical data
   - **GREEN:** Implement backtesting framework
   - **REFACTOR:** Add statistical significance testing
   - Historical game outcome prediction
   - Confidence calibration curves
   - Model performance metrics (Brier score, log loss)

## Implementation Steps

### Phase 1: Market Probability Engine (TDD Red-Green-Refactor)

1. **RED:** Create tests for spread-to-probability conversion
2. **GREEN:** Implement basic probability formulas
3. **REFACTOR:** Add edge case handling and validation
4. Build moneyline and total probability calculations

### Phase 2: Elo Rating System (TDD Red-Green-Refactor)

1. **RED:** Test Elo rating updates and persistence
2. **GREEN:** Implement standard Elo calculations
3. **REFACTOR:** Add configuration and historical tracking
4. Build team rating management and seeding

### Phase 3: Situational Factors (TDD Red-Green-Refactor)

1. **RED:** Test each situational factor calculation
2. **GREEN:** Implement factor-specific logic
3. **REFACTOR:** Add configuration and data integration
4. Build weather, injury, and rest factor engines

### Phase 4: Model Integration (TDD Red-Green-Refactor)

1. **RED:** Test weighted combination and final scoring
2. **GREEN:** Implement model orchestration
3. **REFACTOR:** Add transparency and debugging tools
4. Build factor breakdown and confidence reporting

### Phase 5: Configuration & UI (TDD Red-Green-Refactor)

1. **RED:** Test weight management and persistence
2. **GREEN:** Implement configuration system
3. **REFACTOR:** Add UI controls and validation
4. Build performance dashboard and historical analysis

## File Deliverables

### Core Model Engine

- `src/lib/model/market-probability.ts` - Market probability calculations
- `src/lib/model/elo-ratings.ts` - Elo rating system
- `src/lib/model/situational-factors.ts` - Home, weather, injury factors
- `src/lib/model/model-engine.ts` - Main model orchestration
- `src/lib/model/confidence-calculator.ts` - Final confidence scoring

### Factor Calculators

- `src/lib/model/factors/home-advantage.ts` - Home field calculations
- `src/lib/model/factors/rest-differential.ts` - Rest impact
- `src/lib/model/factors/weather-penalty.ts` - Weather impact
- `src/lib/model/factors/injury-impact.ts` - Injury penalties
- `src/lib/model/factors/market-implied.ts` - Market probability

### Configuration Management

- `src/lib/model/config/model-weights.ts` - Weight management
- `src/lib/model/config/weight-validator.ts` - Weight validation
- `src/server/services/model-config.service.ts` - Configuration persistence
- `src/lib/model/versioning/model-version.ts` - Model versioning

### Performance & Analytics

- `src/lib/model/analytics/backtesting.ts` - Historical validation
- `src/lib/model/analytics/performance-metrics.ts` - Accuracy tracking
- `src/lib/model/analytics/calibration.ts` - Confidence calibration
- `src/lib/model/cache/calculation-cache.ts` - Performance optimization

### UI Components

- `src/components/model/ConfidenceDisplay.tsx` - Confidence visualization
- `src/components/model/FactorBreakdown.tsx` - Factor contribution display
- `src/components/model/WeightControls.tsx` - Weight adjustment interface
- `src/components/model/PerformanceDashboard.tsx` - Model analytics
- `src/components/model/CalibrationChart.tsx` - Accuracy visualization

### API Integration

- `src/app/api/model/calculate/route.ts` - Model calculation endpoint
- `src/app/api/model/weights/route.ts` - Weight management API
- `src/app/api/model/performance/route.ts` - Performance analytics API
- `src/app/api/model/backtest/route.ts` - Backtesting endpoint

### Test Files

- `src/lib/model/*.test.ts` - Core model tests
- `src/lib/model/factors/*.test.ts` - Factor calculation tests
- `src/test/fixtures/model/` - Test data for calculations
- `src/test/integration/model.integration.test.ts` - Full model tests

## Technical Specifications

### Model Weight Configuration

```typescript
interface ModelWeights {
  market_prob_weight: number // 0.50 default
  elo_weight: number // 0.30 default
  home_adv_weight: number // 0.07 default
  rest_weight: number // 0.03 default
  weather_penalty_weight: number // 0.07 default
  injury_penalty_weight: number // 0.03 default

  // Elo parameters
  k_elo: number // 24 default

  // Weather thresholds
  wind_threshold_mph: number // 15 default
  precip_prob_threshold: number // 0.30 default

  // Injury penalties
  qb_out_penalty: number // 12 default
  ol_cluster_penalty: number // 3 default
  db_cluster_penalty: number // 3 default
}
```

### Factor Calculation Interface

```typescript
interface Factor {
  name: string
  weight: number
  calculate(game: Game, context: ModelContext): FactorResult
}

interface FactorResult {
  value: number // Raw factor value
  confidence: number // Factor reliability (0-1)
  contribution: number // Weighted contribution to final score
  metadata?: Record<string, any> // Debug information
}

interface ModelContext {
  teams: Map<string, Team>
  eloRatings: Map<string, number>
  weather?: WeatherData
  injuries?: InjuryReport[]
  weights: ModelWeights
}
```

### Confidence Calculation

```typescript
interface ConfidenceCalculation {
  finalConfidence: number // 0-100 scale
  factors: {
    market: FactorResult
    elo: FactorResult
    homeAdvantage: FactorResult
    rest: FactorResult
    weather: FactorResult
    injuries: FactorResult
  }
  recommendation: 'HOME' | 'AWAY'
  uncertainty: number // Measure of prediction uncertainty
  metadata: {
    calculationTime: number
    modelVersion: string
    dataQuality: number
  }
}
```

### Market Probability Formulas

```typescript
// Spread to probability (simplified logistic model)
function spreadToProbability(spread: number): number {
  // NFL spread typically converts: 3 points ≈ 60% probability
  const spreadPercentage = spread / 14 // Normalize to reasonable range
  const logisticValue = 1 / (1 + Math.exp(-spreadPercentage * 2.5))
  return Math.max(0.05, Math.min(0.95, logisticValue))
}

// Moneyline to probability
function moneylineToProbability(moneyline: number): number {
  if (moneyline > 0) {
    return 100 / (moneyline + 100)
  } else {
    return Math.abs(moneyline) / (Math.abs(moneyline) + 100)
  }
}
```

### Elo Rating Updates

```typescript
function updateEloRating(
  currentRating: number,
  opponentRating: number,
  actualScore: number, // 1 for win, 0.5 for tie, 0 for loss
  kFactor: number = 24
): number {
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400))
  return currentRating + kFactor * (actualScore - expectedScore)
}
```

## Performance Targets

### Calculation Speed

- Single game confidence: <10ms
- Bulk calculation (16 games): <100ms
- Model weight update: <50ms
- Historical backtesting (1000 games): <5 seconds

### Accuracy Metrics

- Target calibration: 90% accuracy for 90% confidence predictions
- Brier score: <0.20 (lower is better)
- Log loss: <0.55 (lower is better)
- AUC-ROC: >0.55 (better than random)

### Memory Usage

- Single calculation: <1MB
- Bulk calculations: <10MB
- Cache storage: <100MB
- Historical data: <500MB

## Default Weight Rationale

### Market Probability (50%)

- Most reliable signal from efficient betting markets
- Incorporates all publicly available information
- Professional oddsmakers' expertise

### Elo Ratings (30%)

- Objective team strength measurement
- Historical performance consideration
- Adjusts for recent form and trends

### Home Advantage (7%)

- Well-documented statistical advantage
- Venue-specific factors (crowd, travel, familiarity)
- Consistent across most sports

### Weather (7%)

- Significant impact on outdoor games
- Affects passing/kicking games measurably
- Data readily available from weather APIs

### Rest Differential (3%)

- Marginal but measurable impact
- More important for short weeks
- Travel fatigue consideration

### Injury Impact (3%)

- Difficult to quantify objectively
- QB injuries have outsized impact
- Positional cluster effects

## Definition of Done

- [ ] All model calculation tests pass
- [ ] Market probability formulas validated against known data
- [ ] Elo rating system tracks teams accurately
- [ ] Situational factors calculate correctly
- [ ] Model integration produces reasonable confidence scores
- [ ] Weight configuration system works end-to-end
- [ ] Performance meets target benchmarks
- [ ] UI components display model results clearly
- [ ] Backtesting framework validates historical accuracy
- [ ] All acceptance criteria verified

## Notes

- Start with simplified versions of each factor, then add complexity
- Use well-established formulas for market probability and Elo ratings
- Validate calculations against known sports betting models
- Plan for future enhancements: machine learning, advanced stats
- Consider model interpretability for user trust
- Implement comprehensive logging for model debugging
- Design for easy factor addition/removal in future versions
