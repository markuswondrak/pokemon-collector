import { useCallback, useRef, useState } from 'react'

export interface UseInfiniteScrollOptions<T> {
  /** Initial items to render */
  initialItems: T[]
  /** Callback to load more items */
  loadMore: () => Promise<T[]>
  /** Whether more items can be loaded */
  hasMore: boolean
  /** Initial state of loading flag */
  isLoading?: boolean
}

export interface UseInfiniteScrollReturn<T> {
  /** Currently loaded items */
  loadedItems: T[]
  /** Whether currently loading more items */
  isLoading: boolean
  /** Whether more items can be loaded */
  hasMore: boolean
  /** Error message if loading failed */
  error: string | null
  /** Function to load more items */
  loadMore: () => Promise<void>
}

/**
 * Hook to manage infinite scroll state and pagination
 * 
 * Handles:
 * - Loading additional items from async source
 * - Tracking loading and error states
 * - Managing hasMore flag
 * 
 * @param options Configuration including initial items and loadMore callback
 * @returns Object with loadedItems, isLoading, hasMore, error, and loadMore function
 */
export function useInfiniteScroll<T>({
  initialItems,
  loadMore: loadMoreCallback,
  hasMore: initialHasMore,
  isLoading: initialIsLoading = false,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [loadedItems, setLoadedItems] = useState<T[]>(initialItems)
  const [isLoading, setIsLoading] = useState(initialIsLoading)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    // Prevent duplicate requests
    if (isLoadingRef.current || isLoading || !hasMore) {
      return
    }

    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const newItems = await loadMoreCallback()
      setLoadedItems(prevItems => [...prevItems, ...newItems])

      // If loadMore returned 0 items, assume we've reached the end
      if (newItems.length === 0) {
        setHasMore(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items'
      setError(errorMessage)
      console.error('useInfiniteScroll error:', err)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [isLoading, hasMore, loadMoreCallback])

  return {
    loadedItems,
    isLoading,
    hasMore,
    error,
    loadMore,
  }
}
