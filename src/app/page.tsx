import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Chat from '@/components/Chat'
import HeaderServer from '@/components/HeaderServer'
import TodoDataServer from '@/components/TodoDataServer'
import { TodoListSkeleton, HeaderSkeleton } from '@/components/TodoSkeleton'

/**
 * Protected route - checks authentication before rendering
 */
async function ProtectedPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Suspense */}
        <Suspense fallback={<HeaderSkeleton />}>
          <HeaderServer />
        </Suspense>

        {/* Todo List with Suspense */}
        <Suspense fallback={<TodoListSkeleton />}>
          <TodoDataServer />
        </Suspense>

        {/* AI Chat Agent */}
        <Chat userId={userId} />
      </div>
    </main>
  )
}

export default function Page() {
  return <ProtectedPage />
}
