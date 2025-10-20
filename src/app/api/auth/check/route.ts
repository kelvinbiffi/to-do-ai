import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { logger } from '@/lib/Logger'

/**
 * GET /api/auth/check
 * Check if user is currently authenticated
 * Validates auth_token against database to ensure it's active
 * Returns 200 if authenticated, 401 if not
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const authToken = cookieStore.get('auth_token')?.value

    // Accept if either cookie is present (not requiring both)
    if (!userId && !authToken) {
      logger.debug('❌ [authCheck] User not authenticated (missing cookies)')
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // If we have auth_token, validate it against database
    if (authToken) {
      const supabase = createSimpleSupabaseClient()
      
      const { data: tokenRecord, error } = await supabase
        .from('auth_tokens')
        .select('user_id, is_active')
        .eq('token', authToken)
        .eq('is_active', true)
        .single()

      if (error || !tokenRecord) {
        logger.debug('❌ [authCheck] Auth token invalid or inactive')
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }

      logger.debug('✅ [authCheck] User authenticated via valid token:', tokenRecord.user_id)
      return NextResponse.json(
        {
          authenticated: true,
          userId: tokenRecord.user_id,
        },
        { status: 200 }
      )
    }

    // Fallback: user_id without token validation
    if (userId) {
      logger.debug('✅ [authCheck] User authenticated via user_id:', userId)
      return NextResponse.json(
        {
          authenticated: true,
          userId: userId,
        },
        { status: 200 }
      )
    }

  } catch (err: any) {
    logger.debug('❌ [authCheck] Error:', err.message)
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
