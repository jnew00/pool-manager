# PoolManager Deployment Guide

## Overview

Complete guide for deploying PoolManager to production with real NFL data integration.

## Prerequisites

### Required Accounts & Services

- [ ] **Database**: PostgreSQL 15+ (AWS RDS, DigitalOcean, or Neon)
- [ ] **Hosting**: Vercel, DigitalOcean App Platform, or Docker
- [ ] **Monitoring**: Sentry account for error tracking
- [ ] **API Keys**: MySportsFeeds API key (optional but recommended)
- [ ] **Domain**: Custom domain with SSL certificate

### Local Setup

```bash
# Clone the repository
git clone https://github.com/your-org/poolmanager.git
cd poolmanager

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Setup database
npx prisma db push
npm run db:seed
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### 1.1 Database Setup

```bash
# Create production database
createdb poolmanager_prod

# Set up environment variables in Vercel dashboard:
# - DATABASE_URL
# - DIRECT_URL
# - NEXTAUTH_SECRET
# - MYSPORTSFEEDS_API_KEY
```

#### 1.2 Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 1.3 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Run production migrations
DATABASE_URL="your-prod-url" npx tsx scripts/migrate-production.ts
```

### Option 2: DigitalOcean App Platform

#### 2.1 App Spec Configuration

```yaml
# .do/app.yaml
name: poolmanager
services:
  - name: web
    source_dir: /
    github:
      repo: your-org/poolmanager
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    env:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
databases:
  - name: db
    engine: PG
    version: '15'
    size_slug: basic-xs
    num_nodes: 1
```

#### 2.2 Deploy

```bash
# Install doctl
brew install doctl

# Create app
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
```

### Option 3: Self-Hosted Docker

#### 3.1 Server Setup

```bash
# On your server (Ubuntu/Debian)
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Create project directory
mkdir -p /opt/poolmanager
cd /opt/poolmanager
```

#### 3.2 Environment Configuration

```bash
# Create .env file
cat > .env << EOF
DB_PASSWORD=secure_database_password
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-char-secret
MYSPORTSFEEDS_API_KEY=your-api-key
REDIS_PASSWORD=secure_redis_password
EOF
```

#### 3.3 Deploy with Docker Compose

```bash
# Copy docker-compose.prod.yml to server
scp docker-compose.prod.yml user@server:/opt/poolmanager/

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec poolmanager-app npx tsx scripts/migrate-production.ts
```

## Environment Configuration

### Production Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="32-character-random-string"

# Optional but recommended
MYSPORTSFEEDS_API_KEY="your-api-key"
SENTRY_DSN="your-sentry-dsn"
REDIS_URL="redis://localhost:6379"

# Performance tuning
CACHE_TTL_HOURS="4"
RATE_LIMIT_PER_MINUTE="100"
DATABASE_POOL_SIZE="20"
```

### Security Configuration

```bash
# Enable security features
SECURE_HEADERS="true"
API_RATE_LIMIT="true"
CORS_ORIGIN="https://your-domain.com"

# Logging and monitoring
LOG_LEVEL="info"
ENABLE_API_LOGGING="true"
```

## Database Migration

### Pre-Migration Checklist

- [ ] Create database backup
- [ ] Test migration script in staging
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window

### Migration Process

```bash
# 1. Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Run migration (production)
NODE_ENV=production npx tsx scripts/migrate-production.ts

# 3. Verify migration
npm run verify:production
```

### Rollback (if needed)

```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql

# Redeploy previous version
git checkout previous-stable-tag
vercel --prod
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# API health
curl https://your-domain.com/api/health

# Data sources status
curl https://your-domain.com/api/data-sources

# Database connectivity
curl https://your-domain.com/api/debug/db-status
```

### 2. Real Data Integration Test

```bash
# Test NFL data endpoints
curl "https://your-domain.com/api/recommendations?poolId=1&week=1"

# Verify data sources
curl "https://your-domain.com/api/debug/data-status"
```

### 3. User Authentication Test

```bash
# Test auth endpoints
curl -X POST "https://your-domain.com/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## Monitoring Setup

