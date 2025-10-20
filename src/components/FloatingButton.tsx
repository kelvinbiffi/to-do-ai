
'use client'

import React from 'react'

interface FloatingButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  color?: 'blue' | 'green' | 'red' | 'purple'
  size?: 'sm' | 'md' | 'lg'
}

export default function FloatingButton({
  onClick,
  icon,
  label,
  color = 'blue',
  size = 'md',
}: FloatingButtonProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-400/50',
    green: 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-400/50',
    red: 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-400/50',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-purple-400/50',
  }

  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center font-bold flex-shrink-0 ${colorClasses[color]} text-white hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  )
}

