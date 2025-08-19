import { NextResponse } from 'next/server'
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} from '@/lib/types/database'

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    field?: string
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  })
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  field?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(field && { field }),
      },
    },
    { status }
  )
}

/**
 * Handle service layer errors and convert to appropriate HTTP responses
 */
export function handleServiceError(error: unknown): NextResponse<ApiResponse> {
  console.error('Service error:', error)

  if (error instanceof ValidationError) {
    return createErrorResponse(
      error.message,
      400,
      'VALIDATION_ERROR',
      error.field
    )
  }

  if (error instanceof NotFoundError) {
    return createErrorResponse(error.message, 404, 'NOT_FOUND', error.resource)
  }

  if (error instanceof ConflictError) {
    return createErrorResponse(error.message, 409, 'CONFLICT', error.field)
  }

  if (error instanceof DatabaseError) {
    return createErrorResponse(
      'Database operation failed',
      500,
      'DATABASE_ERROR',
      error.code
    )
  }

  // Generic error fallback
  const message =
    error instanceof Error ? error.message : 'Internal server error'
  return createErrorResponse(message, 500, 'INTERNAL_ERROR')
}

/**
 * Validate request method
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): NextResponse<ApiResponse> | null {
  if (!allowedMethods.includes(request.method)) {
    return createErrorResponse(
      `Method ${request.method} not allowed`,
      405,
      'METHOD_NOT_ALLOWED'
    )
  }
  return null
}

/**
 * Parse and validate JSON request body
 */
export async function parseRequestBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body')
  }
}

/**
 * Extract query parameters with type safety
 */
export function extractQueryParams(
  url: URL
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}

  url.searchParams.forEach((value, key) => {
    if (params[key]) {
      // Convert to array if multiple values
      if (Array.isArray(params[key])) {
        ;(params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  })

  return params
}

/**
 * Validate required fields in request data
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(
    (field) =>
      data[field] === undefined || data[field] === null || data[field] === ''
  )

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      missingFields[0]
    )
  }
}

/**
 * Pagination utilities
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    maxLimit,
    Math.max(
      1,
      parseInt(searchParams.get('limit') || defaultLimit.toString(), 10)
    )
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}