### 1. Sentry Error Tracking

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### 2. Uptime Monitoring

```bash
# Use UptimeRobot or similar service to monitor:
# - https://your-domain.com/api/health
# - https://your-domain.com/api/data-sources
# - Main application pages
```

### 3. Performance Monitoring

```bash
# Key metrics to track:
# - API response times
# - Database query performance
# - NFL API success rates
# - User session duration
```

## SSL/TLS Configuration

### Vercel (Automatic)

Vercel handles SSL certificates automatically for custom domains.

### Manual SSL Setup

```bash
# Using Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Run these queries in production database
ANALYZE;
REINDEX DATABASE poolmanager;

-- Monitor slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 10;
```

### 2. Caching Configuration

```typescript
// Redis caching setup
const cacheConfig = {
  teamStats: 4 * 60 * 60, // 4 hours
  injuryData: 2 * 60 * 60, // 2 hours
  recommendations: 30 * 60, // 30 minutes
}
```

### 3. CDN Setup

```bash
# Vercel includes CDN automatically
# For other platforms, configure CloudFlare or AWS CloudFront
```

## Backup Strategy

### Automated Database Backups

```bash
#!/bin/bash
# /opt/poolmanager/backup.sh

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="poolmanager_backup_$DATE.sql"

pg_dump $DATABASE_URL > "$BACKUP_DIR/$FILENAME"

# Compress backup
gzip "$BACKUP_DIR/$FILENAME"

# Delete backups older than 7 days
find $BACKUP_DIR -name "poolmanager_backup_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR/$FILENAME.gz" s3://your-backup-bucket/
```

### Cron Schedule

```bash
# Daily backups at 2 AM
0 2 * * * /opt/poolmanager/backup.sh

# Weekly full backups at 1 AM Sunday
0 1 * * 0 /opt/poolmanager/backup-full.sh
```

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database status
pg_isready -h your-db-host -p 5432 -U username

# Check connection pooling
SELECT * FROM pg_stat_activity WHERE datname = 'poolmanager';
```

#### NFL API Issues

```bash
# Test ESPN API directly
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams"

# Check API logs
grep "ESPN" /var/log/poolmanager/api.log
```

#### Performance Issues

```bash
# Check server resources
htop
df -h

# Database performance
SELECT * FROM pg_stat_database WHERE datname = 'poolmanager';
```

### Recovery Procedures

#### Application Recovery

```bash
# Restart application (Docker)
docker-compose -f docker-compose.prod.yml restart app

# Check logs
docker logs poolmanager-app --tail 100

# Database recovery
docker-compose -f docker-compose.prod.yml restart db
```

#### Data Recovery

```bash
# Restore from backup
gunzip poolmanager_backup_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < poolmanager_backup_YYYYMMDD_HHMMSS.sql
```

## Scaling Considerations

### Horizontal Scaling

```bash
# Load balancer configuration
# Multiple app instances
# Read replicas for database
```

### Vertical Scaling

```bash
# Monitor these metrics:
# - CPU usage > 80%
# - Memory usage > 90%
# - Database connections > 80% of limit
```

## Maintenance Schedule

### Weekly Tasks

- [ ] Review error logs and fix critical issues
- [ ] Check API usage and rate limits
- [ ] Validate real data accuracy
- [ ] Performance monitoring review

### Monthly Tasks

- [ ] Security updates
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Backup verification
- [ ] Cost analysis and optimization

### Seasonal Tasks

- [ ] NFL season preparation (August)
- [ ] Off-season data source updates (March)
- [ ] Annual security audit
- [ ] Infrastructure cost review

## Support and Resources

### Documentation

- [Production Migration Plan](PRODUCTION_MIGRATION_PLAN.md)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)

### Emergency Contacts

- Database Issues: DBA team
- Infrastructure: DevOps team
- Application: Development team

### Monitoring Dashboards

- Application: https://sentry.io/your-project
- Infrastructure: Your monitoring service
- Uptime: UptimeRobot dashboard

---

_Last Updated: 2025-08-22_
