import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { successResponse, errorResponse } from '@/lib/ApiResponseHelper'
import { logger } from '@/lib/Logger'

/**
 * Validates the auth token from cookies or sessionStorage
 */
async function validateAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  let authToken = cookieStore.get('auth_token')?.value

  if (!authToken) {
    logger.warn('⚠️ [validateAuthToken] No auth token in cookies')
  }

  logger.debug('✅ [validateAuthToken] Auth token found')
  return authToken || null
}

/**
 * POST /api/chat
 * Receives user messages and sends to n8n AI agent
 * Messages are stored in localStorage on client only
 */
export async function POST(request: NextRequest) {
  try {
    const authToken = await validateAuthToken()

    if (!authToken) {
      return errorResponse(
        'Unauthorized',
        401,
        { reason: 'No auth token found in cookies' },
        'POST /api/chat'
      )
    }

    const body = await request.json()
    const { message, userId } = body

    if (!message || message.trim().length === 0) {
      return errorResponse(
        'Validation failed',
        400,
        {
          validationErrors: {
            message: 'Message is required and cannot be empty',
          },
        },
        'POST /api/chat'
      )
    }

    logger.debug('💬 [POST /api/chat] Received message:', message.trim())

    // Send to n8n AI agent webhook
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

    if (!webhookUrl) {
      logger.warn('⚠️ [POST /api/chat] NEXT_PUBLIC_N8N_WEBHOOK_URL not configured')
      return successResponse(
        { message: 'Message ready (webhook not configured)' },
        'Success (webhook not configured)',
        200,
        'POST /api/chat'
      )
    }

    logger.debug('🔗 [POST /api/chat] Sending to n8n webhook')

    // Send message to n8n webhook and get the response
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        userAuthToken: authToken,
        userId: userId,
      }),
    })

    logger.debug('📡 [POST /api/chat] n8n webhook response received:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      logger.error('❌ [POST /api/chat] n8n error:', { status: n8nResponse.status, errorText })
      return errorResponse(
        'Error from n8n workflow',
        n8nResponse.status,
        {
          webhookStatus: n8nResponse.status,
          webhookError: errorText,
        },
        'POST /api/chat'
      )
    }

    const n8nData = await n8nResponse.json()

    logger.debug('✅ [POST /api/chat] n8n response:', n8nData)

    // Extract message directly from n8n output
    const messageContent = n8nData.output || 'No response received'

    return successResponse(
      {
        success: true,
        response: messageContent,
        data: n8nData,
      },
      'Message processed successfully',
      200,
      'POST /api/chat'
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : 'Unknown error',
      500,
      { endpoint: 'POST /api/chat' },
      'POST /api/chat'
    )
  }
}
