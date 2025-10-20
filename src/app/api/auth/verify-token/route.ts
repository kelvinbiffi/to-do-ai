import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Verifies an authentication token
 * Used by WhatsApp Bot or other integrations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    console.log('🔑 Verify token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Use simple database client (NO Supabase Auth)
    const supabase = createSimpleSupabaseClient()

    // Search for token in auth_tokens table
    const { data: tokens, error } = await supabase
      .from('auth_tokens')
      .select('id, user_id, token, is_active, expires_at, last_used_at')
      .eq('token', token)
      .eq('is_active', true)

    if (error || !tokens || tokens.length === 0) {
      console.error('❌ Token not found')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const authToken = tokens[0]

    // Check if token has expired
    if (authToken.expires_at && new Date(authToken.expires_at) < new Date()) {
      console.error('❌ Token expired')
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    }

    // Search for user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', authToken.user_id)

    if (userError || !users || users.length === 0) {
      console.error('❌ User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Update last_used_at
    await supabase
      .from('auth_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', authToken.id)

    console.log('✅ Valid token for user:', user.email)

    return NextResponse.json(
      {
        success: true,
        user_id: user.id,
        email: user.email,
        token_expires_at: authToken.expires_at,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
