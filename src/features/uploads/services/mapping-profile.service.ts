import { prisma } from '@/lib/prisma'
import type { MappingProfile } from '@/lib/types/database'
import type { ColumnMapping } from '../lib/csv-parser'

export interface CreateMappingProfileData {
  name: string
  columnMap: ColumnMapping
}

export interface UpdateMappingProfileData {
  name?: string
  columnMap?: ColumnMapping
}

export class MappingProfileService {
  /**
   * Create a new mapping profile
   */
  async createProfile(data: CreateMappingProfileData): Promise<MappingProfile> {
    // Validate input
    if (!data.name || data.name.trim() === '') {
      throw new Error('Profile name is required')
    }

    if (!data.columnMap || Object.keys(data.columnMap).length === 0) {
      throw new Error('Column mapping cannot be empty')
    }

    // Check for duplicate names
    const existing = await this.findByName(data.name)
    if (existing) {
      throw new Error('Profile name already exists')
    }

    const profile = await prisma.mappingProfile.create({
      data: {
        name: data.name.trim(),
        columnMap: data.columnMap,
      },
    })

    return profile
  }

  /**
   * Get profile by ID
   */
  async getProfile(id: string): Promise<MappingProfile | null> {
    return await prisma.mappingProfile.findUnique({
      where: { id },
    })
  }

  /**
   * Get all profiles ordered by name
   */
  async getAllProfiles(): Promise<MappingProfile[]> {
    return await prisma.mappingProfile.findMany({
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Update profile data
   */
  async updateProfile(id: string, data: UpdateMappingProfileData): Promise<MappingProfile> {
    // Check if profile exists
    const existing = await this.getProfile(id)
    if (!existing) {
      throw new Error('Profile not found')
    }

    // Check for duplicate names if name is being updated
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.findByName(data.name)
      if (duplicate && duplicate.id !== id) {
        throw new Error('Profile name already exists')
      }
    }

    const updatedProfile = await prisma.mappingProfile.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.columnMap && { columnMap: data.columnMap }),
      },
    })

    return updatedProfile
  }

  /**
   * Delete profile by ID
   */
  async deleteProfile(id: string): Promise<boolean> {
    try {
      await prisma.mappingProfile.delete({
        where: { id },
      })
      return true
    } catch (error) {
      // Profile not found
      return false
    }
  }

  /**
   * Find profile by exact name
   */
  async findByName(name: string): Promise<MappingProfile | null> {
    return await prisma.mappingProfile.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    })
  }

  /**
   * Search profiles by name substring
   */
  async searchProfiles(query: string): Promise<MappingProfile[]> {
    return await prisma.mappingProfile.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    })
  }
}