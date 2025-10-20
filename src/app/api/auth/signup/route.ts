import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { generateAuthToken } from '@/lib/auth-token'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('📝 Signup:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
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
      console.error('❌ Error creating user:', error.message)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      )
    }

    // Generate authentication token for WhatsApp
    const authToken = generateAuthToken()

    // Insert token into auth_tokens table
    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .insert({
        user_id: userId,
        token: authToken,
        type: 'whatsapp',
      })

    if (tokenError) {
      console.error('⚠️ Error creating token:', tokenError.message)
    } else {
      console.log('✅ Token created successfully')
    }

    console.log('✅ User created:', userId)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email: email,
          auth_token: authToken,
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

