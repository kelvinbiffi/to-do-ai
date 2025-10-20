
'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader, Edit2, Plus, X } from 'lucide-react'

interface TaskFormProps {
  onSubmit: (title: string, description: string) => Promise<void>
  onCancel: () => void
  initialTitle?: string
  initialDescription?: string
  isLoading?: boolean
  submitLabel?: string
  isEditing?: boolean
}

export default function TaskForm({
  onSubmit,
  onCancel,
  initialTitle = '',
  initialDescription = '',
  isLoading = false,
  submitLabel = 'Create Task',
  isEditing = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    if (title.length > 255) {
      setError('Task title must be 255 characters or less')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await onSubmit(title.trim(), description.trim())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save task'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e as any)
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Field */}
      <div>
        <label htmlFor="task-title" className="block text-sm font-semibold text-gray-900 mb-2">
          Task Title <span className="text-red-600" aria-label="required">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error && e.target.value.trim()) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          maxLength={255}
          className="w-full text-base sm:text-lg font-medium text-gray-900 border-2 border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg p-3 outline-none transition-all disabled:bg-gray-100 disabled:opacity-60"
          autoFocus
          disabled={loading || isLoading}
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'title-error' : 'title-hint'}
        />
        <div className="flex justify-between mt-1">
          <div>
            {error && (
              <p id="title-error" className="text-xs sm:text-sm text-red-600 font-medium flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}
            {!error && (
              <p id="title-hint" className="text-xs text-gray-500">Ctrl+Enter to save, Escape to cancel</p>
            )}
          </div>
          <span className="text-xs text-gray-500">{title.length}/255</span>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="task-description" className="block text-sm font-semibold text-gray-900 mb-2">
          Description <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add details or notes about this task..."
          className="w-full border-2 border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg p-3 text-gray-800 text-sm outline-none transition-all resize-none disabled:bg-gray-100 disabled:opacity-60"
          rows={3}
          disabled={loading || isLoading}
          maxLength={1000}
          aria-describedby="description-hint"
        />
        <div className="flex justify-between mt-1">
          <p id="description-hint" className="text-xs !text-gray-500">💡 Tip: Use Ctrl+Enter to save</p>
          <span className="text-xs text-gray-500">{description.length}/1000</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || isLoading || !title.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
          aria-busy={loading || isLoading}
        >
          {loading || isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              {isEditing ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>{submitLabel}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{submitLabel}</span>
                </>
              )}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || isLoading}
          className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  )
}

