import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/auth/get-session
 * Returns the current user's auth token and ID from server cookies
 * Used by client-side components to get auth data
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value || ''
    const userId = cookieStore.get('user_id')?.value || ''

    if (!authToken || !userId) {
      return NextResponse.json(
        { error: 'Not authenticated', authToken: '', userId: '' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authToken,
      userId,
      success: true,
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Failed to get session', success: false },
      { status: 500 }
    )
  }
}
