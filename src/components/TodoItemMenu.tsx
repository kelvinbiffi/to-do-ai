
'use client'

import { Edit2, Trash2 } from 'lucide-react'

interface TodoItemMenuProps {
  isOpen: boolean
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  isLoading?: boolean
}

export default function TodoItemMenu({
  isOpen,
  onEdit,
  onDelete,
  onClose,
  isLoading = false,
}: TodoItemMenuProps) {
  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 min-w-[150px]">
      <button
        onClick={() => {
          onEdit()
          onClose()
        }}
        disabled={isLoading}
        className="w-full px-4 py-2 hover:bg-blue-50 text-left text-sm font-medium text-gray-700 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        onClick={() => {
          onDelete()
          onClose()
        }}
        disabled={isLoading}
        className="w-full px-4 py-2 hover:bg-red-50 text-left text-sm font-medium text-gray-700 hover:text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-t border-gray-200"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  )
}

