export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  action?: {
    type: 'create' | 'update' | 'delete' | 'toggle'
    todoId?: string
    data?: any
  }
}

export interface ChatPayload {
  message: string
  userAuthToken: string
  userId: string
  timestamp: string
}

