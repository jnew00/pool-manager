// Re-export Prisma types for easy access
export type {
  Team,
  Game,
  Line,
  Pool,
  Entry,
  Pick,
  Result,
  Grade,
  Upload,
  MappingProfile,
  ModelWeights,
  PoolType,
  GameStatus,
  PickOutcome,
  UploadKind,
} from '@prisma/client'

// Common error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public resource?: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ConflictError'
  }
}