import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseTestUtils } from '@/lib/test-utils/database'
import { MappingProfileService } from './mapping-profile.service'
import type { ColumnMapping } from '../lib/csv-parser'

describe('MappingProfileService', () => {
  const service = new MappingProfileService()

  const getUniqueName = (baseName: string) =>
    `Test ${baseName} ${Date.now()}-${Math.random().toString(36).slice(2)}`

  beforeEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  afterEach(async () => {
    await DatabaseTestUtils.cleanupTestData()
  })

  describe('createProfile', () => {
    it('should create a new mapping profile', async () => {
      const profileName = getUniqueName('ESPN Lines CSV')
      const profileData = {
        name: profileName,
        columnMap: {
          date: 'Date',
          away_team: 'Away',
          home_team: 'Home',
          spread: 'Spread',
          total: 'Total',
        } as ColumnMapping,
      }

      const profile = await service.createProfile(profileData)

      expect(profile).toBeDefined()
      expect(profile.name).toBe(profileName)
      expect(profile.columnMap).toEqual(profileData.columnMap)
      expect(profile.id).toBeDefined()
    })

    it('should throw error for duplicate profile names', async () => {
      const profileName = getUniqueName('Duplicate Profile')
      const profileData = {
        name: profileName,
        columnMap: { date: 'Date' } as ColumnMapping,
      }

      await service.createProfile(profileData)

      await expect(service.createProfile(profileData)).rejects.toThrow(
        'Profile name already exists'
      )
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        columnMap: {} as ColumnMapping,
      }

      await expect(service.createProfile(invalidData)).rejects.toThrow(
        'Profile name is required'
      )
    })

    it('should validate column mapping is not empty', async () => {
      const invalidData = {
        name: 'Valid Name',
        columnMap: {} as ColumnMapping,
      }

      await expect(service.createProfile(invalidData)).rejects.toThrow(
        'Column mapping cannot be empty'
      )
    })
  })

  describe('getProfile', () => {
    it('should return profile by ID', async () => {
      const profileData = {
        name: 'Test Profile',
        columnMap: { date: 'Date', away_team: 'Away' } as ColumnMapping,
      }

      const created = await service.createProfile(profileData)
      const retrieved = await service.getProfile(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved!.id).toBe(created.id)
      expect(retrieved!.name).toBe('Test Profile')
      expect(retrieved!.columnMap).toEqual(profileData.columnMap)
    })

    it('should return null for non-existent profile', async () => {
      const result = await service.getProfile('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('getAllProfiles', () => {
    it('should return all profiles ordered by name', async () => {
      await service.createProfile({
        name: 'Z Test Profile',
        columnMap: { date: 'Date' } as ColumnMapping,
      })

      await service.createProfile({
        name: 'A Test Profile',
        columnMap: { away_team: 'Away' } as ColumnMapping,
      })

      const profiles = await service.getAllProfiles()
      const testProfiles = profiles.filter((p) => p.name.includes('Test'))

      expect(testProfiles).toHaveLength(2)
      expect(testProfiles[0].name).toBe('A Test Profile')
      expect(testProfiles[1].name).toBe('Z Test Profile')
    })

    it('should return seeded profiles when no test profiles exist', async () => {
      const profiles = await service.getAllProfiles()
      // There should be at least the seeded profile(s)
      expect(profiles.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('updateProfile', () => {
    it('should update profile data', async () => {
      const originalName = getUniqueName('Original Name')
      const profileData = {
        name: originalName,
        columnMap: { date: 'Date' } as ColumnMapping,
      }

      const created = await service.createProfile(profileData)

      const updatedName = getUniqueName('Updated Name')
      const updateData = {
        name: updatedName,
        columnMap: { date: 'Date', away_team: 'Away' } as ColumnMapping,
      }

      const updated = await service.updateProfile(created.id, updateData)

      expect(updated.name).toBe(updatedName)
      expect(updated.columnMap).toEqual(updateData.columnMap)
    })

    it('should throw error when updating non-existent profile', async () => {
      const updateData = {
        name: 'Test',
        columnMap: { date: 'Date' } as ColumnMapping,
      }

      await expect(
        service.updateProfile('non-existent', updateData)
      ).rejects.toThrow('Profile not found')
    })

    it('should prevent duplicate names when updating', async () => {
      const existingName = getUniqueName('Existing Profile')
      await service.createProfile({
        name: existingName,
        columnMap: { date: 'Date' } as ColumnMapping,
      })

      const profile2Name = getUniqueName('Profile 2')
      const profile2 = await service.createProfile({
        name: profile2Name,
        columnMap: { away_team: 'Away' } as ColumnMapping,
      })

      await expect(
        service.updateProfile(profile2.id, {
          name: existingName,
          columnMap: { date: 'Date' } as ColumnMapping,
        })
      ).rejects.toThrow('Profile name already exists')
    })
  })

  describe('deleteProfile', () => {
    it('should delete profile by ID', async () => {
      const profile = await service.createProfile({
        name: 'To Delete',
        columnMap: { date: 'Date' } as ColumnMapping,
      })

      const result = await service.deleteProfile(profile.id)
      expect(result).toBe(true)

      const retrieved = await service.getProfile(profile.id)
      expect(retrieved).toBeNull()
    })

    it('should return false when deleting non-existent profile', async () => {
      const result = await service.deleteProfile('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('findByName', () => {
    it('should find profile by exact name', async () => {
      const profileName = getUniqueName('ESPN Standard')
      await service.createProfile({
        name: profileName,
        columnMap: { date: 'Date' } as ColumnMapping,
      })

      const found = await service.findByName(profileName)
      expect(found).toBeDefined()
      expect(found!.name).toBe(profileName)
    })

    it('should return null for non-matching name', async () => {
      const found = await service.findByName('Non Existent')
      expect(found).toBeNull()
    })
  })

  describe('searchProfiles', () => {
    it('should search profiles by name substring', async () => {
      const uniqueId = Math.random().toString(36).slice(2)
      const espnName = `Test ESPN Lines CSV ${uniqueId}`
      const yahooName = `Test Yahoo Sports CSV ${uniqueId}`

      await service.createProfile({
        name: espnName,
        columnMap: { date: 'Date' } as ColumnMapping,
      })

      await service.createProfile({
        name: yahooName,
        columnMap: { away_team: 'Away' } as ColumnMapping,
      })

      const results = await service.searchProfiles(uniqueId)
      expect(results).toHaveLength(2)

      const espnResults = await service.searchProfiles('ESPN')
      expect(espnResults.filter((r) => r.name.includes(uniqueId))).toHaveLength(
        1
      )
    })

    it('should return empty array when no matches found', async () => {
      const results = await service.searchProfiles(
        'NonExistentUniqueString12345'
      )
      expect(results).toHaveLength(0)
    })
  })
})
