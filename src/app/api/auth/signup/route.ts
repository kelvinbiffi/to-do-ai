import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { generateAuthToken } from '@/lib/auth-token'
import { successResponse, errorResponse, databaseErrorResponse } from '@/lib/ApiResponseHelper'
import { logger } from '@/lib/Logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    logger.debug('📝 Signup:', email)

    if (!email || !password) {
      return errorResponse(
        'Email and password are required',
        400,
        { validationErrors: { email: !email ? 'Email is required' : undefined, password: !password ? 'Password is required' : undefined } },
        'POST /api/auth/signup'
      )
    }

    if (password.length < 6) {
      return errorResponse(
        'Password must be at least 6 characters',
        400,
        { validationErrors: { password: 'Minimum 6 characters required' } },
        'POST /api/auth/signup'
      )
    }

    // Use simple database client (NO Supabase Auth)
    const supabase = createSimpleSupabaseClient()

    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)

    if (existingUsers && existingUsers.length > 0) {
      return errorResponse(
        'Email already registered',
        409,
        { reason: 'Duplicate email' },
        'POST /api/auth/signup'
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = randomUUID()

    // Insert user into users table
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        password_hash: hashedPassword,
      })

    if (error) {
      logger.debug('❌ Error creating user:', error.message)
      return databaseErrorResponse(error, 'INSERT', 'POST /api/auth/signup')
    }

    // Generate authentication token
    const authToken = generateAuthToken()

    // Insert token into auth_tokens table
    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .insert({
        user_id: userId,
        token: authToken,
        type: 'app',
        is_active: true,
      })

    if (tokenError) {
      logger.debug('⚠️ Error creating token:', tokenError.message)
    } else {
      logger.debug('✅ Token created successfully')
    }

    logger.debug('✅ User created:', userId)

    return successResponse(
      {
        id: userId,
        email: email,
        auth_token: authToken,
      },
      'Account created successfully',
      201,
      'POST /api/auth/signup'
    )
  } catch (err: any) {
    logger.debug('❌ Error:', err.message)
    return errorResponse(
      err instanceof Error ? err : 'Unknown error',
      500,
      { endpoint: 'POST /api/auth/signup' },
      'POST /api/auth/signup'
    )
  }
}

