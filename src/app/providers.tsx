'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useMemo } from 'react'

/**
 * Query client configuration
 * Shared across the entire application
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Query Provider Component
 * Provides React Query context to the entire application
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client once per render (useMemo ensures it's stable)
  const queryClient = useMemo(() => createQueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
