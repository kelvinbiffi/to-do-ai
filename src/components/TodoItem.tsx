
'use client'

import { useState, useEffect } from 'react'
import { Todo } from '@/types/Todo'
import { toggleTodoStatus, deleteTodo, updateTodo } from '@/app/Actions'
import { useInvalidateTodos } from '@/lib/useTodos'
import toast from 'react-hot-toast'
import { Check, ChevronDown, MoreVertical, Wand2 } from 'lucide-react'
import Modal from './Modal'
import TaskForm from './TaskForm'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import TodoItemMenu from './TodoItemMenu'
import AIEnhanceModal from './AIEnhanceModal'

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo: initialTodo }: TodoItemProps) {
  const [todo, setTodo] = useState(initialTodo)
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAIEnhance, setShowAIEnhance] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { invalidate } = useInvalidateTodos()

  useEffect(() => {
    setTodo(initialTodo)
  }, [initialTodo])

  async function handleToggle() {
    try {
      setIsLoading(true)
      await toggleTodoStatus(todo.id, todo.status)
      const newStatus = todo.status === 'done' ? 'active' : 'done'
      toast.success(`Task marked as ${newStatus}`)
      invalidate()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    try {
      setIsLoading(true)
      const result = await deleteTodo(todo.id)

      if (result?.error) {
        toast.error(`Error: ${result.error}`)
        return
      }

      toast.success('✅ Task deleted successfully')
      invalidate()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  async function handleSave(title: string, description: string) {
    try {
      setIsLoading(true)
      const result = await updateTodo(todo.id, { title, description })

      if (result.error) {
        toast.error(`Error: ${result.error}`)
        throw new Error(result.error)
      }

      toast.success('✅ Task updated successfully')
      setIsEditing(false)
      invalidate()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task'
      toast.error(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const isDone = todo.status === 'done'

  return (
    <>
      <article
        className={`rounded-lg shadow-md transition-all border-l-4 ${
          isDone
            ? 'border-l-gray-400 bg-gray-100'
            : 'border-l-red-500 bg-white hover:shadow-lg'
        }`}
        role="article"
      >
        {/* Header with Title and Actions */}
        <div className="flex items-start gap-3 px-4 sm:px-5 py-4 sm:py-5">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all mt-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${
              isDone
                ? 'border-gray-400 bg-gray-400'
                : 'border-red-500 hover:bg-red-50'
            }`}
            aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
            aria-pressed={isDone}
            title={isDone ? 'Mark as incomplete (Space)' : 'Mark as complete (Space)'}
          >
            {isDone && (
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            )}
          </button>

          {/* Title and Preview */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold transition-all ${
                isDone
                  ? 'text-gray-500 line-through'
                  : 'text-gray-800'
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && !isExpanded && (
              <p className={`text-sm line-clamp-2 mt-1 ${isDone ? '!text-gray-500' : '!text-gray-600'}`}>
                {todo.description}
              </p>
            )}
          </div>

          {/* Expand Button */}
          {todo.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              aria-expanded={isExpanded}
              title={isExpanded ? 'Collapse (Click to hide)' : 'Expand (Click to show details)'}
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>
          )}

          {/* AI Magic Button */}
          {!isDone && (
            <button
              onClick={() => setShowAIEnhance(true)}
              disabled={isLoading}
              className="flex-shrink-0 p-2 hover:bg-yellow-50 rounded transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 group relative"
              aria-label="Enhance with Task buddy"
            >
              <Wand2 className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
              <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Task buddy ✨
              </span>
            </button>
          )}

          {/* Menu Button with Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              aria-label="More options"
              aria-expanded={showMenu}
              title="More options (Edit or Delete)"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            <TodoItemMenu
              isOpen={showMenu}
              onEdit={() => setIsEditing(true)}
              onDelete={() => setShowDeleteConfirm(true)}
              onClose={() => setShowMenu(false)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Description (Expandable) */}
        {isExpanded && todo.description && (
          <section className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-200 bg-gray-50">
            <p className={`text-gray-800 text-sm leading-relaxed pt-3 ${isDone ? '!text-gray-300' : '!text-black'}`}>
              {todo.description}
            </p>
          </section>
        )}
      </article>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Task"
      >
        <TaskForm
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
          initialTitle={todo.title}
          initialDescription={todo.description || ''}
          submitLabel="Save Changes"
          isLoading={isLoading}
          isEditing={true}
        />
      </Modal>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isLoading}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />

      <AIEnhanceModal
        isOpen={showAIEnhance}
        onClose={() => setShowAIEnhance(false)}
        todoId={todo.id}
        todoTitle={todo.title}
        todoDescription={todo.description || undefined}
      />
    </>
  )
}

