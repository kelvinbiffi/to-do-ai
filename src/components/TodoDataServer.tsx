/**
 * Server Component that fetches todo data
 * Separates data fetching (server) from rendering (client)
 */

import { getTodosByStatus } from '@/app/Actions'
import TodoListClient from './TodoListClient'
import { cookies } from 'next/headers'

export default async function TodoDataServer() {
  // Get user ID from cookies
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('User not authenticated')
  }

  try {
    // Fetch data on the server
    const { active, completed } = await getTodosByStatus()

    return (
      <TodoListClient
        initialActiveTodos={active}
        initialCompletedTodos={completed}
        userId={userId}
      />
    )
  } catch (error) {
    console.error('Error loading todos:', error)
    throw error
  }
}
