# Database Maintenance Guide

## Data Loss Prevention

### Root Cause Analysis (2025-08-19)

**CRITICAL ISSUE IDENTIFIED**: The integration tests were inadvertently deleting ALL production data due to overly broad cleanup operations.

**What Happened:**

- `src/lib/test-utils/database.ts` contained `cleanupTestData()` function
- Function was called in `beforeEach()` of integration tests
- Original code deleted ALL lines, results, and games (not just test data):
  ```typescript
  await prisma.line.deleteMany({}) // ❌ DELETED ALL LINES
  await prisma.result.deleteMany({}) // ❌ DELETED ALL RESULTS
  await prisma.game.deleteMany({}) // ❌ DELETED ALL GAMES
  ```

**Fixed:**

- Updated cleanup functions to only delete test data based on naming conventions
- Test teams use prefixes: `TST`, `DEV`, `TEST`
- Test pools contain "Test" in name
- Lines are only deleted if associated with test pools/games

### Prevention Measures

1. **Safe Test Data Conventions**
   - All test teams MUST use prefixes: `TST`, `DEV`, `TEST`
   - All test pools MUST contain "Test" in the name
   - Never create test data with real NFL team abbreviations

2. **Database Backup Strategy**

   ```bash
   # Create backup before running tests
   npm run db:backup

   # Restore if needed
   npm run db:restore <backup-filename>
   ```

3. **Test Environment Isolation**
   - Consider using separate test database in CI/CD
   - Use `NODE_ENV=test` for test-specific database

## Backup and Recovery

### Creating Backups

```bash
# Manual backup
npm run db:backup

# This creates: backups/poolmanager-backup-YYYY-MM-DDTHH-MM-SS.sql
```

### Restoring from Backup

```bash
# List available backups
npm run db:restore

# Restore specific backup
npm run db:restore poolmanager-backup-2025-08-19T17-30-00.sql
```

### Backup Schedule Recommendations

- **Before major changes**: Always backup before schema migrations
- **Before test runs**: Backup if running integration tests
- **Weekly**: Create weekly backups of production data
- **Before deployments**: Backup before deploying new code

## Database Commands Reference

```bash
# Core database operations
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
npm run db:seed         # Seed with initial data
npm run db:reset        # ⚠️  DANGER: Resets entire database

# Backup and restore
npm run db:backup       # Create timestamped backup
npm run db:restore      # Restore from backup file

# Data management
npm run db:verify       # Verify data integrity
npm run db:add-test-games      # Add test games
npm run db:add-sample-lines    # Add sample betting lines
```

## Emergency Recovery Procedures

### If Data is Missing

1. **Check if data actually exists:**

   ```sql
   SELECT COUNT(*) FROM games;
   SELECT COUNT(*) FROM teams;
   SELECT COUNT(*) FROM pools;
   ```

2. **If data is gone, restore from backup:**

   ```bash
   npm run db:restore <latest-backup>
   ```

3. **If no backup available, re-seed:**
   ```bash
   npm run db:seed
   ```

### If Tests Corrupted Data

1. **Stop all test processes immediately**
2. **Check data integrity:**
   ```bash
   npm run db:verify
   ```
3. **Restore from backup if corruption confirmed**
4. **Fix test cleanup logic before running tests again**

## Monitoring and Alerts

### Data Integrity Checks

Run these queries periodically to ensure data consistency:

```sql
-- Check for orphaned records
SELECT COUNT(*) FROM games WHERE "homeTeamId" NOT IN (SELECT id FROM teams);
SELECT COUNT(*) FROM games WHERE "awayTeamId" NOT IN (SELECT id FROM teams);
SELECT COUNT(*) FROM picks WHERE "gameId" NOT IN (SELECT id FROM games);

-- Check for test data in production
SELECT * FROM teams WHERE "nflAbbr" LIKE 'TST%' OR "nflAbbr" IN ('DEV', 'TEST');
SELECT * FROM pools WHERE name LIKE '%Test%';
```

## Best Practices

1. **Never run `npm run db:reset` in production**
2. **Always backup before schema changes**
3. **Use descriptive test data naming conventions**
4. **Isolate test and production environments**
5. **Regular backup schedule (weekly minimum)**
6. **Monitor data counts for unexpected drops**
7. **Test backup/restore procedures regularly**

## Troubleshooting

### Backup Script Issues

If backup fails due to PostgreSQL version mismatch:

```bash
# Check versions
psql --version
pg_dump --version

# Use compatible pg_dump version or update tools
brew upgrade postgresql
```

### Connection Issues

```bash
# Test database connection
psql -h 127.0.0.1 -U poolmanager -d poolmanager -c "SELECT 1;"

# Check if PostgreSQL is running
brew services list | grep postgresql
```

### Performance Issues

```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('poolmanager'));

# Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```
