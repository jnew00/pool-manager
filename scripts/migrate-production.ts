#!/usr/bin/env tsx

/**
 * Production Migration Script
 * Handles safe migration of database and real data integration
 */

import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

interface MigrationConfig {
  backupBefore: boolean
  validateAfter: boolean
  rollbackOnFailure: boolean
  dryRun: boolean
}

class ProductionMigrator {
  private config: MigrationConfig

  constructor(config: MigrationConfig) {
    this.config = config
  }

  async run() {
    console.log('🚀 Starting Production Migration...\n')

    try {
      if (this.config.backupBefore) {
        await this.createBackup()
      }

      if (this.config.dryRun) {
        console.log('🔍 DRY RUN MODE - No actual changes will be made\n')
        await this.validateMigrations()
        return
      }

      await this.runMigrations()
      await this.migrateExistingData()

      if (this.config.validateAfter) {
        await this.validateDataIntegrity()
      }

      console.log('✅ Production migration completed successfully!')
    } catch (error) {
      console.error('❌ Migration failed:', error)

      if (this.config.rollbackOnFailure) {
        await this.rollback()
      }

      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  }

  private async createBackup() {
    console.log('📦 Creating database backup...')

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = `backup_${timestamp}.sql`

    try {
      await execAsync(
        `pg_dump "${process.env.DATABASE_URL}" > backups/${backupFile}`
      )
      console.log(`✅ Backup created: ${backupFile}\n`)
    } catch (error) {
      throw new Error(`Backup failed: ${error}`)
    }
  }

  private async validateMigrations() {
    console.log('🔍 Validating migration scripts...')

    try {
      // Check if migrations are valid
      await execAsync('npx prisma migrate diff --preview-feature')
      console.log('✅ Migration scripts are valid\n')
    } catch (error) {
      throw new Error(`Migration validation failed: ${error}`)
    }
  }

  private async runMigrations() {
    console.log('⚡ Running database migrations...')

    try {
      await execAsync('npx prisma migrate deploy')
      console.log('✅ Database migrations completed\n')
    } catch (error) {
      throw new Error(`Migration deployment failed: ${error}`)
    }
  }

  private async migrateExistingData() {
    console.log('🔄 Migrating existing data to support real data sources...')

    // Update existing survivor entries with data source indicators
    const entriesUpdated = await prisma.survivorEntry.updateMany({
      where: {
        dataSourceType: null,
      },
      data: {
        dataSourceType: 'MOCK',
        dataSourceMessage:
          'Historical entry created before real data integration',
      },
    })

    console.log(
      `✅ Updated ${entriesUpdated.count} survivor entries with data source tracking`
    )

    // Initialize data availability tracking for current season
    const currentSeason = new Date().getFullYear()
    const currentWeek = this.getCurrentNFLWeek()

    await prisma.dataAvailability.createMany({
      data: [
        {
          id: `${currentSeason}-${currentWeek}-team_stats-espn`,
          season: currentSeason,
          week: currentWeek,
          dataType: 'team_stats',
          provider: 'ESPN',
          available: true,
          message: 'ESPN NFL Stats API available',
        },
        {
          id: `${currentSeason}-${currentWeek}-injuries-espn`,
          season: currentSeason,
          week: currentWeek,
          dataType: 'injuries',
          provider: 'ESPN',
          available: true,
          message: 'ESPN Injury API available',
        },
        {
          id: `${currentSeason}-${currentWeek}-schedule-espn`,
          season: currentSeason,
          week: currentWeek,
          dataType: 'schedule',
          provider: 'ESPN',
          available: true,
          message: 'ESPN Schedule API available',
        },
      ],
      skipDuplicates: true,
    })

    console.log('✅ Initialized data availability tracking\n')
  }

  private async validateDataIntegrity() {
    console.log('🔍 Validating data integrity...')

    // Check that all tables exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    const requiredTables = [
      'api_configurations',
      'data_source_logs',
      'data_availability',
      'survivor_entries',
      'pools',
      'games',
      'teams',
    ]

    for (const table of requiredTables) {
      const exists = tables.some((t) => t.tablename === table)
      if (!exists) {
        throw new Error(`Required table ${table} is missing`)
      }
    }

    // Verify data source configuration
    const apiConfigs = await prisma.apiConfiguration.count()
    if (apiConfigs === 0) {
      throw new Error('No API configurations found')
    }

    // Check survivor entries have data source tracking
    const entriesWithoutDataSource = await prisma.survivorEntry.count({
      where: { dataSourceType: null },
    })

    if (entriesWithoutDataSource > 0) {
      throw new Error(
        `${entriesWithoutDataSource} entries missing data source tracking`
      )
    }

    console.log('✅ Data integrity validation passed\n')
  }

  private async rollback() {
    console.log('🔄 Attempting rollback...')

    try {
      // Find the most recent backup
      const { stdout } = await execAsync('ls -t backups/backup_*.sql | head -1')
      const latestBackup = stdout.trim()

      if (!latestBackup) {
        throw new Error('No backup file found for rollback')
      }

      console.log(`📦 Restoring from backup: ${latestBackup}`)
      await execAsync(`psql "${process.env.DATABASE_URL}" < ${latestBackup}`)

      console.log('✅ Rollback completed successfully')
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      console.log('⚠️  Manual intervention required!')
    }
  }

  private getCurrentNFLWeek(): number {
    // Simplified week calculation - in production, this would be more sophisticated
    const now = new Date()
    const seasonStart = new Date(now.getFullYear(), 8, 1) // September 1st approximation
    const diffTime = now.getTime() - seasonStart.getTime()
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.max(1, Math.min(18, diffWeeks))
  }
}

// Script execution
async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const skipBackup = args.includes('--skip-backup')
  const noValidation = args.includes('--no-validation')
  const noRollback = args.includes('--no-rollback')

  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode\n')
  }

  const config: MigrationConfig = {
    backupBefore: !skipBackup && !isDryRun,
    validateAfter: !noValidation,
    rollbackOnFailure: !noRollback && !isDryRun,
    dryRun: isDryRun,
  }

  const migrator = new ProductionMigrator(config)
  await migrator.run()
}

// Environment checks
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

if (
  process.env.NODE_ENV !== 'production' &&
  !process.argv.includes('--force')
) {
  console.error('❌ This script should only run in production environment')
  console.log('Use --force flag to override this check')
  process.exit(1)
}

// Run the migration
main().catch(console.error)
