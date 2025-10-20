import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse } from '@/lib/ApiResponseHelper'

/**
 * GET /api/auth/token
 * Returns the auth token from httpOnly cookie for use in client-side API calls
 * Client will use this in Authorization: Bearer header for subsequent requests
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return errorResponse(
        'Unauthorized: No auth token found',
        401,
        { reason: 'Auth token not in cookies' },
        'GET /api/auth/token'
      )
    }

    return successResponse(
      { token: authToken },
      'Auth token retrieved',
      200,
      'GET /api/auth/token'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : 'Unknown error',
      500,
      { endpoint: 'GET /api/auth/token' },
      'GET /api/auth/token'
    )
  }
}
