#!/usr/bin/env tsx

/**
 * Database backup script for PoolManager
 * Creates a timestamped backup of the PostgreSQL database
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
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

// Parse DATABASE_URL to extract connection details
const url = new URL(DATABASE_URL)
const host = url.hostname
const port = url.port || '5432'
const username = url.username
const password = url.password
const database = url.pathname.slice(1) // Remove leading slash

// Create backup directory if it doesn't exist
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

// Generate timestamp for backup filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupFilename = `poolmanager-backup-${timestamp}.sql`
const backupPath = path.join(BACKUP_DIR, backupFilename)

console.log('🗂️  Creating database backup...')
console.log(`📁 Backup location: ${backupPath}`)

try {
  // Set password environment variable for pg_dump
  const env = { ...process.env, PGPASSWORD: password }

  // Create backup using pg_dump
  execSync(
    `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-password --clean --if-exists --create > "${backupPath}"`,
    {
      env,
      stdio: 'inherit',
    }
  )

  console.log('✅ Database backup completed successfully!')
  console.log(`📄 Backup file: ${backupFilename}`)

  // Show backup file size
  const stats = require('fs').statSync(backupPath)
  const fileSizeInBytes = stats.size
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)
  console.log(`📊 Backup size: ${fileSizeInMB} MB`)
} catch (error) {
  console.error('❌ Backup failed:', error)
  process.exit(1)
}
