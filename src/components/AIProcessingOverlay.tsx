
'use client'

import { Wand2, Check } from 'lucide-react'

interface AIProcessingOverlayProps {
  isVisible: boolean
  status: 'processing' | 'success' | 'error'
  message?: string
}

export default function AIProcessingOverlay({
  isVisible,
  status,
  message = 'Processing...',
}: AIProcessingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm pointer-events-auto">
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            {/* Animated processing icon */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-yellow-500 border-l-yellow-500 animate-spin" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 className="w-8 h-8 !text-red-500 animate-pulse" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold !text-gray-800 text-lg">
                AI is working...
              </h3>
              <p className="!text-gray-600 text-sm mt-2">{message}</p>
            </div>

            {/* Loading dots */}
            <div className="flex gap-2 mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-10 h-10 !text-green-600 animate-bounce" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold !text-gray-800 text-lg">
                Task Enhanced!
              </h3>
              <p className="!text-gray-600 text-sm mt-2">
                {message || 'Your todo has been improved with AI'}
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-red-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold !text-gray-800 text-lg">
                Something went wrong
              </h3>
              <p className="!text-gray-600 text-sm mt-2">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
