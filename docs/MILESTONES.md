# PoolManager Development Milestones

**Project:** PoolManager NFL Pool Management System  
**Created:** 2025-08-16  
**Strategy:** Small, incremental milestones with strict TDD workflow

## Milestone Overview

Each milestone represents ~3-5 days of development work with clear acceptance criteria and deliverables. All development follows TDD: write failing test → minimal code to pass → refactor → commit.

---

## Milestone 1: Repository Scaffolding & Foundation
**Timeline:** 1-2 days  
**Objective:** Establish base project structure with testing framework

### Acceptance Criteria
- [ ] Next.js 14+ with App Router configured
- [ ] TypeScript strict mode enabled
- [ ] Tailwind CSS + shadcn/ui components installed
- [ ] ESLint + Prettier configured for code quality
- [ ] nodemon dev script for hot reload
- [ ] Vitest + @testing-library/react + happy-dom setup
- [ ] TDD Guard integrated with custom reporter
- [ ] Basic project structure (`/src/app`, `/src/components`, etc.)
- [ ] One sample component with passing test as proof-of-concept

### Deliverables
- Fully configured development environment
- Package.json with all required scripts
- Vitest configuration with TDD Guard
- Basic Next.js app structure
- Sample component + test demonstrating TDD workflow

---

## Milestone 2: Database Schema & Prisma Setup
**Timeline:** 2-3 days  
**Objective:** Implement complete data model with migrations

### Acceptance Criteria
- [ ] Prisma client configured with PostgreSQL
- [ ] Complete schema for all entities (Team, Game, Line, Pool, Entry, Pick, Result, Grade, Upload, MappingProfile, ModelWeights)
- [ ] Database migrations generated and tested
- [ ] Seed data for NFL teams (32 teams with official abbreviations)
- [ ] Basic CRUD operations for each entity
- [ ] Comprehensive test suite for all database operations
- [ ] Database connection utilities and error handling

### Deliverables
- `prisma/schema.prisma` with complete data model
- Database migration files
- Seed scripts for initial data
- CRUD service layer with TypeScript types
- Test suite covering all database operations

---

## Milestone 3: File Upload System
**Timeline:** 3-4 days  
**Objective:** CSV and image upload with parsing capabilities

### Acceptance Criteria
- [ ] Multi-format file upload component (CSV + images)
- [ ] CSV parser with column mapping interface
- [ ] Column mapping profiles (save/reuse configurations)
- [ ] Upload validation and error handling
- [ ] Data preview before import confirmation
- [ ] File storage and metadata tracking
- [ ] Comprehensive test coverage with file fixtures

### Deliverables
- Upload UI components with drag-and-drop
- CSV parsing and mapping logic
- File validation utilities
- Database entities for uploads and mapping profiles
- Test fixtures for various CSV formats

---

## Milestone 4: OCR & LLM Normalizer
**Timeline:** 2-3 days  
**Objective:** Image-to-data pipeline with LLM normalization

### Acceptance Criteria
- [ ] OCR integration (tesseract.js server-side)
- [ ] LLM normalizer with configurable providers (OpenAI/Anthropic/Ollama)
- [ ] Strict JSON schema validation for normalized data
- [ ] Error handling for OCR failures and LLM timeouts
- [ ] Cost tracking and rate limiting for LLM calls
- [ ] Integration with existing upload system
- [ ] Test suite with image fixtures and mock LLM responses

### Deliverables
- OCR processing pipeline
- LLM provider abstraction layer
- Prompt templates for normalization
- Schema validation utilities
- Cost tracking and limits
- Integration tests with mocked services

---

## Milestone 5: External Data Connectors
**Timeline:** 2-3 days  
**Objective:** Pluggable odds/weather/scores data sources

### Acceptance Criteria
- [ ] Connector interface for external APIs
- [ ] Free odds provider implementation (ESPN/Yahoo/etc.)
- [ ] Weather API integration with venue coordinates
- [ ] Live scores connector
- [ ] Mock adapters for testing
- [ ] Scheduled jobs for data synchronization
- [ ] Error handling and retry logic
- [ ] Test suite with API mocks

### Deliverables
- Connector abstraction layer
- At least one working odds provider
- Weather service integration
- Cron job scheduling system
- Mock implementations for testing
- API client utilities with error handling

---

## Milestone 6: Numeric Decision Model
**Timeline:** 3-4 days  
**Objective:** Core pick recommendation engine

