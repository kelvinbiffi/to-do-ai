
'use client'

import { useEffect } from 'react'
import { Loader, Trash2, X } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  title?: string
  message?: string
}

export default function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  title = 'Delete Task?',
  message = 'This action cannot be undone.',
}: DeleteConfirmDialogProps) {
  // Handle Escape key to cancel
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="max-w-sm w-full mx-4 bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-6 rounded-t-lg">
          <h3 id="delete-dialog-title" className="text-lg sm:text-xl font-bold">{title}</h3>
        </div>

        {/* Message */}
        <div className="p-4 sm:p-6">
          <p className="!text-gray-700 text-sm sm:text-base">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            aria-label="Cancel deletion (Escape)"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            aria-busy={isLoading}
            aria-label={isLoading ? 'Deleting...' : 'Delete task permanently'}
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

