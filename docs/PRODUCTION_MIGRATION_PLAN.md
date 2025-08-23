# Production Migration Plan

## Overview

Comprehensive plan for migrating PoolManager to production with real data integration, database migrations, containerization, and automated deployment.

## Phase 1: Database Migration & Schema

### 1.1 Database Migration Scripts

**Location**: `prisma/migrations/`

#### Required Migrations:

1. **20250823_add_data_source_tracking** - Track real vs mock data usage
2. **20250823_add_api_configuration** - Store API keys and provider settings
3. **20250823_add_audit_logs** - Track data source usage and API calls
4. **20250823_optimize_indexes** - Performance optimization for production

### 1.2 Data Migration Strategy

**Pre-Migration Checklist**:

- [ ] Full database backup
- [ ] Migration rollback scripts prepared
- [ ] Data validation scripts ready
- [ ] Performance testing completed

**Migration Steps**:

1. Backup production database
2. Run schema migrations in maintenance window
3. Migrate existing mock data with real data indicators
4. Validate data integrity
5. Update application configuration

## Phase 2: Environment Configuration

### 2.1 Environment Variables

#### Production Environment (`.env.production`):

```bash
# Database
DATABASE_URL="postgresql://user:pass@prod-db:5432/poolmanager"
DIRECT_URL="postgresql://user:pass@prod-db:5432/poolmanager"

# Next.js
NODE_ENV=production
NEXTAUTH_URL=https://poolmanager.app
NEXTAUTH_SECRET="secure-production-secret"

# NFL Data APIs
ESPN_API_BASE_URL="https://site.api.espn.com/apis/site/v2/sports/football/nfl"
MYSPORTSFEEDS_API_KEY="your-production-key"
MYSPORTSFEEDS_API_URL="https://api.mysportsfeeds.com/v2.1/pull/nfl"

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_API_LOGGING=true
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# Performance
REDIS_URL="redis://redis-prod:6379"
CACHE_TTL_HOURS=4
RATE_LIMIT_PER_MINUTE=60

# Security
CORS_ORIGIN="https://poolmanager.app"
API_RATE_LIMIT=true
SECURE_HEADERS=true
```

### 2.2 Staging Environment (`.env.staging`):

```bash
# Similar to production but with staging URLs and test API keys
DATABASE_URL="postgresql://user:pass@staging-db:5432/poolmanager_staging"
NEXTAUTH_URL=https://staging.poolmanager.app
MYSPORTSFEEDS_API_KEY="test-key"
LOG_LEVEL=debug
```

## Phase 3: Containerization

### 3.1 Production Dockerfile

**Location**: `Dockerfile`

### 3.2 Docker Compose for Local Development

**Location**: `docker-compose.yml`

### 3.3 Production Docker Compose

**Location**: `docker-compose.prod.yml`

## Phase 4: CI/CD Pipeline

### 4.1 GitHub Actions Workflow

**Location**: `.github/workflows/deploy.yml`

#### Workflow Features:

- Automated testing on PR
- Database migration validation
- Security scanning
- Multi-stage deployment (staging → production)
- Rollback capability
- Slack notifications

### 4.2 Deployment Environments

#### Staging Deployment:

- Triggered on `develop` branch
- Full test suite execution
- Database migration dry-run
- Performance testing

#### Production Deployment:

- Triggered on `main` branch
- Requires manual approval
- Blue-green deployment
- Automatic rollback on failure

## Phase 5: Infrastructure Setup

### 5.1 Database Configuration

#### PostgreSQL Production Setup:

- **Provider**: AWS RDS / DigitalOcean Managed Database
- **Instance**: db.t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 100GB SSD with auto-scaling
- **Backups**: Daily automated backups, 7-day retention
- **Read Replicas**: 1 read replica for reporting

#### Database Optimization:

```sql
-- Indexes for performance
CREATE INDEX CONCURRENTLY idx_pools_season_active ON pools(season, active);
CREATE INDEX CONCURRENTLY idx_games_week_season ON games(week, season);
CREATE INDEX CONCURRENTLY idx_entries_pool_active ON survivor_entries(pool_id, is_active);
```

### 5.2 Application Infrastructure

#### Deployment Platform Options:

**Option 1: Vercel (Recommended for Next.js)**

- Zero-config deployment
- Automatic scaling
- Built-in CDN
- Database connection pooling

**Option 2: DigitalOcean App Platform**

- Container-based deployment
- Managed databases
- Load balancing
- Custom domains

**Option 3: AWS (Full Control)**

