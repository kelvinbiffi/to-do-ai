'use server'

import { createSimpleSupabaseClient } from '@/lib/Supabase'
import { triggerAIAgentWebhook } from '@/lib/WebhookService'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * IMPORTANT: Login and signup are handled by API Routes:
 * - POST /api/auth/login
 * - POST /api/auth/signup
 * These Server Actions below are for todo management only.
 */

export async function signOut() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error calling logout API:', err)
  }
  
  revalidatePath('/')
  redirect('/login')
}

export async function getTodos() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  if (!userId) return []

  const supabase = createSimpleSupabaseClient()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching todos:', error)
    return []
  }

  return data || []
}

export async function createTodo(input: { title: string; description?: string }) {
  if (!input.title || input.title.trim().length === 0) {
    return { error: 'Title is required', status: 400 }
  }
  
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value
  
  if (!authToken) {
    return { error: 'Unauthorized', status: 401 }
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: input.title.trim(),
        description: input.description?.trim() || '',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: error.error || 'Failed to create todo', status: response.status }
    }

    const result = await response.json()
    return { success: true, data: result.data, status: 201 }
  } catch (error) {
    console.error('Error creating todo:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create todo', status: 500 }
  }
}

export async function updateTodo(id: string, patch: any) {
  if (!id) {
    return { error: 'Todo ID is required', status: 400 }
  }
  
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value
  
  if (!authToken) {
    return { error: 'Unauthorized', status: 401 }
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(patch),
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: error.error || 'Failed to update todo', status: response.status }
    }

    const result = await response.json()
    return { success: true, data: result.data, status: 200 }
  } catch (error) {
    console.error('Error updating todo:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update todo', status: 500 }
  }
}

export async function deleteTodo(id: string) {
  if (!id) {
    return { error: 'Todo ID is required', status: 400 }
  }
  
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value
  
  if (!authToken) {
    return { error: 'Unauthorized', status: 401 }
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: error.error || 'Failed to delete todo', status: response.status }
    }

    return { success: true, status: 200 }
  } catch (error) {
    console.error('Error deleting todo:', error)
    return { error: error instanceof Error ? error.message : 'Failed to delete todo', status: 500 }
  }
}

export async function toggleTodoStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'done' ? 'open' : 'done'
  return updateTodo(id, { status: newStatus })
}

