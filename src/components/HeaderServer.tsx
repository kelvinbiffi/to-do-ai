/**
 * Server Component for Header
 * Fetches user data on the server
 */

import { cookies } from 'next/headers'
import { createSimpleSupabaseClient } from '@/lib/Supabase'
import SignOutButton from './SignOutButton'

export default async function HeaderServer() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Fetch user email from database on server
  const supabase = createSimpleSupabaseClient()
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', userId)
    .single()

  const userEmail = users?.email || 'User'
  const userName = userEmail.split('@')[0]

  return (
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
          Hi {userName} 👋
        </h2>
        <p className="!text-black text-opacity-90 text-sm mt-1">
          {userEmail}
        </p>
      </section>
    </header>
  )
}
