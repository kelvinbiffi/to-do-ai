export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: 'open' | 'done' | 'archived'
  due_date?: string | null
  meta?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  created_at: string
}

export interface WhatsAppNumber {
  id: string
  user_id: string
  phone_number: string
  linked_at: string
  last_used?: string | null
  created_at: string
  updated_at: string
}