### Acceptance Criteria
- [ ] Market probability calculator (spread/total/moneyline)
- [ ] Elo rating system with configurable K-factor
- [ ] Home advantage and rest differential calculations
- [ ] Weather penalty factors (wind/precipitation)
- [ ] Injury impact modeling
- [ ] Confidence scoring (0-100 scale)
- [ ] Model weights configuration system
- [ ] Comprehensive test suite for all calculations

### Deliverables
- Model calculation engine
- Elo rating management
- Weather and injury penalty systems
- Configuration management for model weights
- Test suite with known calculation scenarios

---

## Milestone 7: Pool Management & Pick Validation
**Timeline:** 2-3 days  
**Objective:** Pool rules enforcement and pick validation

### Acceptance Criteria
- [ ] Pool configuration system (ATS/SU/Points Plus/Survivor)
- [ ] Pick validation for each pool type
- [ ] Points Plus rules: min 4 games, equal favorites/underdogs
- [ ] Survivor rules: no team reuse, elimination tracking
- [ ] Pick locking mechanism with deadlines
- [ ] UI for pool setup and management
- [ ] Validation error messages and user feedback

### Deliverables
- Pool management interface
- Validation engine for each pool type
- Pick entry UI with real-time validation
- Rule enforcement utilities
- Test coverage for all pool rules

---

## Milestone 8: Grading & Results System
**Timeline:** 2-3 days  
**Objective:** Automated pick grading and results tracking

### Acceptance Criteria
- [ ] Automated grading engine for all pool types
- [ ] Push/OT handling per pool configuration
- [ ] Points calculation and leaderboard logic
- [ ] Margin of Victory tracking for Survivor pools
- [ ] Scheduled grading jobs post-game
- [ ] Manual override capabilities for edge cases
- [ ] Results export functionality

### Deliverables
- Grading engine for each pool type
- Automated job scheduling
- Results calculation utilities
- Manual override interface
- Export functionality

---

## Milestone 9: LLM Advisor Integration
**Timeline:** 3-4 days  
**Objective:** Multi-provider LLM advisory system

### Acceptance Criteria
- [ ] Provider adapters (OpenAI, Anthropic, Ollama)
- [ ] Fanout broker for multi-provider requests
- [ ] Advisory modes: advice_only, tiebreak, blend
- [ ] Feature vector generation for LLM input
- [ ] Cost tracking and spending caps
- [ ] Timeout and error handling
- [ ] UI for advisor recommendations and reasoning

### Deliverables
- LLM provider abstraction
- Multi-provider request handling
- Advisory UI components
- Cost control mechanisms
- Integration with numeric model

---

## Milestone 10: Production Deployment
**Timeline:** 2-3 days  
**Objective:** CI/CD pipeline and containerization

### Acceptance Criteria
- [ ] Dockerfile optimized for Node.js 22
- [ ] GitHub Actions workflow for build/test/deploy
- [ ] Container image pushed to GitHub Container Registry
- [ ] Environment variable configuration
- [ ] Health check endpoints
- [ ] Example docker-compose.yml for Unraid
- [ ] Production logging and error handling

### Deliverables
- Production-ready Docker image
- Complete CI/CD pipeline
- Deployment documentation
- Docker Compose example
- Health monitoring setup

---

## Success Metrics

### Code Quality
- Test coverage >90% for business logic
- TypeScript strict mode with zero errors
- ESLint/Prettier passing with zero warnings
- TDD Guard reporting clean test runs

### Performance
- API response times <200ms for core operations
- Database queries optimized with proper indexing
- LLM requests complete within configured timeouts
- File uploads handle up to 10MB images efficiently

### Reliability
- Graceful degradation when external APIs fail
- Database connection pooling and retry logic
- Proper error boundaries in React components
- Comprehensive logging for debugging

### Usability
- Intuitive upload and mapping workflow
- Clear validation messages and error states
- Responsive design for mobile/desktop
- Loading states and progress indicators

---

## Risk Mitigation

### Technical Risks
- **LLM API availability:** Implement fallback to numeric-only mode
- **Database performance:** Add proper indexing and query optimization
- **External API limits:** Implement caching and rate limiting
- **File processing failures:** Robust error handling and user feedback

### Business Risks
- **Scope creep:** Strict milestone boundaries with defined acceptance criteria
- **Over-engineering:** Focus on MVP features with simple, testable implementations
- **Technical debt:** Mandatory refactoring phase in each TDD cycle

### Timeline Risks
- **Dependency delays:** Mock external services early for parallel development
- **Integration complexity:** Plan integration milestones with buffer time
- **Testing overhead:** TDD approach prevents late-stage testing bottlenecks