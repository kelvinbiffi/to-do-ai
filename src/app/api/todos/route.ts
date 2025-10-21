import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { triggerAIAgentWebhook } from '@/lib/WebhookService'
import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, databaseErrorResponse } from '@/lib/ApiResponseHelper'
import { logger } from '@/lib/Logger'
import { revalidatePath } from 'next/cache'

/**
 * Validates the auth token from the Authorization header
 * Queries the auth_tokens table to get the user_id
 */
async function validateAuthToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    logger.debug('❌ [validateAuthToken] No Authorization header or invalid format')
    return null
  }
  
  const token = authHeader.substring(7)
  logger.debug('🔑 [validateAuthToken] Checking token:', token.substring(0, 20) + '...')
  logger.debug('🔑 [validateAuthToken] Full token length:', token.length)
  
  try {
    const supabase = createSimpleSupabaseClient()
    
    const { data: allTokens, error: allError } = await supabase
      .from('auth_tokens')
      .select('token, is_active')
      .limit(1)
    
    logger.debug('📊 [validateAuthToken] Table check:', { hasRecords: allTokens?.length || 0, error: allError?.message })
    
    const { data: authTokens, error } = await supabase
      .from('auth_tokens')
      .select('user_id, token, is_active')
      .eq('token', token)
      .eq('is_active', true)
    
    if (error) {
      logger.error('❌ [validateAuthToken] Database error:', error.message)
      logger.error('❌ [validateAuthToken] Error code:', error.code)
      return null
    }
    
    logger.debug('📊 [validateAuthToken] Query result rows:', authTokens?.length || 0)
    
    if (!authTokens || authTokens.length === 0) {
      logger.debug('❌ [validateAuthToken] Token not found or inactive')
      return null
    }

    if (authTokens.length > 1) {
      logger.warn('⚠️ [validateAuthToken] Multiple active tokens found (unexpected)')
    }
    
    const tokenRecord = authTokens[0]
    
    if (!tokenRecord.is_active) {
      logger.debug('❌ [validateAuthToken] Token is inactive')
      return null
    }
    
    logger.debug('✅ [validateAuthToken] Token is ACTIVE! User ID:', tokenRecord.user_id)
    return tokenRecord.user_id
  } catch (err) {
    logger.error('❌ [validateAuthToken] Exception:', err)
    return null
  }
}

/**
 * GET /api/todos - Fetch all todos for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await validateAuthToken(request)
    
    if (!userId) {
      return errorResponse(
        'Unauthorized: Invalid or missing auth token',
        401,
        { reason: 'Auth token validation failed' },
        'GET /api/todos'
      )
    }
    
    const supabase = createSimpleSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return databaseErrorResponse(error, 'SELECT', 'GET /api/todos')
    }
    
    logger.debug(`✅ [GET /api/todos] Fetched ${data?.length || 0} todos for user ${userId}`)
    return successResponse(
      data || [],
      `Found ${data?.length || 0} todos`,
      200,
      'GET /api/todos'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : 'Unknown error',
      500,
      { endpoint: 'GET /api/todos' },
      'GET /api/todos'
    )
  }
}

/**
 * POST /api/todos - Create a new todo
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await validateAuthToken(request)
    
    if (!userId) {
      return errorResponse(
        'Unauthorized: Invalid or missing auth token',
        401,
        { reason: 'Auth token validation failed' },
        'POST /api/todos'
      )
    }
    
    const body = await request.json()
    const { title, description } = body
    
    if (!title || title.trim().length === 0) {
      return errorResponse(
        'Validation failed',
        400,
        {
          validationErrors: {
            title: 'Title is required and cannot be empty',
          },
        },
        'POST /api/todos'
      )
    }
    
    const supabase = createSimpleSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || '',
        status: 'open',
      })
      .select()
      .single()
    
    if (error) {
      return databaseErrorResponse(error, 'INSERT', 'POST /api/todos')
    }
    
    logger.debug('✅ [POST /api/todos] Todo created:', data.id)

    const authHeader = request.headers.get('Authorization')
    const userAuthToken = authHeader?.replace('Bearer ', '') || ''

    try {
      await triggerAIAgentWebhook({
        todoId: data.id,
        userAuthToken: userAuthToken,
        userId: userId,
        title: data.title,
        description: data.description,
        timestamp: new Date().toISOString(),
      })
      logger.debug('📡 [POST /api/todos] Webhook triggered for n8n AI agent')
    } catch (webhookError) {
      logger.warn('⚠️ [POST /api/todos] Webhook error (non-critical):', webhookError)
    }

    revalidatePath('/todos')

    return successResponse(
      data,
      'Todo created successfully',
      201,
      'POST /api/todos'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : 'Unknown error',
      500,
      { endpoint: 'POST /api/todos' },
      'POST /api/todos'
    )
  }
}
