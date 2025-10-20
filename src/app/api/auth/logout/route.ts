import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { successResponse, errorResponse } from '@/lib/ApiResponseHelper'

/**
 * POST /api/auth/logout
 * Logout the current user by invalidating their auth token and clearing cookies
 * Supports multiple active sessions
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value
    const userId = cookieStore.get('user_id')?.value

    // If we have the auth token, invalidate it in the database
    if (authToken) {
      const supabase = createSimpleSupabaseClient()
      await supabase
        .from('auth_tokens')
        .update({ is_active: false })
        .eq('token', authToken)
    }

    const response = successResponse(
      { success: true },
      'Logged out successfully',
      200,
      'POST /api/auth/logout'
    )

    // Remove user_id cookie
    response.cookies.set({
      name: 'user_id',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    // Remove auth_token cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (err: any) {
    return errorResponse(
      err instanceof Error ? err : 'Unknown error',
      500,
      { endpoint: 'POST /api/auth/logout' },
      'POST /api/auth/logout'
    )
  }
}

