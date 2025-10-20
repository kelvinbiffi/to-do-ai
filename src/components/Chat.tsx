
'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/types/Chat'
import { createTodo } from '@/app/Actions'
import toast from 'react-hot-toast'
import { X, Send, Plus, MessageCircle, Loader } from 'lucide-react'
import Modal from './Modal'
import TaskForm from './TaskForm'
import FloatingButton from './FloatingButton'

interface ChatProps {
  userId: string
}

interface PendingResponse {
  messageId: string
  resolve: (value: any) => void
  timeout: NodeJS.Timeout
}

export default function Chat({ userId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingResponseRef = useRef<PendingResponse | null>(null)

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`chat_messages_${userId}`)
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (error) {
        console.error('Error loading chat from sessionStorage:', error)
      }
    }
  }, [userId])

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages))
  }, [messages, userId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const responsePromise = new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          toast.error('⏱️ Response timeout - Please check the API')
          resolve(null)
        }, 30000)

        pendingResponseRef.current = {
          messageId: userMessage.id,
          resolve,
          timeout: timeoutId,
        }
      })

      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: userId,
        }),
      })

      if (!apiResponse.ok) {
        const error = await apiResponse.json()
        toast.error('❌ Failed to send message')
        
        if (pendingResponseRef.current) {
          clearTimeout(pendingResponseRef.current.timeout)
          pendingResponseRef.current.resolve(null)
          pendingResponseRef.current = null
        }
        setLoading(false)
        return
      }

      const responseData = await apiResponse.json()
      
      const responseText = responseData.data?.response
      
      if (responseText) {
        addAIResponse(responseText)
      } else {
        toast.error('⚠️ No response received')
        setLoading(false)
      }

      await responsePromise
      setLoading(false)
    } catch (error) {
      toast.error('❌ Error sending message')
      if (pendingResponseRef.current) {
        clearTimeout(pendingResponseRef.current.timeout)
        pendingResponseRef.current = null
      }
      setLoading(false)
    }
  }

  const addAIResponse = (message: string, action?: any) => {
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: message,
      timestamp: new Date().toISOString(),
      action: action,
    }
    setMessages((prev) => [...prev, aiMessage])
    
    if (pendingResponseRef.current) {
      clearTimeout(pendingResponseRef.current.timeout)
      pendingResponseRef.current.resolve(aiMessage)
      pendingResponseRef.current = null
      setLoading(false)
    }
    
    toast.success('✅ AI response received')
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const handleAddTask = async (title: string, description: string) => {
    try {
      const result = await createTodo({ title, description })
      if (result.error) {
        toast.error(`Error: ${result.error}`)
        throw new Error(result.error)
      }
      toast.success('✅ Task created successfully')
      setShowAddForm(false)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create task'
      toast.error(msg)
      throw error
    }
  }

  // Expose function to window for n8n to call
  useEffect(() => {
    ;(window as any).addChatMessage = addAIResponse
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Chat Window Modal - Separate positioning for better mobile layout */}
      <div className={`fixed inset-0 flex items-end sm:items-center justify-end sm:justify-end pointer-events-none z-50 transition-opacity duration-300 ${isOpen ? 'pointer-events-auto' : ''}`}>
        {/* Backdrop Overlay */}
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? 'opacity-40' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Modal Content */}
        <div
          className={`transition-all duration-300 transform relative z-50 mx-auto ${
            isOpen
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-12 opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-screen sm:w-4xl h-[70vh] sm:h-[60vh] max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col border-t border-l border-r sm:border border-red-100 overflow-hidden safe-area-inset-bottom">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between shadow-lg flex-shrink-0">
              <h2 className="font-bold text-base sm:text-lg !m-0">Task Buddy</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-700 rounded-full p-2 transition-all hover:scale-110 active:scale-95 flex-shrink-0 touch-manipulation"
                title="Close chat (ESC)"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-3 bg-gradient-to-b from-white via-red-50 to-red-50">
              {messages.length === 0 ? (
                <div className="text-center py-6 sm:py-8 px-3 sm:px-4 flex flex-col justify-center h-full animate-fadeIn">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👋</div>
                  <p className="text-sm sm:text-base !text-gray-700 font-semibold">Hi! I can help manage your tasks</p>
                  <p className="text-base !text-gray-500 mt-2 sm:mt-3 mb-3">Try saying:</p>
                  <ul className="text-xs sm:text-sm text-red-600 space-y-1 sm:space-y-2 bg-red-50 rounded-lg p-3 text-left mx-auto">
                    <li className="flex items-center gap-2">
                      <Loader className="text-red-500 flex-shrink-0 w-4 h-4" />
                      <span>"Create a task to buy groceries"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500 flex-shrink-0">✓</span>
                      <span>"Mark my first task as done"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="text-red-500 flex-shrink-0 w-4 h-4" />
                      <span>"Delete the shopping task"</span>
                    </li>
                  </ul>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-xs px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm transition-all ${
                        msg.type === 'user'
                          ? 'bg-red-500 text-white rounded-br-none shadow-md hover:shadow-lg'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm border border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      {msg.action && (
                        <p
                          className={`text-xs mt-2 font-semibold animate-pulse ${
                            msg.type === 'user' ? 'text-red-100' : 'text-green-600'
                          }`}
                        >
                          ✓ {msg.action.type === 'create' ? '📝 Created' : msg.action.type === 'delete' ? '🗑️ Deleted' : '✅ Updated'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-none border-2 border-blue-300 shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Add Task Button */}
            {!showAddForm && (
              <div className="border-t border-red-100 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-50 to-red-50 flex-shrink-0 text-center transition-colors hover:from-red-100 hover:to-red-100">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors touch-manipulation"
                >
                  <Plus className="w-4 h-4 inline-block mr-1" /> Quick Add Task
                </button>
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={sendMessage} className="border-t border-red-100 p-3 sm:p-4 bg-white flex-shrink-0 safe-area-inset-bottom">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={loading ? 'Waiting for response...' : 'Ask me something...'}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition bg-red-50 text-sm !text-black touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  autoComplete="off"
                  aria-label="Message input"
                  ref={inputRef}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-fit font-medium flex-shrink-0 touch-manipulation"
                  title={`Send message (${loading ? 'Processing...' : 'Ready'})`}
                  aria-label="Send message"
                  aria-busy={loading}
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Buttons - Grouped together at bottom right */}
      <div className="fixed bottom-6 right-6 sm:right-8 lg:right-12 flex items-center gap-3 z-30 pointer-events-none">
        {/* Add Task Floating Button */}
        <div className="pointer-events-auto">
          <FloatingButton
            onClick={() => setShowAddForm(true)}
            icon={<Plus className="w-6 h-6" />}
            label="Add new task"
            color="green"
            size="md"
          />
        </div>

        {/* Chat Toggle Button */}
        <div className="pointer-events-auto">
          <FloatingButton
            onClick={() => setIsOpen(!isOpen)}
            icon={isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            label={isOpen ? 'Close chat' : 'Open AI Chat Assistant'}
            color={isOpen ? 'red' : 'blue'}
            size="md"
          />
        </div>
      </div>

      {/* Add Task Modal - PLACED OUTSIDE pointer-events-none for proper interaction */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Create Task"
        />
      </Modal>
    </>
  )
}

