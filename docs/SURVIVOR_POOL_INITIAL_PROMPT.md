# NFL Survivor Pool Feature Development

## Overview

Create a comprehensive NFL Survivor Pool (also known as Eliminator/Knockout/Last Man Standing) feature for the Pool Manager project. This is a season-long elimination game where users pick one team to win straight-up each week, cannot reuse teams, and are eliminated with incorrect picks.

## Core Requirements

### 1. Data Architecture & Models

- **Pool Configuration**: Store pool-specific settings (strikes allowed, tiebreaker rules, start week, etc.)
- **User Entries**: Track multiple entries per user with pick history and elimination status
- **Team Usage**: Maintain which teams have been used by each entry
- **Weekly Data**: Store win probabilities, public pick percentages, and game results
- **Historical Performance**: Track cumulative points for tiebreakers

### 2. Algorithm Components

#### Expected Value (EV) Calculation

Implement the core EV formula that balances:

- Win probability (from betting market moneylines)
- Public pick percentage (aggregate from multiple sources)
- Pool size considerations
  Formula: EV = (Win% × (1 / % of entries picking team that survive)) / (Overall survival rate for the week)

#### Future Value Assessment

Create a season-long optimization algorithm that:

- Projects future matchups using strength of schedule
- Identifies "high-value save" teams (teams likely to be heavy favorites later)
- Assigns star ratings (1-5) for future value based on:
  - Upcoming favorable matchups
  - Likelihood of being largest favorite in future weeks
  - Pool expected duration (based on historical survival rates)

#### Recommendation Engine

Build a multi-factor recommendation system that:

1. Calculates Current Week EV for all available teams
2. Evaluates Future Value impact
3. Applies strategy presets (Conservative/Balanced/Contrarian/Risk-Seeking)
4. Generates top 3 recommendations with confidence scores
5. Provides detailed reasoning for each recommendation

### 3. Strategy Presets

Define configurable strategies:

- **Conservative**: Prioritize highest win% with acceptable EV (for small pools)
- **Balanced**: Optimize EV while preserving high future value teams
- **Contrarian**: Target lower pick% teams with positive EV (for large pools)
- **Risk-Seeking**: Aggressive early differentiation strategy
- **Custom**: Allow users to adjust weight factors

### 4. User Interface Requirements

#### Main Dashboard

- Current week's matchup grid showing:
  - Team records and point spreads
  - Win probability % (color-coded: green >70%, yellow 60-70%, red <60%)
  - Public pick % with trend indicators
  - EV score (highlighted when >1.0)
  - Future value stars (★★★★★)
  - Quick pick buttons with confirmation

#### Pick Management

- Visual team availability tracker (used teams grayed out)
- Pick history timeline with results
- "Submit Pick" with deadline countdown timer
- Undo/change pick before deadline
- Multi-entry management with tabbed interface

#### Analytics View

- Season-long pick planner with drag-and-drop
- Risk assessment meter for current week
- Survival probability calculator
- "What-if" scenario simulator
- Head-to-head comparison with pool field

### 5. Pool Settings & Rules

Support variations:

- **Strikes/Mulligans**: 0-3 allowed losses before elimination
- **Buy-backs**: Re-entry options with configurable fees
- **Start Week**: Begin at any week (for late-season pools)
- **Tiebreakers**:
  - Cumulative point differential
  - Combined record of unused teams
  - Fewest strikes used
  - Continue into playoffs
- **Special Rules**:
  - Ties count as losses/wins/continue
  - Thursday/Sunday pick deadlines
  - Default pick options
  - Reset team usage for playoffs

### 6. Data Integration

Fetch and process:

- Real-time betting lines (update with reload button)
- Public pick distribution from multiple sources
- Injury reports and lineup changes
- Weather impact on game probabilities
- Historical survivor pool elimination data

### 7. Advanced Features

#### Multi-Entry Optimization

- Coordinate picks across multiple entries
- Diversification strategies
- Block picking (different teams for each entry)

### Technical Implementation

- Reuse existing services and modules for confidence score, news, weather analysis
- Use existing LLM set up to factor in "soft" factors
- Identify "narrative factors" that betting lines might not fully capture:
  - Coaching changes mid-season
  - Locker room dynamics/team chemistry issues
  - Revenge game scenarios
  - Players returning from injury (not just injured)
  - "Must-win" situations for playoff implications
- Generate confidence adjustments based on contextual factors (add to or use existing)

#### LLM Rules / Safeguards

- Never let LLM completely override statistical models
- Set maximum adjustment limits (e.g., ±15% win probability)
- Require consensus between multiple LLM calls for major changes
- Log all LLM reasoning for post-week analysis
- Maintain "explanation confidence" scores
- Allow users to toggle LLM enhancements on/off
- Separate "statistical picks" from "LLM-enhanced picks"

#### State Management

Real-time pick tracking
Optimistic UI updates
Conflict resolution for simultaneous picks

## Development Milestones

### Phase 1: Foundation

- Database schema and models
- Basic pool creation and settings
- Team selection interface
- Pick submission flow

### Phase 2: Intelligence

- EV calculation engine
- Future value algorithm
- Win probability integration
- Public pick % data

### Phase 3: Recommendations

- Strategy preset system
- Recommendation algorithm
- Analytics dashboard
- Pick history tracking

### Phase 4: Advanced Features

- Multi-entry support
- Tiebreaker systems
- Pool intelligence features

### Phase 5: Polish & Testing

- UI/UX refinements
- Performance optimization
- Comprehensive testing
- Documentation

## Success Criteria

- Accurately calculate EV with <1 second response time
- Recommendation accuracy improves survival rate by 2x baseline
- Zero data loss for pick submissions

## Documentation Requirements

- Create SURVIVOR_MILESTONES.md with detailed task breakdowns and update it as you complete them (i will tell you to move to the next one)
- Update CLAUDE.md to auto-load milestone tracking

## Reference Implementation

Study successful platforms like Yahoo Survival Football, ESPN Eliminator, and PoolGenius for UX patterns, but create unique value through superior analytics and recommendations.
