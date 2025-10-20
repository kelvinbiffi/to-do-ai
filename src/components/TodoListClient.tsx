'use client'

import { useState, useEffect, useMemo } from 'react'
import { Todo } from '@/types/Todo'
import TodoItem from './TodoItem'
import { useTodos } from '@/lib/useTodos'

interface TodoListClientProps {
  initialActiveTodos: Todo[]
  initialCompletedTodos: Todo[]
  userId: string
}

export default function TodoListClient({
  initialActiveTodos,
  initialCompletedTodos,
  userId,
}: TodoListClientProps) {
  const { data: todos = [], isLoading, isError } = useTodos()

  // Separate todos into active and completed
  const { activeTodos, completedTodos } = useMemo(() => {
    if (!todos || todos.length === 0) {
      return {
        activeTodos: initialActiveTodos,
        completedTodos: initialCompletedTodos,
      }
    }

    return {
      activeTodos: todos.filter((t: Todo) => t.status !== 'done'),
      completedTodos: todos.filter((t: Todo) => t.status === 'done'),
    }
  }, [todos, initialActiveTodos, initialCompletedTodos])

  const activeCount = activeTodos.length
  const completedCount = completedTodos.length
  const totalCount = activeCount + completedCount
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{completedCount}/{totalCount}</span> completed
          </div>
          <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-red-400 to-red-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Active Tasks */}
      {activeCount > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Active Tasks ({activeCount})</h2>
          <div className="space-y-3">
            {activeTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Tasks */}
      {completedCount > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Completed ({completedCount})</h2>
          <div className="space-y-3">
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {activeCount === 0 && completedCount === 0 && !isLoading && (
        <div className="text-center py-12 bg-white bg-opacity-20 rounded-lg">
          <p className="text-white text-lg">✨ No tasks yet. Create one to get started!</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 bg-red-100 rounded-lg">
          <p className="text-red-800 text-lg">❌ Failed to load tasks. Please try again.</p>
        </div>
      )}
    </div>
  )
}
