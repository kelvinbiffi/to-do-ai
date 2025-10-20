import { getTodos } from './Actions'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createSimpleSupabaseClient } from '@/lib/Supabase'
import TodoListClient from '@/components/TodoListClient'
import AddTodo from '@/components/AddTodo'
import Chat from '@/components/Chat'
import SignOutButton from '@/components/SignOutButton'

export default async function Home() {
  // Check authentication via cookie (custom auth)
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/login')
  }

  // Fetch user email from database
  const supabase = createSimpleSupabaseClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', userId)

  const user = users?.[0]
  const userEmail = user?.email || 'User'

  const todos = await getTodos()
  const activeTodos = todos.filter(todo => todo.status !== 'done')
  const completedTodos = todos.filter(todo => todo.status === 'done')

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                To-Do AI
              </h1>
              <p className="text-white text-opacity-95 text-lg drop-shadow">
                Organize your tasks with intelligence
              </p>
            </div>
            <SignOutButton />
          </div>

          {/* User Welcome Card */}
          <section className="bg-white bg-opacity-30 rounded-lg p-4 sm:p-6 border-l-4 border-white backdrop-blur-sm shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-black">
              Hi {userEmail.split('@')[0]} 👋
            </h2>
            <p className="!text-black text-opacity-90 text-sm mt-1">
              {userEmail}
            </p>
          </section>
        </header>

        {/* Client-side Todo List with WebSocket */}
        <TodoListClient 
          initialActiveTodos={activeTodos}
          initialCompletedTodos={completedTodos}
          userId={userId}
        />

        {/* AI Chat Agent */}
        <Chat userId={userId} />
      </div>
    </main>
  )
}
