/**
 * N8n Helper Utilities
 * 
 * Provides utilities to handle webhook responses from n8n workflows
 * and update todos with AI-enhanced descriptions
 */

export interface N8nWebhookResponse {
  success: boolean
  todoId: string
  enhancedDescription?: string
  metadata?: {
    aiModel?: string
    enhancementTime?: number
    tokens?: number
  }
  error?: string
}

/**
 * Parse n8n webhook response body
 */
export function parseN8nResponse(body: any): N8nWebhookResponse {
  try {
    // Handle different n8n response formats
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }

    return {
      success: body.success ?? true,
      todoId: body.todoId || body.id || '',
      enhancedDescription: body.enhancedDescription || body.description || '',
      metadata: body.metadata || {},
      error: body.error,
    }
  } catch (error) {
    console.error('❌ Error parsing n8n response:', error)
    return {
      success: false,
      todoId: '',
      error: 'Failed to parse response',
    }
  }
}

/**
 * Format payload to send to n8n webhook
 * Follows standard webhook pattern: { message, userAuthToken, userId }
 */
export function formatN8nPayload(data: {
  todoId?: string
  title?: string
  description?: string
  userAuthToken?: string
  userId?: string
  message?: string
}) {
  // If message is provided, use it; otherwise construct from title and description
  const message = data.message || `New todo: "${data.title || 'Untitled'}"${data.description ? ` - ${data.description}` : ''}`
  
  return {
    message: message,
    userAuthToken: data.userAuthToken || '',
    userId: data.userId || '',
  }
}

/**
 * Example n8n workflow response handler
 * This shows what your n8n workflow should return
 */
export const N8N_RESPONSE_EXAMPLE = {
  success: true,
  todoId: '550e8400-e29b-41d4-a716-446655440000',
  enhancedDescription: `
    # Task: Learn TypeScript
    
    ## Objective
    Master the fundamentals of TypeScript to write type-safe JavaScript code.
    
    ## Key Topics
    1. Basic Types (string, number, boolean, etc.)
    2. Type Inference and Annotations
    3. Interfaces and Type Aliases
    4. Functions and Arrow Functions
    5. Classes and OOP Concepts
    
    ## Resources
    - Official TypeScript Handbook
    - TypeScript Deep Dive (Basarat Ali Syed)
    - Interactive TypeScript Playground
    
    ## Success Criteria
    - Write type-safe functions with proper typing
    - Understand generics and advanced types
    - Be able to debug type errors effectively
    
    ## Estimated Time: 20-30 hours
  `,
  metadata: {
    aiModel: 'GPT-4',
    enhancementTime: 1250,
    tokens: 342,
  },
}

/**
 * Validate if response from n8n is valid
 */
export function isValidN8nResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    'todoId' in response &&
    typeof response.todoId === 'string' &&
    response.todoId.length > 0
  )
}

/**
 * Helper to create n8n error response
 */
export function createN8nErrorResponse(
  todoId: string,
  error: string
): N8nWebhookResponse {
  return {
    success: false,
    todoId,
    error,
  }
}

/**
 * Helper to create n8n success response
 */
export function createN8nSuccessResponse(
  todoId: string,
  enhancedDescription: string,
  metadata?: any
): N8nWebhookResponse {
  return {
    success: true,
    todoId,
    enhancedDescription,
    metadata,
  }
}

/**
 * Generate n8n workflow example as JSON
 * Useful for documentation or testing
 */
export function generateN8nWorkflowExample() {
  return {
    name: 'Todo AI Enhancement',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'your-webhook-path',
          options: {},
        },
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [250, 300],
      },
      {
        parameters: {
          resource: 'message',
          action: 'create',
          model: 'gpt-4-turbo',
          messages: [
            {
              messageType: 'system',
              message:
                'You are a helpful assistant that enhances and structures task descriptions.',
            },
            {
              messageType: 'user',
              message:
                'Please enhance this task description to be more detailed, structured, and actionable:\n\nTitle: {{$node.Webhook.json.title}}\nDescription: {{$node.Webhook.json.description}}',
            },
          ],
        },
        name: 'OpenAI',
        type: 'n8n-nodes-base.openaiChatModel',
        position: [500, 300],
      },
      {
        parameters: {
          datasource: 'supabase',
          table: 'todos',
          operation: 'update',
          id: '={{$node.Webhook.json.todoId}}',
          columns: {
            values: [
              {
                key: 'description',
                value: '={{$node.OpenAI.json.output}}',
              },
              {
                key: 'meta',
                value:
                  '={"enhanced": true, "enhancedAt": "' +
                  new Date().toISOString() +
                  '"}',
              },
            ],
          },
        },
        name: 'Update Todo',
        type: 'n8n-nodes-base.supabase',
        position: [750, 300],
      },
    ],
    connections: {
      Webhook: {
        main: [
          [
            {
              node: 'OpenAI',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
      OpenAI: {
        main: [
          [
            {
              node: 'Update Todo',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
  }
}
