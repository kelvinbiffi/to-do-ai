'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, MessageCircle, ArrowRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

function WhatsAppContent() {
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Recuperar número do URL
    const number = searchParams.get('number')
    if (number) {
      setPhoneNumber(number)
      console.log('✅ WhatsApp authenticated for:', number)
    }

    // Limpar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('whatsapp_number')
    }
  }, [searchParams])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-4 sm:p-6">
      {/* Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Success Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-20"></div>
            <CheckCircle className="w-24 h-24 text-white drop-shadow-lg animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Success! 🎉
          </h1>

          {/* Subtitle */}
          <p className="text-lg !text-gray-600 mb-6">
            Your WhatsApp has been successfully linked!
          </p>

          {/* Phone Info */}
          {phoneNumber && (
            <div className="bg-green-50 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-sm !text-gray-600 mb-1">Linked phone number:</p>
              <p className="text-lg font-semibold !text-green-600 flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {phoneNumber}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Next steps:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Click the link below to return to WhatsApp</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Send a message to the agent to get started</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Use commands to manage your tasks</span>
              </li>
            </ol>
          </div>

          {/* WhatsApp Link Button */}
          <a
            href="https://whatsa.me/12134605967/?t=Logged"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <MessageCircle className="w-5 h-5" />
            Back to WhatsApp
            <ArrowRight className="w-5 h-5" />
          </a>

          {/* Alternative: Continue in App */}
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Or continue in the web app
          </a>
        </div>

        {/* Footer Info */}
        <footer className="mt-8 text-center text-white text-sm">
          <p>
            ✅ Your WhatsApp number is now authenticated and ready to use with Task Buddy
          </p>
        </footer>
      </div>
    </main>
  )
}

export default function WhatsAppAuthenticatedPage() {
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
        }}
      />
      <Suspense fallback={
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-600">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </main>
      }>
        <WhatsAppContent />
      </Suspense>
    </>
  )
}
