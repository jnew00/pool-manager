import { DatabaseError, NotFoundError, ConflictError } from '@/lib/types/database'

/**
 * Base service class with common error handling utilities
 */
export abstract class BaseService {
  protected handlePrismaError(error: any): never {
    // Handle known Prisma error codes
    switch (error.code) {
      case 'P2002':
        throw new ConflictError(
          'Resource already exists',
          error.meta?.target?.[0]
        )
      case 'P2025':
        throw new NotFoundError('Resource not found')
      case 'P2003':
        throw new DatabaseError('Foreign key constraint failed')
      default:
        throw new DatabaseError(
          'Database operation failed',
          error.code,
          error
        )
    }
  }

  protected validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName} is required`)
    }
  }
}