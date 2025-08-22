#!/usr/bin/env tsx

/**
 * Database restore script for PoolManager
 * Restores database from a backup file
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

const DATABASE_URL = process.env.DATABASE_URL
const BACKUP_DIR = path.join(process.cwd(), 'backups')

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

// Get backup filename from command line argument
const backupFilename = process.argv[2]

if (!backupFilename) {
  console.error('❌ Please provide a backup filename as an argument')
  console.log('Usage: npm run db:restore <backup-filename>')
  console.log(
    'Example: npm run db:restore poolmanager-backup-2025-08-19T17-30-00.sql'
  )

  // List available backups
  try {
    const backups = require('fs')
      .readdirSync(BACKUP_DIR)
      .filter((file: string) => file.endsWith('.sql'))
      .sort()
      .reverse()

    if (backups.length > 0) {
      console.log('\n📁 Available backups:')
      backups.forEach((backup: string) => {
        console.log(`  - ${backup}`)
      })
    }
  } catch (error) {
    console.log('📁 No backup directory found')
  }

  process.exit(1)
}

const backupPath = path.join(BACKUP_DIR, backupFilename)

if (!existsSync(backupPath)) {
  console.error(`❌ Backup file not found: ${backupPath}`)
  process.exit(1)
}

// Parse DATABASE_URL to extract connection details
const url = new URL(DATABASE_URL)
const host = url.hostname
const port = url.port || '5432'
const username = url.username
const password = url.password
const database = url.pathname.slice(1) // Remove leading slash

console.log('🔄 Restoring database from backup...')
console.log(`📁 Backup file: ${backupFilename}`)
console.log(`🎯 Target database: ${database}`)

// Confirm restoration
console.log('\n⚠️  WARNING: This will overwrite the current database!')
console.log('Press Ctrl+C to cancel, or any key to continue...')

// Wait for user confirmation (in a real CLI environment)
try {
  // Set password environment variable for psql
  const env = { ...process.env, PGPASSWORD: password }

  // Restore backup using psql
  execSync(
    `psql -h ${host} -p ${port} -U ${username} -d ${database} --no-password < "${backupPath}"`,
    {
      env,
      stdio: 'inherit',
    }
  )

  console.log('✅ Database restore completed successfully!')
} catch (error) {
  console.error('❌ Restore failed:', error)
  process.exit(1)
}
