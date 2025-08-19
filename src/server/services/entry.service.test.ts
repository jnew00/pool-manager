import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EntryService } from './entry.service'
import { PoolService } from './pool.service'
import { prisma } from '@/lib/prisma'

describe('EntryService', () => {
  let entryService: EntryService
  let poolService: PoolService
  let poolId: string

  beforeEach(async () => {
    entryService = new EntryService()
    poolService = new PoolService()

    // Create test pool for entries
    const pool = await poolService.createPool({
      name: 'Test Pool for Entries',
      type: 'ATS',
      season: 2024,
      buyIn: 50.0,
      maxEntries: 100,
      isActive: true,
    })

    poolId = pool.id
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.entry.deleteMany({
      where: { poolId },
    })
    await prisma.pool.deleteMany({
      where: {
        name: {
          startsWith: 'Test Pool',
        },
      },
    })
  })

  describe('createEntry', () => {
    it('should create a new entry with valid data', async () => {
      const entryData = {
        poolId,
        season: 2024,
      }

      const entry = await entryService.createEntry(entryData)

      expect(entry).toBeDefined()
      expect(entry.poolId).toBe(poolId)
      expect(entry.season).toBe(2024)
      expect(entry.id).toBeDefined()
    })

    it('should validate required fields', async () => {
      const invalidEntryData = {
        poolId: '',
        season: 0,
      }

      await expect(entryService.createEntry(invalidEntryData)).rejects.toThrow()
    })
  })

  describe('getEntryById', () => {
    it('should return entry by ID with pool relation', async () => {
      const entryData = {
        poolId,
        season: 2024,
      }

      const createdEntry = await entryService.createEntry(entryData)
      const foundEntry = await entryService.getEntryById(createdEntry.id)

      expect(foundEntry).toBeDefined()
      expect(foundEntry?.id).toBe(createdEntry.id)
      expect(foundEntry?.pool).toBeDefined()
      expect(foundEntry?.pool.name).toBe('Test Pool for Entries')
    })

    it('should return null for non-existent entry', async () => {
      const entry = await entryService.getEntryById('non-existent-id')
      expect(entry).toBeNull()
    })
  })

  describe('getEntriesByPool', () => {
    it('should return entries for specific pool', async () => {
      const entryData1 = { poolId, season: 2024 }
      const entryData2 = { poolId, season: 2025 } // Different season

      await entryService.createEntry(entryData1)
      await entryService.createEntry(entryData2)

      const entries = await entryService.getEntriesByPool(poolId)

      expect(entries.length).toBe(2)
      expect(entries[0].poolId).toBe(poolId)
      expect(entries[1].poolId).toBe(poolId)
    })
  })

  describe('deleteEntry', () => {
    it('should delete entry by ID', async () => {
      const entryData = {
        poolId,
        season: 2024,
      }

      const createdEntry = await entryService.createEntry(entryData)
      const result = await entryService.deleteEntry(createdEntry.id)

      expect(result).toBe(true)

      const deletedEntry = await entryService.getEntryById(createdEntry.id)
      expect(deletedEntry).toBeNull()
    })

    it('should return false when deleting non-existent entry', async () => {
      const result = await entryService.deleteEntry('non-existent-id')
      expect(result).toBe(false)
    })
  })
})
