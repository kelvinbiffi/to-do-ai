export interface WebhookPayload {
  todoId: string
  userAuthToken: string
  userId: string
  title: string
  description?: string
  timestamp: string
}

/**
 * Triggers the AI Agent webhook via n8n
 * This sends the new todo information to n8n for AI enhancement
 * Follows standard webhook pattern: { message, userAuthToken, userId, todoId }
 */
export async function triggerAIAgentWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

  console.log('🔗 [WebhookService] Webhook URL from env:', webhookUrl ? '✅ Set' : '❌ Not set')
  console.log('📦 [WebhookService] Payload:', JSON.stringify({
    todoId: payload.todoId,
    title: payload.title,
    description: payload.description,
    timestamp: payload.timestamp,
  }, null, 2))

  if (!webhookUrl) {
    console.warn('⚠️ [WebhookService] NEXT_PUBLIC_N8N_WEBHOOK_URL not configured')
    console.warn('⚠️ [WebhookService] Please add to .env.local:')
    console.warn('⚠️ [WebhookService] NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-id')
    return
  }

  try {
    console.log('🔗 [WebhookService] Triggering AI Agent webhook for todo:', payload.todoId)
    console.log('🔗 [WebhookService] Webhook URL:', webhookUrl)
    
    // Format message to instruct AI agent to improve the description
    // This will trigger the n8n workflow to enhance the todo description automatically
    const message = `Please update the item "${payload.title}" to improve the description. Make it more detailed, structured, and actionable.${payload.description ? ` Current description: ${payload.description}` : ''}`
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        userAuthToken: payload.userAuthToken,
        userId: payload.userId,
        todoId: payload.todoId,
      }),
    })

    console.log(`📊 [WebhookService] Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const responseText = await response.text()
      console.error(`❌ [WebhookService] Error: ${response.status} ${response.statusText}`)
      console.error(`❌ [WebhookService] Response body: ${responseText}`)
      return
    }

    const responseData = await response.json().catch(() => ({}))
    console.log('✅ [WebhookService] Webhook triggered successfully')
    console.log('✅ [WebhookService] Response:', JSON.stringify(responseData, null, 2))
  } catch (error) {
    console.error('❌ [WebhookService] Failed to trigger webhook:', error)
    console.error('❌ [WebhookService] Error details:', error instanceof Error ? error.message : String(error))
  }
}