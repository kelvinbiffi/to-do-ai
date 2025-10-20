'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      console.log('🚪 [SignOutButton] Signing out...')

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        console.log('✅ [SignOutButton] Logout successful')
        // Clear any client-side state if needed
        router.push('/login')
        router.refresh()
      } else {
        console.error('❌ [SignOutButton] Logout failed:', response.status)
        alert('Failed to sign out. Please try again.')
      }
    } catch (error) {
      console.error('❌ [SignOutButton] Error:', error)
      alert('An error occurred while signing out.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap disabled:cursor-not-allowed"
      title="Sign out of your account"
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
