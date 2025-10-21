
'use client'

import { useState, useEffect } from 'react'
import { Wand2, Check, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import toast from 'react-hot-toast'
import { triggerAIEnhanceWebhook } from '@/lib/WebhookService'
import { useInvalidateTodos } from '@/lib/useTodos'

interface AIEnhanceModalProps {
  isOpen: boolean
  onClose: () => void
  todoId: string
  todoTitle: string
  todoDescription?: string
  userAuthToken?: string
  userId?: string
}

type ProcessingState = 'idle' | 'loading' | 'success' | 'error'

export default function AIEnhanceModal({
  isOpen,
  onClose,
  todoId,
  todoTitle,
  todoDescription,
  userAuthToken: propsAuthToken,
  userId: propsUserId,
}: AIEnhanceModalProps) {
  const [prompt, setPrompt] = useState('')
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [authToken, setAuthToken] = useState(propsAuthToken || '')
  const [userId, setUserId] = useState(propsUserId || '')
  const { invalidate } = useInvalidateTodos()

  // Fetch auth data from API when modal opens
  useEffect(() => {
    if (isOpen && !authToken) {
      fetchSessionData()
    }
  }, [isOpen, authToken])

  async function fetchSessionData() {
    try {
      const response = await fetch('/api/auth/get-session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setAuthToken(data.authToken)
        setUserId(data.userId)
        console.log('✅ Session data fetched successfully')
      } else {
        console.warn('⚠️ Could not fetch session data')
      }
    } catch (error) {
      console.error('❌ Error fetching session:', error)
    }
  }

  async function handleEnhance() {
    if (!prompt.trim()) {
      toast.error('Please enter a message for AI enhancement')
      return
    }

    try {
      setProcessingState('loading')
      setErrorMessage('')

      const finalAuthToken = authToken
      const finalUserId = userId

      if (!finalAuthToken) {
        throw new Error('Authentication token not found. Please log in again.')
      }

      if (!finalUserId) {
        throw new Error('User ID not found. Please log in again.')
      }

      
      await triggerAIEnhanceWebhook({
        todoId,
        userAuthToken: finalAuthToken,
        userId: finalUserId,
        title: todoTitle,
        description: todoDescription || '',
        userPrompt: prompt,
        timestamp: new Date().toISOString(),
      })

      setProcessingState('success')
      
      // Show success toast
      toast.success('✨ Your task is being enhanced by AI!', {
        duration: 3,
        icon: '🚀',
      })

      // Wait for visual feedback before closing
      setTimeout(() => {
        setPrompt('')
        setProcessingState('idle')
        onClose()
        
        // Invalidate todos to refresh after webhook completes
        setTimeout(() => invalidate(), 500)
      }, 1500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enhance task'
      setErrorMessage(message)
      setProcessingState('error')
      
      toast.error(message, {
        duration: 4,
      })

      // Reset to idle after showing error
      setTimeout(() => {
        setProcessingState('idle')
      }, 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter (or Cmd+Enter on Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (processingState === 'idle' && prompt.trim()) {
        handleEnhance()
      }
    }
  }

  const handleClose = () => {
    if (processingState === 'idle') {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="✨ Task buddy"
    >
      <div className="space-y-4">
        {/* Idle State - Input */}
        {processingState === 'idle' && (
          <>
            <p className="!text-gray-600 text-sm">
              Tell Task buddy how to improve this task:
            </p>
            
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="font-medium !text-gray-800 text-sm">{todoTitle}</p>
              {todoDescription && (
                <p className="!text-gray-600 text-xs mt-1 line-clamp-2">{todoDescription}</p>
              )}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Make it more detailed, add steps, make it urgent, add subtasks... (Ctrl+Enter to send)"
              className="w-full h-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none !text-gray-800 !placeholder:text-gray-500"
              disabled={processingState !== 'idle'}
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={processingState !== 'idle'}
                className="px-4 py-2 !text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleEnhance}
                disabled={processingState !== 'idle' || !prompt.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 !text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4" />
                Enhance with AI
              </button>
            </div>
          </>
        )}

        {/* Loading State */}
        {processingState === 'loading' && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              {/* Outer rotating circle */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-500 animate-spin" />
              {/* Inner rotating circle (counter rotation) */}
              <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-yellow-500 border-l-yellow-500 animate-spin" style={{ animationDirection: 'reverse' }} />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 className="w-6 h-6 !text-red-500 animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <p className="!text-gray-500 text-sm mt-2">
                Task buddy is enhancing your task... ✨
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* Success State */}
        {processingState === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              {/* Success circle background */}
              <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
              {/* Checkmark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-8 h-8 !text-green-600 animate-bounce" />
              </div>
            </div>
            
            <div className="text-center">
              <p className="!text-gray-800 font-semibold text-base">
                Task enhanced successfully!
              </p>
              <p className="!text-gray-500 text-sm mt-2">
                Your todo will be updated in a moment...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {processingState === 'error' && (
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-red-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 !text-red-600" />
              </div>
            </div>
            
            <div className="text-center">
              <p className="!text-gray-800 font-semibold text-base">
                Oops! Something went wrong
              </p>
              <p className="!text-gray-600 text-sm mt-2">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setProcessingState('idle')
                  setErrorMessage('')
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 !text-white rounded-lg transition-all"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 !text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
