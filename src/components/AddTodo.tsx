
'use client'

import { useState } from 'react'
import { createTodo } from '@/app/Actions'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import Modal from './Modal'
import TaskForm from './TaskForm'

export default function AddTodo() {
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmitForm(title: string, description: string) {
    const result = await createTodo({ title, description })
    
    if (result.error) {
      toast.error(`Error: ${result.error}`)
      throw new Error(result.error)
    }
    
    toast.success('✅ Task created successfully')
    setIsOpen(false)
  }

  return (
    <>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-4 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg text-base sm:text-lg border-2 border-white hover:border-red-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-red-500"
        title="Open the add task form"
        aria-label="Add a new task"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
        <span>Add New Task</span>
      </button>

      {/* Modal with Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleSubmitForm}
          onCancel={() => setIsOpen(false)}
          submitLabel="Create Task"
        />
      </Modal>
    </>
  )
}

