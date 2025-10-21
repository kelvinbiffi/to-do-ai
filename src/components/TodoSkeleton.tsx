/**
 * Skeleton components for loading states with Suspense
 */

export function TodoItemSkeleton() {
  return (
    <div className="bg-white bg-opacity-90 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  )
}

export function TodoListSkeleton() {
  return (
    <div className="space-y-8">
      {/* Progress Bar Skeleton */}
      <div className="bg-white bg-opacity-90 rounded-lg p-6 animate-pulse">
        <div className="h-3 bg-gray-300 rounded-full w-full"></div>
      </div>

      {/* Active Tasks Skeleton */}
      <section className="space-y-3">
        <div className="h-6 bg-white/50 rounded w-1/3 animate-pulse"></div>
        {[...Array(3)].map((_, i) => (
          <TodoItemSkeleton key={i} />
        ))}
      </section>

      {/* Completed Tasks Skeleton */}
      <section className="space-y-3">
        <div className="h-6 bg-white/50 rounded w-1/3 animate-pulse"></div>
        {[...Array(2)].map((_, i) => (
          <TodoItemSkeleton key={i} />
        ))}
      </section>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="mb-8 animate-pulse">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="h-12 bg-white/30 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
        </div>
        <div className="h-10 w-32 bg-white/20 rounded"></div>
      </div>

      {/* User Welcome Card */}
      <div className="bg-white bg-opacity-30 rounded-lg p-6 border-l-4 border-white">
        <div className="h-6 bg-white/30 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-1/4"></div>
      </div>
    </header>
  )
}
