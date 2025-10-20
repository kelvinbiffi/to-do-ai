'use client'

import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Todo } from '@/types/Todo'
import toast from 'react-hot-toast'

interface TodosResponse {
  success: boolean
  statusCode: number
  message?: string
  data: Todo[]
  timestamp: string
  endpoint: string
}

/**
 * Hook to fetch todos with React Query
 * Provides automatic caching and refetching
 * Handles authentication errors by redirecting to login
 */
export function useTodos(): UseQueryResult<Todo[], Error> {
  const router = useRouter()

  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      // First, get the auth token from the /api/auth/token endpoint
      let authToken: string | null = null
      
      try {
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (tokenResponse.status === 401) {
          // Unauthorized - redirect to login
          toast.error('Your session has expired. Please login again.')
          router.push('/login')
          throw new Error('Session expired')
        }

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          authToken = tokenData.data?.token
        }
      } catch (error) {
        console.warn('Failed to fetch auth token')
      }

      if (!authToken) {
        toast.error('Authentication required. Please login.')
        router.push('/login')
        throw new Error('No auth token available')
      }

      // Now fetch todos with Bearer token
      const response = await fetch('/api/todos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
      })

      if (response.status === 401) {
        // Unauthorized - session expired or invalid token
        toast.error('Your session has expired. Please login again.')
        router.push('/login')
        throw new Error('Session expired')
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`)
      }

      const result: TodosResponse = await response.json()
      
      if (!result.success) {
        throw new Error('Failed to fetch todos')
      }

      return result.data || []
    },
    staleTime: 5000,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: true,
  })
}

/**
 * Hook to get QueryClient for manual invalidation
 * Use this after mutations to immediately refresh todos
 */
export function useInvalidateTodos() {
  const queryClient = useQueryClient()
  
  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  }
}