- ECS with Fargate
- RDS PostgreSQL
- CloudFront CDN
- Route 53 DNS

### 5.3 Monitoring & Logging

#### Application Monitoring:

- **APM**: Sentry for error tracking
- **Metrics**: Prometheus + Grafana
- **Uptime**: UptimeRobot or Pingdom
- **Logs**: CloudWatch or DigitalOcean Logs

#### Key Metrics to Track:

- API response times
- Database query performance
- NFL data API success rates
- User engagement metrics
- Error rates and types

## Phase 6: Security & Compliance

### 6.1 Security Measures

#### API Security:

- Rate limiting on all endpoints
- API key rotation strategy
- CORS configuration
- Input validation and sanitization

#### Database Security:

- Connection encryption (SSL)
- Read-only user for analytics
- Regular security updates
- Access logging

### 6.2 Data Privacy

#### User Data Protection:

- GDPR compliance measures
- Data retention policies
- User data export functionality
- Secure password handling

## Phase 7: Performance Optimization

### 7.1 Caching Strategy

#### Multi-Layer Caching:

1. **Browser Cache**: Static assets (24h)
2. **CDN Cache**: API responses (1h)
3. **Application Cache**: Team data (4h)
4. **Database Cache**: Query results (15min)

#### Redis Configuration:

```typescript
// Cache configuration
const cacheConfig = {
  teamStats: { ttl: 4 * 60 * 60 }, // 4 hours
  injuryData: { ttl: 2 * 60 * 60 }, // 2 hours
  scheduleData: { ttl: 24 * 60 * 60 }, // 24 hours
  recommendations: { ttl: 30 * 60 }, // 30 minutes
}
```

### 7.2 Database Optimization

#### Connection Pooling:

```typescript
// Prisma connection pooling
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  connectionLimit = 20
  poolTimeout = 30
}
```

## Phase 8: Deployment Checklist

### 8.1 Pre-Deployment

#### Development Complete:

- [ ] All real data integrations tested
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

#### Infrastructure Ready:

- [ ] Production database provisioned
- [ ] DNS configured
- [ ] SSL certificates installed
- [ ] Monitoring tools configured

### 8.2 Deployment Steps

#### Step-by-Step Deployment:

1. **Staging Deployment**

   ```bash
   git checkout develop
   git push origin develop
   # Triggers staging deployment automatically
   ```

2. **Production Migration**

   ```bash
   # Database backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

   # Deploy to production
   git checkout main
   git merge develop
   git push origin main
   # Requires manual approval in GitHub Actions
   ```

3. **Post-Deployment Verification**

   ```bash
   # Health check
   curl https://poolmanager.app/api/health

   # Data verification
   npm run verify:production
   ```

### 8.3 Rollback Plan

#### Automatic Rollback Triggers:

- Health check failures
- High error rates (>5%)
- Database connection issues

#### Manual Rollback Process:

```bash
# Revert to previous deployment
gh api repos/owner/poolmanager/deployments/{deployment_id}/statuses \
  --method POST \
  --field state='inactive'

# Database rollback (if needed)
psql $DATABASE_URL < backup_previous.sql
```

## Phase 9: Monitoring & Maintenance

### 9.1 Health Checks

#### Automated Monitoring:

- API endpoint health (`/api/health`)
- Database connectivity
- NFL data API status
- User authentication flow

### 9.2 Maintenance Schedule

#### Weekly Tasks:

- [ ] Review error logs
- [ ] Check API usage metrics
- [ ] Validate data accuracy
- [ ] Performance review

#### Monthly Tasks:

- [ ] Security updates
- [ ] Database optimization
- [ ] Cost analysis
- [ ] User feedback review

## Timeline

### Week 1: Infrastructure Setup

- Database provisioning
- Environment configuration
- Basic containerization

### Week 2: CI/CD Implementation

- GitHub Actions setup
- Staging environment deployment
- Testing automation

### Week 3: Production Deployment

- Production infrastructure setup
- Migration scripts execution
- Go-live preparation

### Week 4: Monitoring & Optimization

- Performance tuning
- Monitoring setup
- Documentation completion

## Success Criteria

### Technical Metrics:

- [ ] 99.9% uptime
- [ ] <200ms API response time
- [ ] Zero data loss during migration
- [ ] All real data sources operational

### Business Metrics:

- [ ] User satisfaction maintained
- [ ] Feature parity with development
- [ ] Cost within budget
- [ ] Scalability for peak usage

---

_This plan should be reviewed and updated as implementation progresses._
