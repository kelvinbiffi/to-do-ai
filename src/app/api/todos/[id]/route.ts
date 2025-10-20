import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse, databaseErrorResponse } from '@/lib/ApiResponseHelper'
import { logger } from '@/lib/Logger'

/**
 * Validates the auth token from the Authorization header
 * Queries the auth_tokens table to get the user_id
 */
async function validateAuthToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    logger.error('❌ [validateAuthToken] No Authorization header or invalid format')
    return null
  }
  
  const token = authHeader.substring(7)
  logger.debug('🔑 [validateAuthToken] Checking token:', token.substring(0, 20) + '...')
  logger.debug('🔑 [validateAuthToken] Full token length:', token.length)
  
  try {
    const supabase = createSimpleSupabaseClient()
    
    // First, let's check if the table has ANY records
    const { data: allTokens, error: allError } = await supabase
      .from('auth_tokens')
      .select('token, is_active')
      .limit(1)
    
    logger.debug('📊 [validateAuthToken] Table check:', { hasRecords: allTokens?.length || 0, error: allError?.message })
    
    // Query auth_tokens table to find which user this token belongs to
    // ONLY accept ACTIVE tokens
    const { data: authTokens, error } = await supabase
      .from('auth_tokens')
      .select('user_id, token, is_active')
      .eq('token', token)
      .eq('is_active', true)
    
    if (error) {
      logger.error('❌ [validateAuthToken] Database error:', error.message)
      logger.error('❌ [validateAuthToken] Error code:', error.code)
      logger.error('❌ [validateAuthToken] Error details:', JSON.stringify(error))
      return null
    }
    
    logger.debug('📊 [validateAuthToken] Query result rows:', authTokens?.length || 0)
    if (authTokens && authTokens.length > 0) {
      logger.debug('📊 [validateAuthToken] First token record:', { token: authTokens[0].token?.substring(0, 20) + '...', is_active: authTokens[0].is_active })
    }
    
    // Check if we got results
    if (!authTokens || authTokens.length === 0) {
      logger.error('❌ [validateAuthToken] Token not found or inactive')
      logger.debug('🔍 [validateAuthToken] Token searched:', token.substring(0, 20) + '...')
      
      // Try searching without the is_active filter to see if token exists at all
      const { data: anyToken } = await supabase
        .from('auth_tokens')
        .select('token, is_active')
        .eq('token', token)
      
      logger.debug('🔍 [validateAuthToken] Token exists in DB (any status)?:', anyToken?.length || 0)
      if (anyToken && anyToken.length > 0) {
        logger.debug('🔍 [validateAuthToken] Token found but is_active =', anyToken[0].is_active)
      }
      
      return null
    }

    if (authTokens.length > 1) {
      logger.warn('⚠️ [validateAuthToken] Multiple active tokens found (unexpected)')
    }
    
    const tokenRecord = authTokens[0]
    
    if (!tokenRecord.is_active) {
      logger.error('❌ [validateAuthToken] Token is inactive')
      return null
    }
    
    // Return user_id associated with this token
    logger.debug('✅ [validateAuthToken] Token is ACTIVE! User ID:', tokenRecord.user_id)
    return tokenRecord.user_id
  } catch (err) {
    logger.error('❌ [validateAuthToken] Exception:', err)
    return null
  }
}

/**
 * GET /api/todos/[id] - Fetch a single todo by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await validateAuthToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing auth token' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    const supabase = createSimpleSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Todo not found' },
          { status: 404 }
        )
      }
      logger.error('❌ [GET /api/todos/[id]] Error:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch todo' },
        { status: 500 }
      )
    }
    
    logger.debug(`✅ [GET /api/todos/[id]] Fetched todo: ${id}`)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    logger.error('❌ [GET /api/todos/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/todos/[id] - Update a todo
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logger.debug('📝 [PATCH /api/todos/[id]] Request received')
    const userId = await validateAuthToken(request)
    
    if (!userId) {
      logger.debug('❌ [PATCH /api/todos/[id]] Auth validation failed')
      return errorResponse(
        'Unauthorized: Invalid or missing auth token',
        401,
        { reason: 'Auth token validation failed' },
        'PATCH /api/todos/[id]'
      )
    }

    logger.debug('✅ [PATCH /api/todos/[id]] Auth validated, user:', userId)
    const { id } = await params
    const body = await request.json()
    
    const allowedFields = ['title', 'description', 'status']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return errorResponse(
        'Validation failed',
        400,
        {
          validationErrors: {
            body: 'At least one field must be provided',
          },
          allowedFields,
        },
        'PATCH /api/todos/[id]'
      )
    }
    
    logger.debug('📊 [PATCH /api/todos/[id]] Updating todo:', { id, updateData })
    
    const supabase = createSimpleSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      return databaseErrorResponse(error, 'UPDATE', 'PATCH /api/todos/[id]')
    }
    
    logger.debug(`✅ [PATCH /api/todos/[id]] Updated todo: ${id}`)

    return successResponse(
      data,
      'Todo updated successfully',
      200,
      'PATCH /api/todos/[id]'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : 'Unknown error',
      500,
      { endpoint: 'PATCH /api/todos/[id]' },
      'PATCH /api/todos/[id]'
    )
  }
}

/**
 * DELETE /api/todos/[id] - Delete a todo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await validateAuthToken(request)
    
    if (!userId) {
      return errorResponse(
        'Unauthorized: Invalid or missing auth token',
        401,
        { reason: 'Auth token validation failed' },
        'DELETE /api/todos/[id]'
      )
    }

    const { id } = await params
    
    const supabase = createSimpleSupabaseClient()
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      return databaseErrorResponse(error, 'DELETE', 'DELETE /api/todos/[id]')
    }
    
    logger.debug(`✅ [DELETE /api/todos/[id]] Deleted todo: ${id}`)

    return successResponse(
      { id },
      'Todo deleted successfully',
      200,
      'DELETE /api/todos/[id]'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : 'Unknown error',
      500,
      { endpoint: 'DELETE /api/todos/[id]' },
      'DELETE /api/todos/[id]'
    )
  }
}
