
'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`${sizeClasses[size]} w-full mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto relative z-50`}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 flex items-center justify-between border-b-4 border-red-700 rounded-t-xl">
          <h2 id="modal-title" className="text-lg sm:text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-700 p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close modal (Escape)"
            type="button"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 relative z-40">
          {children}
        </div>
      </div>
    </div>
  )
}

