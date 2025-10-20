import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateAuthToken } from '@/lib/auth-token'
import { successResponse, errorResponse, databaseErrorResponse } from '@/lib/ApiResponseHelper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse(
        'Validation failed',
        400,
        {
          validationErrors: {
            email: !email ? 'Email is required' : undefined,
            password: !password ? 'Password is required' : undefined,
          },
        },
        'POST /api/auth/login'
      )
    }

    const supabase = createSimpleSupabaseClient()

    // Search for user directly in users table
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)

    if (error || !users || users.length === 0) {
      return errorResponse(
        'Invalid email or password',
        401,
        { reason: 'User not found' },
        'POST /api/auth/login'
      )
    }

    const user = users[0]

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return errorResponse(
        'Invalid email or password',
        401,
        { reason: 'Password mismatch' },
        'POST /api/auth/login'
      )
    }

    // Generate new auth token
    const authToken = generateAuthToken()

    // Save new token in auth_tokens table (don't delete old ones to support multiple sessions)
    const { data: newToken, error: tokenError } = await supabase
      .from('auth_tokens')
      .insert({
        user_id: user.id,
        token: authToken,
        type: 'app',
        is_active: true,
      })
      .select()

    if (tokenError) {
      return databaseErrorResponse(tokenError, 'INSERT', 'POST /api/auth/login')
    }

    if (!newToken || newToken.length === 0) {
      return errorResponse(
        'Failed to create auth token',
        500,
        { reason: 'Token creation returned empty' },
        'POST /api/auth/login'
      )
    }

    // Check for WhatsApp number in header
    const whatsappNumber = request.headers.get('X-WhatsApp-Number')
    let redirectPath = '/'

    if (whatsappNumber) {
      // First, check if this number already exists
      const { data: existingNumber, error: checkError } = await supabase
        .from('user_whatsapp_numbers')
        .select('id, user_id')
        .eq('phone_number', whatsappNumber)
        .single()

      if (existingNumber) {
        // Number exists
        if (existingNumber.user_id !== user.id) {
          // Linked to different user - update to current user
          await supabase
            .from('user_whatsapp_numbers')
            .update({ user_id: user.id, last_used: new Date().toISOString() })
            .eq('phone_number', whatsappNumber)
        }
      } else {
        // Number doesn't exist - insert it
        await supabase
          .from('user_whatsapp_numbers')
          .insert({
            user_id: user.id,
            phone_number: whatsappNumber,
          })
          .select()
          .single()
      }

      redirectPath = `/whatsapp-authenticated?number=${encodeURIComponent(whatsappNumber)}`
    }

    const response = successResponse(
      {
        id: user.id,
        email: user.email,
        auth_token: authToken,
        redirect: redirectPath,
      },
      'Login successful',
      200,
      'POST /api/auth/login'
    )

    // Set user_id cookie (valid for 7 days)
    response.cookies.set({
      name: 'user_id',
      value: user.id,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Set auth_token cookie (valid for 7 days)
    response.cookies.set({
      name: 'auth_token',
      value: authToken,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err: any) {
    return errorResponse(
      err instanceof Error ? err : 'Unknown error',
      500,
      { endpoint: 'POST /api/auth/login' },
      'POST /api/auth/login'
    )
  }
}

