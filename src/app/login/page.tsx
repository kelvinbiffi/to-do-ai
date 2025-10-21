'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff, Loader } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const whatsappNumber = params.get('whatsapp') || params.get('number')

        // O middleware já redireciona usuários autenticados
        // Aqui apenas salvamos o número WhatsApp para o fluxo de login
        if (whatsappNumber) {
          sessionStorage.setItem('whatsapp_number', whatsappNumber)
        }

        // Auth check complete, show login form
        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsCheckingAuth(false)
      }
    }

    initializeAuth()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 409) {
            toast.error('❌ This email is already registered')
          } else if (response.status === 400) {
            toast.error('⚠️ ' + data.error)
          } else {
            toast.error(data.error || 'Failed to create account')
          }
        } else {
          toast.success('✅ Account created successfully! Now login.')
          setMode('login')
          setPassword('')
        }
      } else {
        // Get WhatsApp number
        let whatsappNumber = null
        const params = new URLSearchParams(window.location.search)
        whatsappNumber = params.get('whatsapp') || params.get('number')
        
        if (!whatsappNumber) {
          whatsappNumber = sessionStorage.getItem('whatsapp_number')
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }
        
        if (whatsappNumber) {
          headers['X-WhatsApp-Number'] = whatsappNumber
        }

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers,
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Invalid email or password')
          } else {
            toast.error(data.error || 'Failed to login')
          }
        } else {
          toast.success('Login successful!')
          setTimeout(() => {
            const redirect = data?.data?.redirect
            window.location.href = redirect || '/'
          }, 500)
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'signup' : 'login')
    setPassword('')
    setEmail('')
    setShowPassword(false)
  }

  const isFormValid = email.trim() && password.length >= 6

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-4 sm:p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
            To-Do AI
          </h1>
          <p className="text-white/90 text-base sm:text-lg mt-2 drop-shadow">
            Organize your tasks with intelligence
          </p>
        </div>

        {/* Loading Spinner */}
        {isCheckingAuth ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-20"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg font-medium">Checking authentication...</p>
          </div>
        ) : (
          /* Login Form */
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-auto">
          {/* Form Header */}
          <header className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="!text-gray-600 text-sm">
              {mode === 'login' ? 'Welcome back! Sign in to your account' : 'Join us and start organizing your tasks'}
            </p>
          </header>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                aria-required="true"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:opacity-60"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                {mode === 'signup' && (
                  <span className="text-xs text-gray-500">Minimum 6 characters</span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  disabled={loading}
                  required
                  aria-required="true"
                  className="w-full px-4 py-3 pr-12 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 rounded"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2 mt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              aria-busy={loading}
              aria-label={loading ? 'Processing your request' : mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 text-white animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-sm !text-gray-600 mb-3">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </button>
          </div>
        </div>
        )}

        {/* Footer Info */}
        <footer className="mt-8 text-center text-black/80 text-xs max-w-md text-white text text-sm mx-auto">
          <p>
            💡 <span className="font-semibold">Tip:</span> Use your email to create an account or sign in with existing credentials
          </p>
        </footer>
      </main>
    </>
  )
}
