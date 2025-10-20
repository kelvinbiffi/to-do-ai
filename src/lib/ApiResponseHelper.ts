import { NextResponse } from 'next/server'

/**
 * Standardized API Response Helper
 * Ensures all API responses follow a consistent, debuggable format
 */

export interface ApiResponse<T = any> {
  success: boolean
  statusCode: number
  message?: string
  data?: T
  error?: string
  details?: Record<string, any>
  timestamp: string
  endpoint?: string
}

/**
 * Success Response
 * @param data The response data
 * @param message Optional success message
 * @param statusCode HTTP status code (default: 200)
 * @param endpoint Optional endpoint name for debugging
 */
export function successResponse<T = any>(
  data: T | null,
  message = 'Success',
  statusCode = 200,
  endpoint?: string
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    data: data || undefined,
    timestamp: new Date().toISOString(),
    endpoint,
  }

  // Log server-side only (won't be included in response)
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ [${endpoint || 'API'}] ${statusCode}`)
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Error Response
 * @param error Error message or Error object
 * @param statusCode HTTP status code (default: 500)
 * @param details Additional error details for debugging
 * @param endpoint Optional endpoint name for debugging
 */
export function errorResponse(
  error: string | Error,
  statusCode = 500,
  details?: Record<string, any>,
  endpoint?: string
): NextResponse {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = error instanceof Error ? error.stack : undefined

  const response: ApiResponse = {
    success: false,
    statusCode,
    error: errorMessage,
    details: {
      ...details,
      ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {}),
    },
    timestamp: new Date().toISOString(),
    endpoint,
  }

  // Remove empty details
  if (Object.keys(response.details || {}).length === 0) {
    delete response.details
  }

  // Log server-side only (won't be included in response)
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [${endpoint || 'API'}] ${statusCode} - ${errorMessage}`)
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Validation Error Response
 * @param fields Object with field names and their errors
 * @param endpoint Optional endpoint name for debugging
 */
export function validationErrorResponse(
  fields: Record<string, string>,
  endpoint?: string
): NextResponse {
  return errorResponse(
    'Validation failed',
    400,
    {
      validationErrors: fields,
      fields: Object.keys(fields),
    },
    endpoint
  )
}

/**
 * Database Error Response
 * @param error Supabase error
 * @param operation Operation that failed (GET, POST, UPDATE, DELETE)
 * @param endpoint Optional endpoint name for debugging
 */
export function databaseErrorResponse(
  error: any,
  operation: string,
  endpoint?: string
): NextResponse {
  const statusCode =
    error?.code === 'PGRST116'
      ? 404
      : error?.code === 'PGRST204'
        ? 204
        : error?.code === '23505'
          ? 409
          : 500

  const message =
    error?.code === 'PGRST116'
      ? 'Resource not found'
      : error?.code === '23505'
        ? 'Duplicate entry'
        : `Database ${operation} failed`

  return errorResponse(
    message,
    statusCode,
    {
      dbOperation: operation,
      dbCode: error?.code,
      dbMessage: error?.message,
      hint: error?.hint,
    },
    endpoint
  )
}
